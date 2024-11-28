import dbConnect from '@/lib/db';
import Text from '@/models/Text';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const texts = await Text.find({}).sort({ dateAdded: -1 });
    return NextResponse.json(texts);
  } catch (error) {
    console.error('Failed to fetch texts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch texts' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const text = await Text.create(data);
    return NextResponse.json(text);
  } catch (error) {
    console.error('Failed to create text:', error);
    return NextResponse.json(
      { error: 'Failed to create text' },
      { status: 500 }
    );
  }
}