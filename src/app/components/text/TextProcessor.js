'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from '@/app/components/FileUpload';

export default function TextProcessor() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [collection, setCollection] = useState('');
  const [collections, setCollections] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const response = await fetch('/api/collections');
        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error('Failed to load collections:', error);
      }
    };
    loadCollections();
  }, []);

  const handleFileUpload = async (content, fileName) => {
    setTextContent(content);
    if (!title && fileName) {
      setTitle(fileName);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const response = await fetch('/api/texts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: textContent,
          difficulty,
          collectionId: collection || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to upload text');
      
      router.push('/texts');
    } catch (error) {
      console.error('Error uploading text:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Title</span>
        </label>
        <input 
          type="text"
          placeholder="Enter text title"
          className="input input-bordered w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Collection (Optional)</span>
        </label>
        <select 
          className="select select-bordered"
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
        >
          <option value="">No Collection</option>
          {collections.map((col) => (
            <option key={col._id} value={col._id}>
              {col.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control w-full mb-4">
        <label className="label">
          <span className="label-text">Difficulty Level</span>
        </label>
        <select 
          className="select select-bordered"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="Beginner">Beginner</option>
          <option value="Elementary">Elementary</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
      </div>
      
      <div className="form-control w-full">
        <FileUpload onFileContent={handleFileUpload} />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary w-full"
        disabled={isUploading || !textContent}
      >
        {isUploading ? 'Uploading...' : 'Upload Text'}
      </button>
    </form>
  );
}