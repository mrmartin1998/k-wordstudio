import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Text from '@/models/Text';

export async function GET() {
  await dbConnect();
  const texts = await Text.find().sort({ dateAdded: -1 });
  return NextResponse.json(texts);
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const text = await Text.create(data);
  return NextResponse.json(text);
} 