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
    console.log('Creating text with data:', data);
    
    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create the text document
    const text = await Text.create({
      title: data.title,
      content: data.content,
      audio: data.audio,
      dateAdded: new Date(),
      totalWords: data.totalWords || 0,
      knownWords: data.knownWords || 0,
      comprehension: data.comprehension || 0
    });

    console.log('Created text:', text);
    return NextResponse.json(text);
  } catch (error) {
    console.error('Failed to create text:', error);
    return NextResponse.json(
      { error: `Failed to create text: ${error.message}` },
      { status: 500 }
    );
  }
}