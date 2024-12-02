import dbConnect from '@/lib/db';
import Collection from '@/models/Collection';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const collections = await Collection.find({}).sort({ dateCreated: -1 });
    return NextResponse.json(collections);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    if (!data.name) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    const collection = await Collection.create({
      name: data.name,
      description: data.description,
      dateCreated: new Date()
    });

    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create collection: ${error.message}` },
      { status: 500 }
    );
  }
} 