import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/lib/mongodb";

// Configure Cloudinary using URL
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
} else {
  // Fallback to individual keys if URL not provided
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("pdf");
    const previewImage = formData.get("previewImage");
    const templateData = JSON.parse(formData.get("templateData"));

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No PDF file provided" },
        { status: 400 }
      );
    }

    // Validate PDF file type
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { success: false, error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate PDF file size (max 50MB)
    const maxPdfSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxPdfSize) {
      return NextResponse.json(
        {
          success: false,
          error: "PDF file size too large. Maximum size is 50MB",
        },
        { status: 400 }
      );
    }

    // Upload PDF to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: "legacy-capsule/templates",
            public_id: `template_${Date.now()}_${file.name.replace(
              ".pdf",
              ""
            )}`,
            format: "pdf",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    // Upload preview image if provided
    let imageUrl = "";
    if (previewImage && previewImage.size > 0) {
      const imageBytes = await previewImage.arrayBuffer();
      const imageBuffer = Buffer.from(imageBytes);

      const imageResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "legacy-capsule/previews",
              public_id: `preview_${Date.now()}_${previewImage.name.replace(
                /\.[^/.]+$/,
                ""
              )}`,
              transformation: [{ width: 800, height: 600, crop: "fill" }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(imageBuffer);
      });

      imageUrl = imageResult.secure_url;
    }

    // Create template with simple URL fields
    const template = {
      ...templateData,
      pdfUrl: uploadResult.secure_url,
      imageUrl: imageUrl || uploadResult.secure_url, // Use PDF URL as fallback if no image
      price: parseFloat(templateData.price),
      features: templateData.features.filter((f) => f.trim() !== ""),
    };

    // Import Template model here to avoid circular dependency
    const { default: Template } = await import("@/models/Template");

    const newTemplate = new Template(template);
    await newTemplate.save();

    return NextResponse.json({
      success: true,
      template: newTemplate.toJSON(),
      message: "Template created successfully",
    });
  } catch (error) {
    console.error("Error uploading PDF and creating template:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: "Template validation failed: " + error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to upload PDF and create template" },
      { status: 500 }
    );
  }
}
