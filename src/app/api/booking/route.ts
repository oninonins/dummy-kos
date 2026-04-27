import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSnapTransaction } from "@/lib/midtrans";
import { RoomStatus, PaymentStatus, ReservationStatus } from "@prisma/client";

// =============================================================================
// POST /api/booking, Initiate a Reservation Hold
// =============================================================================
//
// End-to-end flow handled by this route:
//
//   [1] Parse & validate request body  (roomId, userId)
//   [2] Open a Prisma DB transaction
//       [2a] SELECT room: verify it exists
//       [2b] Optimistic-lock UPDATE: room WHERE status=AVAILABLE → ON_HOLD
//            If count=0, another request won the race → 409 Conflict
//       [2c] SELECT user: get name/email for Midtrans customer_details
//       [2d] INSERT reservation (PENDING/UNPAID) with 30-min holdExpiry
//       [2e] Call Midtrans Snap API → get snapToken
//       [2f] UPDATE reservation with the snapToken
//   [3] Return { snapToken, orderId, amount, holdExpiry } to the client
//
// Security principles applied:
//   • Amount is NEVER read from the request body (server-authoritative pricing)
//   • Optimistic locking prevents double-booking without SELECT FOR UPDATE
//   • All DB writes are atomic: if Midtrans call fails, the transaction rolls back
//
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, userId } = body;

    // -------------------------------------------------------------------------
    // [1] INPUT VALIDATION
    // Simple presence check, in production, use Zod schema validation
    // -------------------------------------------------------------------------
    if (!roomId || typeof roomId !== "string") {
      return NextResponse.json(
        { error: "roomId diperlukan dan harus berupa string" },
        { status: 400 }
      );
    }
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "userId diperlukan dan harus berupa string" },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------------------
    // [2] PRISMA TRANSACTION: Atomic booking + Snap token
    //
    // Why a transaction?
    //   If the Midtrans API call throws (network error, bad key, etc.),
    //   Prisma will automatically ROLLBACK the room status and reservation
    //   insert, leaving the database in a clean state.
    // -------------------------------------------------------------------------
    const result = await prisma.$transaction(async (tx) => {

      // [2a] Fetch room with property details (for Midtrans item_details)
      const room = await tx.room.findUnique({
        where: { id: roomId },
        include: { property: true },
      });

      if (!room) throw new Error("ROOM_NOT_FOUND");

      // [2b] Optimistic lock: atomically transition AVAILABLE → ON_HOLD
      //
      // Pattern explanation:
      //   updateMany with WHERE id=X AND status=AVAILABLE
      //   → returns { count: 1 } on success
      //   → returns { count: 0 } if another request already grabbed the room
      //
      // This avoids SELECT FOR UPDATE (which requires Prisma's $queryRaw and
      // is dialect-specific). The WHERE status=AVAILABLE acts as our lock.
      const lockResult = await tx.room.updateMany({
        where: {
          id: roomId,
          status: RoomStatus.AVAILABLE, // Guard: only proceed if still free
        },
        data: {
          status: RoomStatus.ON_HOLD,
        },
      });

      if (lockResult.count === 0) {
        // Either already ON_HOLD or BOOKED, both are "not available" to us
        throw new Error("ROOM_NOT_AVAILABLE");
      }

      // [2c] Fetch user for Midtrans customer_details
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        // The room was already moved to ON_HOLD above.
        // Since we are inside a transaction, throwing here will roll it back.
        throw new Error("USER_NOT_FOUND");
      }

      // [2d] Generate unique Midtrans order ID
      //   Format: HOLD-<last6 of roomId>-<unix_ms>
      //   e.g.    HOLD-abc123-1714123456789
      const orderId = `HOLD-${roomId.slice(-6).toUpperCase()}-${Date.now()}`;
      const holdExpiry = new Date(Date.now() + 30 * 60 * 1_000); // +30 min
      const amount = room.depositAmount; // always server-controlled ✓

      // [2d] Insert the reservation record
      const reservation = await tx.reservation.create({
        data: {
          userId,
          roomId,
          amount,
          holdExpiry,
          reservationStatus: ReservationStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
          midtransOrderId: orderId,
          // midtransSnapToken will be set in [2f] below
        },
      });

      // [2e] Request Snap token from Midtrans
      //   If this throws (e.g. invalid server key, Midtrans outage),
      //   the entire transaction rolls back, no orphaned ON_HOLD room.
      const snapResponse = await createSnapTransaction({
        orderId,
        grossAmount: amount,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone ?? undefined,
        itemName: `Deposit – Kamar ${room.roomNumber} (${room.property.name})`,
      });

      // [2f] Persist the snapToken so we can re-use it without another API call
      await tx.reservation.update({
        where: { id: reservation.id },
        data: { midtransSnapToken: snapResponse.token },
      });

      return {
        reservationId: reservation.id,
        orderId,
        snapToken: snapResponse.token,
        redirectUrl: snapResponse.redirect_url,
        amount,
        holdExpiry: holdExpiry.toISOString(),
        roomNumber: room.roomNumber,
        propertyName: room.property.name,
      };
    }); // end $transaction

    // [3] Return success response
    return NextResponse.json({ success: true, data: result }, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "UNKNOWN";

    // Map our internal error codes → HTTP responses
    const HTTP_ERROR_MAP: Record<string, { status: number; message: string }> = {
      ROOM_NOT_FOUND:     { status: 404, message: "Kamar tidak ditemukan." },
      ROOM_NOT_AVAILABLE: { status: 409, message: "Kamar sudah tidak tersedia. Silakan pilih kamar lain." },
      USER_NOT_FOUND:     { status: 404, message: "Akun pengguna tidak ditemukan." },
    };

    const mapped = HTTP_ERROR_MAP[message];
    if (mapped) {
      return NextResponse.json({ error: mapped.message }, { status: mapped.status });
    }

    // Unexpected error, log full details server-side, return generic response
    console.error("[POST /api/booking] Unexpected error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
