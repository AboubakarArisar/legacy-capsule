import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Template from '@/models/Template';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let templates;
    
    if (search) {
      // Search templates
      templates = await Template.search(search);
    } else if (category) {
      // Get templates by category
      templates = await Template.getByCategory(category);
    } else {
      // Get all active templates
      templates = await Template.getActiveTemplates();
    }
    
    return NextResponse.json({
      success: true,
      templates: templates.map(template => template.toJSON())
    });
    
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Basic validation
    if (!body.title || !body.description || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new template
    const template = new Template(body);
    await template.save();
    
    return NextResponse.json({
      success: true,
      template: template.toJSON()
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating template:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
 