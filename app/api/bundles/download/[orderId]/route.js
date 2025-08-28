import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Template from "@/models/Template";
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
    const { orderId } = params;

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (String(order.userId) !== String(user.userId) && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    if (
      !order.bundleId ||
      !Array.isArray(order.templateIdsPurchased) ||
      order.templateIdsPurchased.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "This order is not a bundle purchase" },
        { status: 400 }
      );
    }

    // Collect template PDF URLs
    const templates = await Template.find({
      _id: { $in: order.templateIdsPurchased },
    });
    if (!templates || templates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No templates found for this order" },
        { status: 404 }
      );
    }

    const links = templates
      .map((t) => {
        const safeTitle = (t.title || "template").replace(/[^a-zA-Z0-9]/g, "_");
        const href = t.pdfUrl;
        return `<li style="margin:8px 0"><a href="${href}" target="_blank" rel="noopener">Download ${safeTitle}.pdf</a></li>`;
      })
      .join("");

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bundle Downloads</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; background:#f8fafc; color:#0f172a; }
      .container { max-width: 720px; margin: 40px auto; background:#fff; border-radius:12px; padding:24px; box-shadow: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1); }
      .badge { display:inline-block; padding:4px 10px; border-radius:9999px; background:#fee2e2; color:#b91c1c; font-size:12px; font-weight:600; }
      .btn { display:inline-block; padding:10px 16px; background:#2563eb; color:white; border-radius:8px; text-decoration:none; }
      ul { list-style: disc; padding-left: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 style="font-size:24px; font-weight:700; margin:0 0 8px 0;">Your Bundle is Ready</h1>
      <p style="margin:0 0 8px 0">Click each link below to download the templates included in your bundle.</p>
      <p style="margin:0 0 16px 0"><span class="badge">Note</span> For now, downloads are provided as individual files.</p>
      <ul>
        ${links}
      </ul>
      <div style="margin-top:16px;"><a class="btn" href="/">Return Home</a></div>
    </div>
  </body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Bundle download error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate bundle download" },
      { status: 500 }
    );
  }
}
