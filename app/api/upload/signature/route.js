import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Log env presence without leaking values
    console.log("[CloudinarySig] envs:", {
      CLOUDINARY_CLOUD_NAME: !!cloudName,
      CLOUDINARY_API_KEY: !!apiKey,
      CLOUDINARY_API_SECRET: !!apiSecret,
      NODE_ENV: process.env.NODE_ENV,
    });

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: "Cloudinary env vars missing on server" },
        { status: 500 }
      );
    }

    let body = {};
    try {
      body = await request.json();
    } catch (_) {}

    const type =
      body?.type === "pdf" ? "pdf" : body?.type === "image" ? "image" : "image";
    const folder =
      body?.folder ||
      (type === "pdf" ? "legacy-capsule/templates" : "legacy-capsule");

    const timestamp = Math.floor(Date.now() / 1000);

    // Build params to sign (alphabetical keys)
    const toSign = new URLSearchParams();
    if (folder) toSign.append("folder", folder);
    toSign.append("timestamp", String(timestamp));

    const signatureBase = toSign.toString() + apiSecret;
    const signature = crypto
      .createHash("sha1")
      .update(signatureBase)
      .digest("hex");

    return NextResponse.json({
      success: true,
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
    });
  } catch (err) {
    console.error("[CloudinarySig] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}
