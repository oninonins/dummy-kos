import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySignature } from "@/lib/midtrans";
import { PaymentStatus, ReservationStatus, RoomStatus } from "@prisma/client";

// =============================================================================
// POST /api/webhook/midtrans, Midtrans Payment Notification Handler
// =============================================================================
//
// Midtrans calls this URL asynchronously whenever a payment event occurs.
// It does NOT depend on the user's browser; it works even if the user closed
// their tab immediately after paying.
//
// Security layers:
//   [S1] SHA512 Signature validation: proves the request came from Midtrans
//   [S2] Idempotency guard: prevents duplicate DB updates on retried webhooks
//   [S3] Atomic DB transaction: reservation + room updated together
//
// Midtrans transaction_status values we care about:
//   "capture"    → credit card capture (check fraud_status)
//   "settlement" → final successful payment
//   "pending"    → bank transfer / e-wallet pending
//   "expire"     → Snap token timed out
//   "cancel"     → merchant cancelled
//   "deny"       → card declined / fraud
//
// Response contract:
//   Midtrans expects a 2xx response. If we return 5xx, it will retry
//   the notification up to 5 times (every hour). We return 200 even on
//   error (after logging it) to prevent infinite retry loops.
//
// =============================================================================

export async function POST(request: NextRequest) {
  let orderId = "unknown"; // captured early for logging on catch

  try {
    const notification = await request.json();

    const {
      order_id: rawOrderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
    } = notification;

    orderId = rawOrderId; // assign for catch-block logging

    // -------------------------------------------------------------------------
    // [S1] SIGNATURE VALIDATION
    // Formula (per Midtrans docs):
    //   SHA512( order_id + status_code + gross_amount + SERVER_KEY )
    // If this fails, the request is not from Midtrans, reject it immediately.
    // -------------------------------------------------------------------------
    const isValid = verifySignature(orderId, statusCode, grossAmount, signatureKey);
    if (!isValid) {
      console.error(`[Webhook] INVALID signature for order: ${orderId}`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // -------------------------------------------------------------------------
    // [S2] FIND RESERVATION
    // -------------------------------------------------------------------------
    const reservation = await prisma.reservation.findUnique({
      where: { midtransOrderId: orderId },
      include: { room: true }, // we need roomId and current status
    });

    if (!reservation) {
      // Could be a test notification or a webhook for a deleted reservation
      console.warn(`[Webhook] Reservation not found for order: ${orderId}`);
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    // -------------------------------------------------------------------------
    // [S2] IDEMPOTENCY GUARD
    // Midtrans can and will resend the same notification multiple times.
    // If we already reached a terminal state (PAID or EXPIRED), skip processing
    // and return 200 immediately so Midtrans stops retrying.
    //
    // Terminal states: PAID, EXPIRED, REFUNDED
    // -------------------------------------------------------------------------
    const TERMINAL_STATUSES: PaymentStatus[] = [
      PaymentStatus.PAID,
      PaymentStatus.EXPIRED,
      PaymentStatus.REFUNDED,
    ];
    if (TERMINAL_STATUSES.includes(reservation.paymentStatus)) {
      console.log(`[Webhook] Already at terminal state [${reservation.paymentStatus}], skipping: ${orderId}`);
      return NextResponse.json({ status: "already_processed" });
    }

    // -------------------------------------------------------------------------
    // [S3] PROCESS BASED ON transaction_status
    // -------------------------------------------------------------------------

    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      // -----------------------------------------------------------------------
      // SUCCESS PATH
      // "settlement" = final confirmation for all non-card payments
      // "capture"    = credit card pre-auth; must also pass fraud_status=accept
      // -----------------------------------------------------------------------
      if (transactionStatus === "capture" && fraudStatus !== "accept") {
        console.warn(`[Webhook] Fraud detected [fraud_status=${fraudStatus}] for order: ${orderId}`);
        // Don't BOOKED the room, wait for a "settlement" or let it expire
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { paymentStatus: PaymentStatus.EXPIRED },
        });
        return NextResponse.json({ status: "fraud_flagged" });
      }

      // Atomic: confirm reservation + lock the room as BOOKED
      await prisma.$transaction(async (tx) => {
        await tx.reservation.update({
          where: { id: reservation.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            reservationStatus: ReservationStatus.CONFIRMED,
          },
        });

        await tx.room.update({
          where: { id: reservation.roomId },
          data: { status: RoomStatus.BOOKED },
        });
      });

      console.log(`[Webhook] ✅ PAID & CONFIRMED for order: ${orderId}`);

    } else if (transactionStatus === "pending") {
      // -----------------------------------------------------------------------
      // PENDING PATH, e-wallet or bank transfer initiated, not yet settled
      // Room stays ON_HOLD. Reservation paymentStatus → PENDING.
      // -----------------------------------------------------------------------
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { paymentStatus: PaymentStatus.PENDING },
      });

      console.log(`[Webhook] ⏳ PENDING for order: ${orderId}`);

    } else if (
      transactionStatus === "expire" ||
      transactionStatus === "cancel" ||
      transactionStatus === "deny"
    ) {
      // -----------------------------------------------------------------------
      // FAILURE PATH, Hold expired / payment denied / cancelled
      // Release the room back to AVAILABLE so other users can book it.
      // -----------------------------------------------------------------------
      await prisma.$transaction(async (tx) => {
        await tx.reservation.update({
          where: { id: reservation.id },
          data: {
            paymentStatus: PaymentStatus.EXPIRED,
            reservationStatus: ReservationStatus.EXPIRED,
          },
        });

        // Only release if still ON_HOLD (another webhook might have already changed it)
        await tx.room.updateMany({
          where: {
            id: reservation.roomId,
            status: RoomStatus.ON_HOLD, // Guard against double-release
          },
          data: { status: RoomStatus.AVAILABLE },
        });
      });

      console.log(`[Webhook] ❌ EXPIRED/CANCELLED [${transactionStatus}] for order: ${orderId}`);
    } else {
      // Unknown status, log it for investigation, return 200 to stop retries
      console.warn(`[Webhook] Unknown transaction_status [${transactionStatus}] for order: ${orderId}`);
    }

    // Always return 200 to tell Midtrans we received and processed the notification
    return NextResponse.json({ status: "ok" });

  } catch (error) {
    // Log the full error server-side for debugging
    console.error(`[Webhook] Error processing notification [order=${orderId}]:`, error);

    // Return 200 (not 500!) so Midtrans does not keep retrying indefinitely.
    // The error is logged for manual investigation.
    return NextResponse.json({ status: "error_logged" });
  }
}
