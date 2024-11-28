'use client';
import TextProcessor from '@/app/components/text/TextProcessor';
import Link from 'next/link';

export default function TextUpload() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upload Text</h1>
        <div className="flex gap-2">
          <Link href="/texts" className="btn btn-ghost">
            Back to Texts
          </Link>
        </div>
      </div>
      
      <TextProcessor />
    </div>
  );
} 