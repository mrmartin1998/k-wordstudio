'use client';
import { useState } from 'react';

export default function AudioUpload({ onAudioUpload }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Selected audio file:', file.name);

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file (MP3 or WAV)');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Audio file must be less than 50MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload audio file');
      }

      const data = await response.json();
      console.log('Audio upload response:', data);
      onAudioUpload(data);
    } catch (err) {
      setError('Failed to upload audio file');
      console.error('Audio upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-control w-full max-w-md">
      <label className="label">
        <span className="label-text">Audio File (optional)</span>
      </label>
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="file-input file-input-bordered w-full"
        disabled={uploading}
      />
      {uploading && (
        <div className="mt-2">
          <span className="loading loading-spinner loading-sm"></span>
          <span className="ml-2">Uploading audio...</span>
        </div>
      )}
      {error && (
        <div className="text-error text-sm mt-2">{error}</div>
      )}
    </div>
  );
} 