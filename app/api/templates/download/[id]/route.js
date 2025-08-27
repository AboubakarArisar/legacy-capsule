import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Template from "@/models/Template";
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

export async function GET(request, { params }) {
  try {
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = params;

    // Find the template
    const template = await Template.findById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // Check if user has purchased this template
    const order = await Order.findOne({
      userId: user.userId,
      templateId: id,
      status: "completed",
    });

    if (!order && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Purchase required to download this template",
        },
        { status: 403 }
      );
    }

    // Increment download count
    await template.incrementDownloadCount();

    // Return the PDF file URL and metadata
    return NextResponse.json({
      success: true,
      downloadUrl: template.pdfUrl,
      fileName: template.title + '.pdf',
      message: 'Download link generated successfully'
    });
  } catch (error) {
    console.error("Error generating download link:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}

// Direct file download endpoint (for admin or after verification)
export async function POST(request, { params }) {
  try {
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = params;

    // Find the template
    const template = await Template.findById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // Check if user has purchased this template or is admin
    const order = await Order.findOne({
      userId: user.userId,
      templateId: id,
      status: "completed",
    });

    if (!order && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Purchase required to download this template",
        },
        { status: 403 }
      );
    }

    // Increment download count
    await template.incrementDownloadCount();

    // Redirect to the actual PDF file
    return NextResponse.redirect(template.pdfFile.url);
  } catch (error) {
    console.error("Error downloading template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download template" },
      { status: 500 }
    );
  }
}
 