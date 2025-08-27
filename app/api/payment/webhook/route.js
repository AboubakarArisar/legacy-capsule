import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "No signature provided" },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;

      case "payment_intent.payment_failed":
        const paymentIntent = event.data.object;
        await handlePaymentFailed(paymentIntent);
        break;

      case "charge.refunded":
        const charge = event.data.object;
        await handleRefund(charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session) {
  try {
    const order = await Order.findByStripeSessionId(session.id);
    if (order) {
      order.status = "completed";
      order.paymentStatus = "paid";
      order.stripePaymentIntentId = session.payment_intent;
      await order.save();

      console.log(`Order ${order._id} marked as completed`);
    }
  } catch (error) {
    console.error("Error handling checkout session completed:", error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  try {
    const order = await Order.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (order) {
      order.status = "failed";
      order.paymentStatus = "failed";
      await order.save();

      console.log(`Order ${order._id} marked as failed`);
    }
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

async function handleRefund(charge) {
  try {
    const order = await Order.findOne({
      stripePaymentIntentId: charge.payment_intent,
    });

    if (order) {
      order.paymentStatus = "refunded";
      await order.save();

      console.log(`Order ${order._id} marked as refunded`);
    }
  } catch (error) {
    console.error("Error handling refund:", error);
  }
}
