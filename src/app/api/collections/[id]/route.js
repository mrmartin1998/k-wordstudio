import dbConnect from '@/lib/db';
import Collection from '@/models/Collection';
import Text from '@/models/Text';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const collection = await Collection.findById(params.id);
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Get texts in this collection with full details
    const texts = await Text.find({ collectionId: params.id })
      .sort({ dateAdded: -1 })
      .select('title content difficulty comprehension dateAdded audio');
    
    // Calculate collection statistics based only on texts in this collection
    const stats = {
      totalTexts: texts.length,
      averageComprehension: texts.length > 0 
        ? texts.reduce((acc, text) => acc + (text.comprehension || 0), 0) / texts.length 
        : 0,
      difficultyDistribution: texts.reduce((acc, text) => {
        acc[text.difficulty] = (acc[text.difficulty] || 0) + 1;
        return acc;
      }, {
        Beginner: 0,
        Elementary: 0,
        Intermediate: 0,
        Advanced: 0,
        Expert: 0
      })
    };

    return NextResponse.json({ 
      ...collection.toObject(), 
      texts,
      stats 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const updates = await request.json();
    
    const collection = await Collection.findByIdAndUpdate(
      params.id,
      updates,
      { new: true }
    );
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    // Remove collection reference from texts
    await Text.updateMany(
      { collectionId: params.id },
      { $unset: { collectionId: "" } }
    );
    
    const collection = await Collection.findByIdAndDelete(params.id);
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
} 