import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bundle from "@/models/Bundle";
import Template from "@/models/Template";

export async function GET(_request, { params }) {
  try {
    await connectDB();
    const bundle = await Bundle.findById(params.id).populate("templateIds");
    if (!bundle) {
      return NextResponse.json(
        { success: false, error: "Bundle not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, bundle });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundle" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, description, templateIds, bundlePrice, isActive } =
      body || {};

    const bundle = await Bundle.findById(params.id);
    if (!bundle) {
      return NextResponse.json(
        { success: false, error: "Bundle not found" },
        { status: 404 }
      );
    }

    if (
      templateIds &&
      (!Array.isArray(templateIds) || templateIds.length < 2)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "templateIds must include at least two templates",
        },
        { status: 400 }
      );
    }

    let originalTotal = bundle.originalTotal;
    if (templateIds) {
      const templates = await Template.find({ _id: { $in: templateIds } });
      if (templates.length !== templateIds.length) {
        return NextResponse.json(
          { success: false, error: "One or more templates not found" },
          { status: 400 }
        );
      }
      originalTotal = templates.reduce(
        (sum, t) => sum + Number(t.price || 0),
        0
      );
      bundle.templateIds = templateIds;
    }

    if (title !== undefined) bundle.title = title;
    if (description !== undefined) bundle.description = description;
    if (bundlePrice !== undefined) bundle.bundlePrice = Number(bundlePrice);
    if (isActive !== undefined) bundle.isActive = Boolean(isActive);

    bundle.originalTotal = originalTotal;

    await bundle.save();

    return NextResponse.json({ success: true, bundle });
  } catch (error) {
    console.error("Error updating bundle:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update bundle" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    await connectDB();
    const res = await Bundle.deleteOne({ _id: params.id });
    if (res.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Bundle not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bundle:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete bundle" },
      { status: 500 }
    );
  }
}
