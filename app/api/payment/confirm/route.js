import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Template from "@/models/Template";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

export async function GET(request) {
  try {
    if (!STRIPE_KEY) {
      return NextResponse.json(
        { success: false, error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }
    const stripe = new Stripe(STRIPE_KEY);

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing session_id" },
        { status: 400 }
      );
    }

    await connectDB();

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 400 }
      );
    }

    // Find the order by session
    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // If paid, mark completed and return download link
    if (session.payment_status === "paid") {
      order.status = "completed";
      order.paymentStatus = "paid";
      order.stripePaymentIntentId = session.payment_intent?.toString();
      await order.save();

      const template = await Template.findById(order.templateId);
      if (!template) {
        return NextResponse.json(
          { success: false, error: "Template not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        downloadUrl: template.pdfUrl,
        templateTitle: template.title,
      });
    }

    return NextResponse.json(
      { success: false, error: "Payment not completed" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Confirm error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
