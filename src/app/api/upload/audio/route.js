import { writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('audio');

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'audio');
    await createDirIfNotExists(uploadDir);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uniqueId = crypto.randomUUID();
    const fileName = `${uniqueId}-${file.name}`;
    const filePath = join(uploadDir, fileName);

    // Write file
    await writeFile(filePath, buffer);

    // Return the public URL
    return NextResponse.json({
      url: `/uploads/audio/${fileName}`,
      fileName: file.name,
      mimeType: file.type
    });
  } catch (error) {
    console.error('Error uploading audio:', error);
    return NextResponse.json(
      { error: 'Failed to upload audio file' },
      { status: 500 }
    );
  }
}

async function createDirIfNotExists(dir) {
  try {
    await access(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
} 