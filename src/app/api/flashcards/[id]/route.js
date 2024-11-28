import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Flashcard from '@/models/Flashcard';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const updates = await request.json();
    
    const flashcard = await Flashcard.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
    
    if (!flashcard) {
      return NextResponse.json(
        { error: 'Flashcard not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('Error updating flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to update flashcard' },
      { status: 500 }
    );
  }
} 