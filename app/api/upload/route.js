import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (supports either CLOUDINARY_URL or individual keys)
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

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

    const name = (file.name || "upload").toString();
    const isPdf =
      (file.type && file.type.toLowerCase().includes("pdf")) ||
      /\.pdf$/i.test(name);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with correct resource_type and public type
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            // For PDFs force raw, for others let Cloudinary detect or use image
            resource_type: isPdf ? "raw" : "auto",
            type: "upload",
            folder: isPdf ? "legacy-capsule/templates" : "legacy-capsule",
            public_id: name.replace(/\.[^./]+$/, ""),
            overwrite: true,
          },
          (error, res) => (error ? reject(error) : resolve(res))
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
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
