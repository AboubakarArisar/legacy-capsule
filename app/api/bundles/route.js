import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bundle from "@/models/Bundle";
import Template from "@/models/Template";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    const query = all ? {} : { isActive: true };
    const bundles = await Bundle.find(query)
      .sort({ createdAt: -1 })
      .populate("templateIds");

    return NextResponse.json({
      success: true,
      bundles: bundles.map((b) => ({
        _id: b._id,
        title: b.title,
        description: b.description,
        isActive: b.isActive,
        bundlePrice: b.bundlePrice,
        originalTotal: b.originalTotal,
        savingsAmount: Math.max(
          0,
          (b.originalTotal || 0) - (b.bundlePrice || 0)
        ),
        savingsPercent: b.savingsPercent,
        templateIds: (b.templateIds || []).map((t) => ({
          _id: t._id,
          title: t.title,
          price: t.price,
          imageUrl: t.imageUrl,
          pdfUrl: t.pdfUrl,
        })),
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { title, description, templateIds, bundlePrice, isActive } =
      body || {};

    if (
      !title ||
      !Array.isArray(templateIds) ||
      templateIds.length < 2 ||
      (!bundlePrice && bundlePrice !== 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: title, templateIds(>=2), bundlePrice",
        },
        { status: 400 }
      );
    }

    const templates = await Template.find({ _id: { $in: templateIds } });
    if (templates.length !== templateIds.length) {
      return NextResponse.json(
        { success: false, error: "One or more templates not found" },
        { status: 400 }
      );
    }

    const originalTotal = templates.reduce(
      (sum, t) => sum + Number(t.price || 0),
      0
    );
    const bundle = new Bundle({
      title,
      description,
      templateIds,
      bundlePrice: Number(bundlePrice),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      originalTotal,
    });

    await bundle.save();

    return NextResponse.json(
      { success: true, bundle: bundle.toObject() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bundle:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create bundle" },
      { status: 500 }
    );
  }
}
