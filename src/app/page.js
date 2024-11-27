'use client';
import { useState } from 'react';
import FileUpload from '@/components/FileUpload';

export default function Home() {
  const [text, setText] = useState('');
  const [words, setWords] = useState([]);

  const handleFileContent = (content) => {
    setText(content);
    // Basic word extraction (we can make this more sophisticated later)
    const extractedWords = content
      .split(/[\s,.!?]+/)
      .filter(word => word.length > 0)
      .reduce((unique, word) => {
        if (!unique.includes(word)) {
          unique.push(word);
        }
        return unique;
      }, []);
    setWords(extractedWords);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">K-WordStudio</h1>
      
      <div className="mb-8">
        <h2 className="text-xl mb-4">Upload Text</h2>
        <FileUpload onFileContent={handleFileContent} />
      </div>

      {text && (
        <div className="mb-8">
          <h2 className="text-xl mb-4">Original Text</h2>
          <div className="p-4 bg-base-200 rounded-lg whitespace-pre-wrap">
            {text}
          </div>
        </div>
      )}

      {words.length > 0 && (
        <div>
          <h2 className="text-xl mb-4">Extracted Words ({words.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {words.map((word, index) => (
              <div key={index} className="p-2 bg-base-200 rounded">
                {word}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
