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

// GET order by ID
export async function GET(request, { params }) {
  try {
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = params;

    const order = await Order.findById(id).populate("templateId");
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Only allow users to see their own orders, or admins to see all
    if (user.role !== "admin" && order.userId.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      order: order.toJSON(),
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT update order
export async function PUT(request, { params }) {
  try {
    const user = verifyToken(request);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = params;
    const body = await request.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order fields
    Object.keys(body).forEach((key) => {
      if (key !== "_id" && key !== "__v" && key !== "userId") {
        order[key] = body[key];
      }
    });

    await order.save();

    return NextResponse.json({
      success: true,
      order: order.toJSON(),
    });
  } catch (error) {
    console.error("Error updating order:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
