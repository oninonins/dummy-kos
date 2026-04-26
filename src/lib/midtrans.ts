import crypto from "crypto";

// =============================================================================
// lib/midtrans.ts — Midtrans Snap Client & Helpers
// =============================================================================
//
// This module is the single integration point for Midtrans in our app.
// Responsibilities:
//   1. Snap client initialisation (server-side only)
//   2. createSnapTransaction() — creates a payment session
//   3. verifySignature()       — validates webhook authenticity
//
// Environment variables required (see .env.example):
//   MIDTRANS_SERVER_KEY       — starts with "SB-Mid-server-..." (sandbox)
//   MIDTRANS_CLIENT_KEY       — starts with "SB-Mid-client-..." (sandbox)
//   MIDTRANS_IS_PRODUCTION    — "true" | "false"
//   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY — same as CLIENT_KEY, exposed to browser
//
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client");

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

// Initialise once — this is safe because this file is only imported server-side
// (API routes / Server Actions / Server Components).
export const snap = new midtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

// =============================================================================
// Types
// =============================================================================

export interface SnapTransactionParams {
  orderId: string;      // unique order identifier (e.g. "HOLD-ABC123-1714000000000")
  grossAmount: number;  // total charge in IDR (integer, no cents)
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  itemName: string;     // shown on the Snap payment page
}

export interface SnapTransactionResult {
  token: string;        // e.g. "66e4fa55-fdac-4ef9-91a5-0c26..."
  redirect_url: string; // fallback full-page payment URL
}

// =============================================================================
// createSnapTransaction
// =============================================================================
//
// Calls the Midtrans Snap API and returns:
//   { token }        — used by window.snap.pay() on the client
//   { redirect_url } — fallback if Snap popup doesn't load
//
// Midtrans will:
//   - Validate the order_id is unique (throws if reused)
//   - Validate the customer details
//   - Return a 15-minute payment token (configurable via `expiry`)
//
// =============================================================================

export async function createSnapTransaction(
  params: SnapTransactionParams
): Promise<SnapTransactionResult> {
  const {
    orderId,
    grossAmount,
    customerName,
    customerEmail,
    customerPhone,
    itemName,
  } = params;

  const transactionPayload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: customerName,
      email: customerEmail,
      phone: customerPhone ?? "",
    },
    item_details: [
      {
        id: orderId,
        price: grossAmount,
        quantity: 1,
        name: itemName,
      },
    ],
    // Token expires in 30 minutes — matching our holdExpiry duration.
    // After expiry, Midtrans sends a webhook with transaction_status=expire.
    expiry: {
      unit: "minutes",
      duration: 30,
    },
    // Enabled payment methods (add/remove as needed for your sandbox account)
    enabled_payments: [
      "credit_card",
      "bca_va",
      "bni_va",
      "bri_va",
      "mandiri_clickpay",
      "gopay",
      "shopeepay",
      "qris",
    ],
  };

  const response = await snap.createTransaction(transactionPayload);
  return response as SnapTransactionResult;
}

// =============================================================================
// verifySignature
// =============================================================================
//
// Validates an incoming webhook notification from Midtrans.
//
// Midtrans attaches a SHA512 signature to every notification:
//   signature_key = SHA512( order_id + status_code + gross_amount + server_key )
//
// We recompute the same hash locally and compare with timing-safe equality
// to prevent timing-based side-channel attacks.
//
// Returns true only if the signature matches.
//
// =============================================================================

export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  incomingSignature: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;

  const expected = crypto
    .createHash("sha512")
    .update(payload)
    .digest("hex");

  // timingSafeEqual prevents timing attacks where an attacker could infer the
  // correct signature by measuring response time differences character by character.
  if (expected.length !== incomingSignature.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(incomingSignature)
  );
}
