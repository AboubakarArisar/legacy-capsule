import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Template from "@/models/Template";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

function verifyToken(request) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    return decoded;
  } catch (_) {
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

    const template = await Template.findById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

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

    await template.incrementDownloadCount();

    const sourceUrl = template.pdfUrl?.toString() || "";
    if (!sourceUrl) {
      return NextResponse.json(
        { success: false, error: "No PDF URL stored for this template" },
        { status: 500 }
      );
    }

    // Fetch the PDF on the server (no credentials) and stream it back
    const upstream = await fetch(sourceUrl, {
      cache: "no-store",
      credentials: "omit",
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { success: false, error: `Source fetch failed: ${upstream.status}` },
        { status: 502 }
      );
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const fileName = `${(template.title || "template").replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}.pdf`;

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(arrayBuffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error downloading template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download template" },
      { status: 500 }
    );
  }
}

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

    const template = await Template.findById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

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

    await template.incrementDownloadCount();

    // Provide JSON meta for clients that want the raw URL
    return NextResponse.json({
      success: true,
      downloadUrl: template.pdfUrl,
      fileName: `${(template.title || "template").replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}`,
      message: "Download link generated successfully",
    });
  } catch (error) {
    console.error("Error generating download link:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}
