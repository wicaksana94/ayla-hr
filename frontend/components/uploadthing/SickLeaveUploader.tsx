'use client';

import { useState, useRef } from "react";

interface FileUploadProps {
  onUploadComplete?: (url: string) => void;
  value?: string;
}

export function SickLeaveUploader({ onUploadComplete, value }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload an image or PDF.");
      return;
    }

    // Validate file size (4MB max)
    if (file.size > 4 * 1024 * 1024) {
      setError("File too large. Maximum size is 4MB.");
      return;
    }

    setError(null);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    // TODO: Replace with actual upload to UploadThing/S3/Cloudinary
    // For now, we'll use the file directly (in production, upload to storage)
    setUploading(true);
    
    // Simulate upload delay - Replace with actual upload
    setTimeout(() => {
      setUploading(false);
      // For now, just pass the file name as placeholder
      // In production: upload to storage and get the URL
      onUploadComplete?.(file.name);
    }, 1000);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Attachment (Medical Certificate / Proof)
      </label>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100
          "
        />
        {uploading && <span className="text-sm text-muted-foreground">Processing...</span>}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Preview" className="max-w-xs rounded-lg border" />
        </div>
      )}
      {value && !error && (
        <p className="text-sm text-green-600">✓ File attached</p>
      )}
      <p className="text-xs text-muted-foreground">
        Accepted: Images (JPG, PNG) or PDF. Max 4MB.
      </p>
    </div>
  );
}
