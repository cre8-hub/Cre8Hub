import { Request, Response } from "express";
import Stripe from "stripe";
import { pool } from "../../config/db";
import { v4 as uuid } from "uuid";
import crypto from "crypto";
import { markOrderPaidService } from "../orders/order.service";
import { sendEmail } from "../../utils/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-01-28.clover",
});

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return res.status(400).send("Webhook Error");
  }

  try {
    // ── checkout.session.completed ──────────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { orderId, orderType } = session.metadata ?? {};

      if (!orderId) {
        console.error("❌ No orderId in metadata");
        return res.json({ received: true });
      }

      // Fetch order + product info
      const orderRes = await pool.query(
        `SELECT o.*, p.title AS product_title, p.ships_in_days
         FROM orders o
         JOIN products p ON o.product_id = p.id
         WHERE o.id = $1`,
        [orderId]
      );

      if (!orderRes.rows.length) {
        console.error("❌ Order not found:", orderId);
        return res.status(404).json({ message: "Order not found" });
      }

      const order = orderRes.rows[0];

      // Idempotency
      if (order.status === "PAID") return res.json({ received: true });

      // Amount check
      const expectedAmount = Math.round(Number(order.total_amount) * 100);
      if (session.amount_total !== expectedAmount) {
        console.error("❌ Amount mismatch for order:", orderId);
        return res.status(400).json({ message: "Amount mismatch" });
      }

      // ── Save shipping address for physical orders ──────────────────
      const sessionAny = session as any;
      const addr = sessionAny.shipping_details?.address;
      await pool.query(
        `UPDATE orders SET
           order_type        = $2,
           shipping_name     = $3,
           shipping_line1    = $4,
           shipping_city     = $5,
           shipping_state    = $6,
           shipping_zip      = $7,
           shipping_country  = $8
         WHERE id = $1`,
        [
          orderId,
          orderType || "DIGITAL",
          sessionAny.shipping_details?.name ?? null,
          addr?.line1 ?? null,
          addr?.city ?? null,
          addr?.state ?? null,
          addr?.postal_code ?? null,
          addr?.country ?? null,
        ]
      );

      // ✅ Mark order paid (5% fee, payout ledger)
      await markOrderPaidService(orderId);

      // Store Stripe payment record
      await pool.query(
        `INSERT INTO payments (id, order_id, provider, provider_payment_id, status)
         VALUES ($1, $2, 'stripe', $3, 'SUCCESS')`,
        [uuid(), orderId, session.payment_intent]
      );

      const buyerEmail = order.user_email || session.customer_email;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      if (orderType === "PHYSICAL") {
        // ── PHYSICAL: send shipping confirmation ──────────────────────
        if (buyerEmail) {
          await sendEmail(
            buyerEmail,
            `Order confirmed — ${order.product_title}`,
            `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
              <h1 style="color:#6c47ff;">Order Confirmed! 📦</h1>
              <p>Your order for <strong>${order.product_title}</strong> has been placed.</p>
              <div style="background:#f0ecff;padding:20px;border-radius:12px;margin:24px 0;">
                <p><strong>Amount paid:</strong> $${Number(order.total_amount).toFixed(2)}</p>
                <p><strong>Ships in:</strong> ${order.ships_in_days ?? 3} business days</p>
                ${addr ? `<p><strong>Shipping to:</strong> ${addr.line1}, ${addr.city}, ${addr.state} ${addr.postal_code}, ${addr.country}</p>` : ""}

              </div>
              <p style="color:#999;font-size:12px;">You will receive another email with your tracking number once shipped.</p>
            </div>`
          ).catch(e => console.error("⚠️ Email failed:", e.message));
        }
        console.log("✅ Physical order processed:", orderId);

      } else {
        // ── DIGITAL: generate magic link + send download email ─────────
        const token = crypto.randomBytes(32).toString("hex");
        await pool.query(
          `INSERT INTO magic_links (id, order_id, token, expires_at)
           VALUES ($1, $2, $3, now() + interval '30 days')`,
          [uuid(), orderId, token]
        );

        const accessUrl = `${frontendUrl}/access?token=${token}`;

        if (buyerEmail) {
          await sendEmail(
            buyerEmail,
            `Your purchase of "${order.product_title}" is confirmed!`,
            `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
              <h1 style="color:#6c47ff;">Thank you for your purchase! 🎉</h1>
              <p>Your order for <strong>${order.product_title}</strong> has been confirmed.</p>
              <div style="background:#f0ecff;padding:20px;border-radius:12px;margin:24px 0;">
                <p style="margin:0;font-size:14px;color:#6c47ff;font-weight:600;">${order.product_title}</p>
                <p style="margin:4px 0 0;font-size:14px;color:#555;">Amount paid: $${Number(order.total_amount).toFixed(2)}</p>
              </div>
              <a href="${accessUrl}" style="display:inline-block;background:#6c47ff;color:white;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:16px;">
                Access Your Purchase →
              </a>
              <p style="color:#999;font-size:12px;margin-top:24px;">This link expires in 30 days.</p>
            </div>`
          ).catch(e => console.error("⚠️ Email failed:", e.message));
        }
        console.log("✅ Digital order processed:", orderId);
      }
    }

    // ── checkout.session.expired → restore inventory ─────────────────
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { orderId } = session.metadata ?? {};
      if (orderId) {
        const orderRes = await pool.query(
          `SELECT product_id, order_type FROM orders WHERE id=$1 AND status='PENDING'`,
          [orderId]
        );
        if (orderRes.rows.length) {
          const { product_id, order_type } = orderRes.rows[0];
          // Restore inventory if this was a physical product reservation
          if (order_type === "PHYSICAL") {
            await pool.query(
              `UPDATE products SET inventory = inventory + 1 WHERE id = $1 AND inventory IS NOT NULL`,
              [product_id]
            );
          }
          await pool.query(`UPDATE orders SET status='CANCELLED' WHERE id=$1`, [orderId]);
          console.log("♻️ Inventory restored + order cancelled:", orderId);
        }
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook processing error:", err.message);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};