const crypto = require('crypto');
const { stripe } = require('../services/paymentService');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Payment = require('../models/paymentModel');
const MagicLink = require('../models/magicLinkModel');
const { markOrderPaidService } = require('../services/orderService');
const { sendEmail } = require('../utils/email');

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

const stripeWebhookHandler = async (req, res) => {
  if (!stripe) {
    return res.status(500).send('Stripe is not configured');
  }

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe signature verification failed:', err.message);
    return res.status(400).send('Webhook Error');
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { orderId, orderType } = session.metadata || {};

      if (!orderId) {
        return res.json({ received: true });
      }

      const order = await Order.findById(orderId).populate('productId').lean();
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.status === 'PAID') {
        return res.json({ received: true });
      }

      const expectedAmount = Math.round(Number(order.totalAmount) * 100);
      if (session.amount_total !== expectedAmount) {
        return res.status(400).json({ message: 'Amount mismatch' });
      }

      const addr = session.shipping_details?.address;

      await Order.updateOne(
        { _id: orderId },
        {
          $set: {
            orderType: orderType || 'DIGITAL',
            shippingName: session.shipping_details?.name || '',
            shippingLine1: addr?.line1 || '',
            shippingCity: addr?.city || '',
            shippingState: addr?.state || '',
            shippingZip: addr?.postal_code || '',
            shippingCountry: addr?.country || '',
            stripePaymentIntent: String(session.payment_intent || ''),
          },
        }
      );

      await markOrderPaidService(orderId);

      await Payment.create({
        orderId,
        provider: 'stripe',
        providerPaymentId: String(session.payment_intent || ''),
        status: 'SUCCESS',
      });

      const buyerEmail = order.buyerEmail || session.customer_email;
      const productTitle = order.productId?.title || 'Your purchase';

      if (orderType === 'PHYSICAL') {
        if (buyerEmail) {
          await sendEmail(
            buyerEmail,
            `Order confirmed — ${productTitle}`,
            `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
              <h1 style="color:#6c47ff;">Order Confirmed! 📦</h1>
              <p>Your order for <strong>${productTitle}</strong> has been placed.</p>
              <div style="background:#f0ecff;padding:20px;border-radius:12px;margin:24px 0;">
                <p><strong>Amount paid:</strong> $${Number(order.totalAmount).toFixed(2)}</p>
                <p><strong>Ships in:</strong> ${order.productId?.shipsInDays ?? 3} business days</p>
              </div>
              <p style="color:#999;font-size:12px;">You will receive another email with your tracking number once shipped.</p>
            </div>`
          ).catch((emailErr) => console.error('Email failed:', emailErr.message));
        }
      } else {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await MagicLink.findOneAndUpdate(
          { orderId },
          { token, expiresAt },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const accessUrl = `${frontendUrl}/access?token=${token}`;

        if (buyerEmail) {
          await sendEmail(
            buyerEmail,
            `Your purchase of "${productTitle}" is confirmed!`,
            `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
              <h1 style="color:#6c47ff;">Thank you for your purchase! 🎉</h1>
              <p>Your order for <strong>${productTitle}</strong> has been confirmed.</p>
              <a href="${accessUrl}" style="display:inline-block;background:#6c47ff;color:white;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:16px;">
                Access Your Purchase →
              </a>
              <p style="color:#999;font-size:12px;margin-top:24px;">This link expires in 30 days.</p>
            </div>`
          ).catch((emailErr) => console.error('Email failed:', emailErr.message));
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const { orderId } = session.metadata || {};

      if (orderId) {
        const order = await Order.findOne({ _id: orderId, status: 'PENDING' });
        if (order) {
          if (order.orderType === 'PHYSICAL') {
            await Product.updateOne(
              { _id: order.productId, inventory: { $ne: null } },
              { $inc: { inventory: 1 } }
            );
          }
          order.status = 'CANCELLED';
          await order.save();
        }
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
};

module.exports = {
  stripeWebhookHandler,
};
