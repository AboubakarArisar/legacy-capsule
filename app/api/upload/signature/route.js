import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

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
    const folder = (
      body?.folder ||
      (type === "pdf" ? "legacy-capsule/templates" : "legacy-capsule")
    ).toString();
    const publicId = body?.public_id ? String(body.public_id) : undefined;

    const timestamp = Math.floor(Date.now() / 1000);

    // Build params to sign (ALPHABETICAL keys, NO URL ENCODING)
    const params = { folder, timestamp: String(timestamp) };
    if (publicId) params.public_id = publicId;

    const keys = Object.keys(params).sort();
    const stringToSign = keys.map((k) => `${k}=${params[k]}`).join("&");

    const signature = crypto
      .createHash("sha1")
      .update(stringToSign + apiSecret)
      .digest("hex");

    console.log("[CloudinarySig] string_to_sign:", stringToSign);
    console.log("[CloudinarySig] signature (first8):", signature.slice(0, 8));

    return NextResponse.json({
      success: true,
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      public_id: publicId,
    });
  } catch (err) {
    console.error("[CloudinarySig] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}
