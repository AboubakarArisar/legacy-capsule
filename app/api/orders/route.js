import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

// Helper function to verify JWT token
function verifyToken(request) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId") || user.userId;

    // Only allow users to see their own orders, or admins to see all
    if (user.role !== "admin" && userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let orders;

    if (user.role === "admin") {
      // Admin can see all orders or filter by userId
      if (userId) {
        orders = await Order.findByUserId(userId);
      } else {
        // Get all orders for admin dashboard
        orders = await Order.find({})
          .populate("templateId")
          .sort({ createdAt: -1 });
      }
    } else {
      // Regular user can only see their own orders
      orders = await Order.findByUserId(userId);
    }

    return NextResponse.json({
      success: true,
      orders: orders.map((o) => o.toJSON()),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    // Basic validation
    if (!body.templateId || !body.amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const orderData = {
      userId: user.userId,
      templateId: body.templateId,
      stripeSessionId: body.stripeSessionId || "",
      stripePaymentIntentId: body.stripePaymentIntentId || "",
      amount: parseFloat(body.amount),
      currency: body.currency || "usd",
      status: "pending",
      paymentStatus: "pending",
    };

    const order = new Order(orderData);
    await order.save();

    return NextResponse.json(
      {
        success: true,
        order: order.toJSON(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
