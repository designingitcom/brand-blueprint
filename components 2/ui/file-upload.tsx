'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface FileUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  bucket: string;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  value,
  onChange,
  accept = 'image/*',
  maxSize = 5,
  bucket,
  className,
  disabled,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setError('Invalid file type');
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      
      onChange(data.publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      // Extract filename from URL
      const url = new URL(value);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];

      // Delete from storage
      await supabase.storage.from(bucket).remove([fileName]);
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    onChange(null);
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {value ? (
        <div className="relative group">
          <div className="relative overflow-hidden rounded-lg border border-border bg-muted/50">
            <img
              src={value}
              alt="Uploaded image"
              className="h-32 w-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleClick}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemove}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            'border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-muted-foreground/50 hover:bg-muted/50',
            uploading && 'pointer-events-none opacity-50',
            disabled && 'pointer-events-none opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <Image className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {uploading ? 'Uploading...' : 'Click to upload image'}
              </p>
              <p className="text-xs text-muted-foreground">
                Max size: {maxSize}MB
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}