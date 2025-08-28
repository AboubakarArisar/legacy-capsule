import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (supports either CLOUDINARY_URL or individual keys)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Check file size (Vercel limit is 4.5MB for serverless functions)
    const maxSize = 4 * 1024 * 1024; // 4MB limit
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    const name = (file.name || "upload").toString();
    const isPdf =
      (file.type && file.type.toLowerCase().includes("pdf")) ||
      /\.pdf$/i.test(name);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(
      `Uploading file: ${name}, size: ${file.size}, type: ${file.type}`
    );

    // Upload to Cloudinary with correct resource_type and public type
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            // For PDFs force raw, for others let Cloudinary detect or use image
            resource_type: isPdf ? "raw" : "auto",
            type: "upload",
            folder: isPdf ? "legacy-capsule/templates" : "legacy-capsule",
            public_id: isPdf
              ? name.replace(/\.[^./]+$/, "") + ".pdf"
              : name.replace(/\.[^./]+$/, ""),
            overwrite: true,
          },
          (error, res) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log("Upload successful:", res.public_id);
              resolve(res);
            }
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      secure_url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      resource_type: result.resource_type,
      type: result.type,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Provide more specific error messages
    let errorMessage = "Upload failed";
    if (error.message) {
      errorMessage = error.message;
    } else if (error.http_code) {
      errorMessage = `Cloudinary error: ${error.http_code}`;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
