import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CustomRequest from "@/models/customRequest";

export async function GET() {
  try {
    await connectDB();
    const requests = await CustomRequest.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { Name, Email, TemplateDescription } = body || {};

    if (!Name || !Email || !TemplateDescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, Email, and TemplateDescription are required",
        },
        { status: 400 }
      );
    }

    const doc = await CustomRequest.create({
      Name,
      Email,
      TemplateDescription,
    });

    return NextResponse.json({ success: true, request: doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create request" },
      { status: 500 }
    );
  }
}
