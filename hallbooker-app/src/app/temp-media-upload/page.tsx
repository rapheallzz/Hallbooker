'use client';

import MediaUpload from '@/components/vendor/MediaUpload';

export default function TempMediaUploadPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Media Upload Test</h1>
      <MediaUpload hallId="test-hall-id" onUploadSuccess={() => {}} />
    </div>
  );
}
