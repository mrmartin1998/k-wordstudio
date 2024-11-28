import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Text from '@/models/Text';

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = params;
  const updates = await request.json();
  
  const text = await Text.findByIdAndUpdate(
    id,
    updates,
    { new: true }
  );
  
  if (!text) {
    return NextResponse.json(
      { error: 'Text not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(text);
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = params;
  
  const text = await Text.findByIdAndDelete(id);
  
  if (!text) {
    return NextResponse.json(
      { error: 'Text not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true });
} 