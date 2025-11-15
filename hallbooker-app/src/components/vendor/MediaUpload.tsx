'use client';

import { useState, useCallback } from 'react';
import api from '@/services/api';
import { UploadCloud, X, CheckCircle } from 'lucide-react';

interface MediaUploadProps {
  hallId: string;
  onUploadSuccess: (mediaUrls: string[]) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ hallId, onUploadSuccess }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviews((prevPreviews) => {
      const newPreviews = prevPreviews.filter((_, i) => i !== index);
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(previews[index]);
      return newPreviews;
    });
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const sigResponse = await api.post('/halls/media/generate-signature');
      const { signature, timestamp, cloudname, apikey } = sigResponse.data.data;

      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('api_key', apikey);
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`;

        try {
            const response = await fetch(uploadUrl, { method: 'POST', body: formData });
            const data = await response.json();
            return data.secure_url;
        } catch {
            return null; // Return null if a single upload fails
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => !!url).map(String);

      if (validUrls.length > 0) {
        const backendUploadPromises = validUrls.map(url =>
          api.post(`/halls/${hallId}/media`, { imageUrl: url })
        );
        await Promise.all(backendUploadPromises);
        onUploadSuccess(validUrls);
        setUploadSuccess(true);
      } else {
        throw new Error("No files were uploaded successfully.");
      }

      // Clear fields on success
      setFiles([]);
      previews.forEach(p => URL.revokeObjectURL(p));
      setPreviews([]);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border border-gray-300 p-6 rounded-lg mt-6 bg-gray-50">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Upload Media</h3>
      <p className="text-sm text-gray-600 mb-4">
        Save the hall details before uploading images. You can drag & drop files or click to select.
      </p>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
                    ${isDragging ? 'border-primary bg-blue-50' : 'border-gray-300 bg-white'}
                    ${!hallId ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <input
          type="file"
          multiple
          onChange={(e) => handleFileChange(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0"
          disabled={!hallId}
          accept="image/*"
        />
        <div className="flex flex-col items-center">
          <UploadCloud size={48} className="text-gray-400 mb-3" />
          <p className="font-semibold text-gray-700">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-800 mb-2">Selected Files:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img src={preview} alt={`preview ${index}`} className="w-full h-32 object-cover rounded-md border border-gray-200" />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end items-center space-x-4">
        {uploadSuccess && (
          <div className="flex items-center text-green-600">
            <CheckCircle size={20} className="mr-2"/>
            <span>Upload successful!</span>
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0 || !hallId}
          className="px-6 py-2 font-semibold bg-primary text-white rounded-md disabled:bg-gray-400 hover:bg-primary-dark transition-colors"
        >
          {isUploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
        </button>
      </div>
    </div>
  );
};

export default MediaUpload;
