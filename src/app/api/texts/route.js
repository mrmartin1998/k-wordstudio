import dbConnect from '@/lib/db';
import Text from '@/models/Text';
import Collection from '@/models/Collection';
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
      difficulty: data.difficulty || 'Intermediate',
      collectionId: data.collectionId || null,
      audio: data.audio,
      dateAdded: new Date(),
      totalWords: data.totalWords || 0,
      knownWords: data.knownWords || 0,
      comprehension: data.comprehension || 0
    });

    // Update collection statistics if text is added to a collection
    if (text.collectionId) {
      const texts = await Text.find({ collectionId: text.collectionId });
      const stats = {
        totalTexts: texts.length,
        averageComprehension: texts.reduce((acc, t) => acc + (t.comprehension || 0), 0) / texts.length || 0,
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

      await Collection.findByIdAndUpdate(text.collectionId, { stats });
    }

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