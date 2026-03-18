'use client';

import { useState, useRef } from "react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface FileUploadProps {
  onUploadComplete?: (url: string) => void;
  value?: string;
}

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export function SickLeaveUploader({ onUploadComplete, value }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("sickLeave", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        const url = res[0].url;
        setUploadedUrl(url);
        onUploadComplete?.(url);
      }
      setUploading(false);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setError(error.message || "Upload failed");
      setUploading(false);
    },
  });

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
    setUploading(true);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Upload to UploadThing
    await startUpload([file]);
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadedUrl(null);
    onUploadComplete?.("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="sick-leave-file" className="text-sm font-medium">
        Attachment (Medical Certificate / Proof)
      </label>
      
      {!uploadedUrl ? (
        <div className="flex flex-col gap-2">
          <input
            id="sick-leave-file"
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            disabled={uploading || isUploading}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100
            "
          />
          {(uploading || isUploading) && (
            <span className="text-sm text-muted-foreground">Uploading...</span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
          <div className="flex-1">
            <p className="text-sm font-medium">✓ File uploaded</p>
            <p className="text-xs text-muted-foreground truncate max-w-xs">{uploadedUrl.split('/').pop()}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      {preview && !uploadedUrl && (
        <div className="mt-2">
          <img src={preview} alt="Preview" className="max-w-xs rounded-lg border" />
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Accepted: Images (JPG, PNG) or PDF. Max 4MB.
      </p>
    </div>
  );
}
