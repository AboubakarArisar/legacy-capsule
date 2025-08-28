import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Template from "@/models/Template";
import Order from "@/models/Order";
import Bundle from "@/models/Bundle";
import Stripe from "stripe";
import jwt from "jsonwebtoken";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

function getUserFromRequest(request) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    return decoded; // { userId, role, ... }
  } catch (_) {
    return null;
  }
}

export async function POST(request) {
  try {
    if (!STRIPE_KEY) {
      return NextResponse.json(
        { success: false, error: "Missing STRIPE_SECRET_KEY in environment" },
        { status: 500 }
      );
    }

    const user = getUserFromRequest(request);
    if (!user?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: please log in to purchase" },
        { status: 401 }
      );
    }

    const stripe = new Stripe(STRIPE_KEY);

    await connectDB();
    const body = await request.json();

    const { templateId, bundleId, successUrl, cancelUrl } = body || {};

    if ((!templateId && !bundleId) || !successUrl || !cancelUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: (templateId or bundleId), successUrl, cancelUrl",
        },
        { status: 400 }
      );
    }

    // Normalize success/cancel URLs and append session placeholder
    const successUrlWithSession = successUrl.includes("?")
      ? `${successUrl}&session_id={CHECKOUT_SESSION_ID}`
      : `${successUrl}?session_id={CHECKOUT_SESSION_ID}`;

    let session;
    let order;

    if (bundleId) {
      // Bundle purchase
      const bundle = await Bundle.findById(bundleId).populate("templateIds");
      if (!bundle || !bundle.isActive) {
        return NextResponse.json(
          { success: false, error: "Bundle not found or inactive" },
          { status: 404 }
        );
      }

      const unitAmount = Math.round(Number(bundle.bundlePrice) * 100);
      if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        return NextResponse.json(
          { success: false, error: "Invalid bundle price" },
          { status: 400 }
        );
      }

      try {
        session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Bundle: ${bundle.title}`,
                  description: bundle.description?.slice(0, 500) || undefined,
                },
                unit_amount: unitAmount,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: successUrlWithSession,
          cancel_url: cancelUrl,
          metadata: {
            bundleId: String(bundle._id),
            templateIds: bundle.templateIds.map((t) => String(t._id)).join(","),
            userId: String(user.userId),
          },
        });
      } catch (stripeErr) {
        return NextResponse.json(
          {
            success: false,
            error: `Stripe error: ${stripeErr.message || "Unknown"}`,
          },
          { status: 500 }
        );
      }

      order = new Order({
        userId: user.userId,
        bundleId: bundle._id,
        templateIdsPurchased: bundle.templateIds.map((t) => t._id),
        stripeSessionId: session.id,
        amount: Number(bundle.bundlePrice),
        currency: "usd",
        status: "pending",
        paymentStatus: "pending",
      });
    } else {
      // Single template purchase
      const template = await Template.findById(templateId);
      if (!template || !template.isActive) {
        return NextResponse.json(
          { success: false, error: "Template not found or inactive" },
          { status: 404 }
        );
      }

      const unitAmount = Math.round(Number(template.price) * 100);
      if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        return NextResponse.json(
          { success: false, error: "Invalid template price" },
          { status: 400 }
        );
      }

      try {
        session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: template.title,
                  description: template.description?.slice(0, 500) || undefined,
                  images: template.imageUrl ? [template.imageUrl] : undefined,
                },
                unit_amount: unitAmount,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: successUrlWithSession,
          cancel_url: cancelUrl,
          metadata: {
            templateId: String(templateId),
            userId: String(user.userId),
          },
        });
      } catch (stripeErr) {
        return NextResponse.json(
          {
            success: false,
            error: `Stripe error: ${stripeErr.message || "Unknown"}`,
          },
          { status: 500 }
        );
      }

      order = new Order({
        userId: user.userId,
        templateId: templateId,
        stripeSessionId: session.id,
        amount: Number(template.price),
        currency: "usd",
        status: "pending",
        paymentStatus: "pending",
      });
    }

    await order.save();

    return NextResponse.json({
      success: true,
      sessionUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error creating payment session:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create payment session: ${
          error.message || "Unknown"
        }`,
      },
      { status: 500 }
    );
  }
}
