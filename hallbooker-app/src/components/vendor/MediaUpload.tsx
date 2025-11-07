'use client';

import { useState } from 'react';
import api from '@/services/api';

interface MediaUploadProps {
  hallId: string;
  onUploadSuccess: (mediaUrls: string[]) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ hallId, onUploadSuccess }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    try {
      // 1. Get Cloudinary signature from our backend
      const sigResponse = await api.post('/halls/media/generate-signature');
      const { signature, timestamp, cloudname, apikey } = sigResponse.data.data;

      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('api_key', apikey);
        // The upload URL for Cloudinary
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`;

        const response = await fetch(uploadUrl, { method: 'POST', body: formData });
        const data = await response.json();
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url).map(String);

      // 2. Send the URLs to our backend to associate with the hall
      if (validUrls.length > 0) {
        await api.post(`/halls/${hallId}/media`, { imageUrl: validUrls[0] });
        onUploadSuccess([validUrls[0]]);
      } else {
        onUploadSuccess([]);
      }
      setFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border p-4 rounded-md mt-4">
      <h3 className="text-lg font-semibold mb-2">Upload Media</h3>
      <p className="text-sm text-gray-500 mb-2">This will only work for an existing hall. Save the hall first before uploading images.</p>
      <input type="file" multiple onChange={handleFileChange} className="w-full text-sm" disabled={!hallId} />
      <div className="mt-2 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0 || !hallId}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-md disabled:bg-gray-400"
        >
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>
    </div>
  );
};

export default MediaUpload;
