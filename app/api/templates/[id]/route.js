import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Template from "@/models/Template";

// GET template by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const template = await Template.findById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template: template.toJSON(),
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

// PUT update template
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    const template = await Template.findById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // Update template fields
    Object.keys(body).forEach((key) => {
      if (key !== "_id" && key !== "__v") {
        template[key] = body[key];
      }
    });

    await template.save();

    return NextResponse.json({
      success: true,
      template: template.toJSON(),
    });
  } catch (error) {
    console.error("Error updating template:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE template
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const template = await Template.findById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    await Template.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
