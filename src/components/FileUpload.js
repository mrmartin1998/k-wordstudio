import { useState } from 'react';

export default function FileUpload({ onFileContent }) {
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setError('');

    if (!file) return;

    if (file.type !== 'text/plain') {
      setError('Please upload a .txt file');
      return;
    }

    const fileName = file.name.replace('.txt', '');
    setTitle(fileName);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      onFileContent({
        title: fileName,
        content: text,
        dateAdded: new Date()
      });
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter title (optional)"
        className="input input-bordered w-full max-w-xs"
      />
      <input
        type="file"
        accept=".txt"
        onChange={handleFileUpload}
        className="file-input file-input-bordered w-full max-w-xs"
      />
      {error && <p className="text-error">{error}</p>}
    </div>
  );
} 