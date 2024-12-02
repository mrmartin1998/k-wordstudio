import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Text from '@/models/Text';
import Collection from '@/models/Collection';

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = params;
  const updates = await request.json();
  
  // Get the original text to check if collection changed
  const originalText = await Text.findById(id);
  
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

  // Update stats for old collection if it exists
  if (originalText.collectionId) {
    await updateCollectionStats(originalText.collectionId);
  }

  // Update stats for new collection if it exists and is different
  if (text.collectionId && text.collectionId !== originalText.collectionId) {
    await updateCollectionStats(text.collectionId);
  }
  
  return NextResponse.json(text);
}

// Helper function to update collection stats
async function updateCollectionStats(collectionId) {
  try {
    // Only get texts that explicitly belong to this collection
    const texts = await Text.find({ collectionId: collectionId });
    
    const stats = {
      totalTexts: texts.length,
      averageComprehension: texts.length > 0
        ? texts.reduce((acc, t) => acc + (t.comprehension || 0), 0) / texts.length
        : 0,
      difficultyDistribution: texts.reduce((acc, t) => {
        acc[t.difficulty] = (acc[t.difficulty] || 0) + 1;
        return acc;
      }, {
        Beginner: 0,
        Elementary: 0,
        Intermediate: 0,
        Advanced: 0,
        Expert: 0
      })
    };

    await Collection.findByIdAndUpdate(collectionId, { stats });
  } catch (error) {
    console.error('Failed to update collection stats:', error);
  }
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

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const text = await Text.findById(params.id);
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(text);
  } catch (error) {
    console.error('Failed to fetch text:', error);
    return NextResponse.json(
      { error: 'Failed to fetch text' },
      { status: 500 }
    );
  }
} 