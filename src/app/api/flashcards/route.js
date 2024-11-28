import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Flashcard from '@/models/Flashcard';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const textId = searchParams.get('textId');
    
    // Only include sourceTextId in query if textId is provided and valid
    const query = textId && textId !== 'undefined' ? { sourceTextId: textId } : {};
    
    const flashcards = await Flashcard.find(query).sort({ dateAdded: -1 });
    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const flashcard = await Flashcard.create(data);
  return NextResponse.json(flashcard);
}

export async function PUT(request) {
  await dbConnect();
  const data = await request.json();
  const { id, ...updates } = data;
  
  const flashcard = await Flashcard.findByIdAndUpdate(
    id,
    updates,
    { new: true }
  );
  return NextResponse.json(flashcard);
}

export async function DELETE(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  await Flashcard.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
} 