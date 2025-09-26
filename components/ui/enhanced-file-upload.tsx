'use client';

import * as React from 'react';
import {
  Upload,
  File,
  Image,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Progress } from './progress';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: 'uploading' | 'uploaded' | 'error';
  progress?: number;
  preview?: string;
}

interface EnhancedFileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  onFileRemove: (fileId: string) => void;
  onFilePreview?: (file: UploadedFile) => void;
  files: UploadedFile[];
  accept?: string;
  maxFiles?: number;
  maxSizeInMB?: number;
  uploadInstructions?: string;
  allowedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

export function EnhancedFileUpload({
  onFilesChange,
  onFileRemove,
  onFilePreview,
  files,
  accept = 'image/*,.pdf,.doc,.docx',
  maxFiles = 5,
  maxSizeInMB = 10,
  uploadInstructions,
  allowedTypes = ['Images', 'PDFs', 'Documents'],
  className,
  disabled = false,
}: EnhancedFileUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles
      .slice(0, maxFiles - files.length)
      .filter(file => {
        const sizeInMB = file.size / (1024 * 1024);
        return sizeInMB <= maxSizeInMB;
      })
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading' as const,
        progress: 0,
      }));

    if (validFiles.length > 0) {
      // Simulate upload progress
      validFiles.forEach(file => {
        simulateUpload(file);
      });

      onFilesChange([...files, ...validFiles]);
    }
  };

  const simulateUpload = (file: UploadedFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Update file status to uploaded
        onFilesChange(prevFiles =>
          prevFiles.map(f =>
            f.id === file.id ? { ...f, status: 'uploaded', progress: 100 } : f
          )
        );
      } else {
        // Update progress
        onFilesChange(prevFiles =>
          prevFiles.map(f => (f.id === file.id ? { ...f, progress } : f))
        );
      }
    }, 200);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    return File;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          files.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || files.length >= maxFiles}
        />

        <div className="space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-foreground">
              {files.length >= maxFiles
                ? 'Maximum files reached'
                : 'Drop files here or click to browse'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {uploadInstructions ||
                `Supports: ${allowedTypes.join(', ')} • Max ${maxSizeInMB}MB per file • ${maxFiles} files max`}
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || files.length >= maxFiles}
            >
              Choose Files
            </Button>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>

          <div className="space-y-2">
            {files.map(file => (
              <FileItem
                key={file.id}
                file={file}
                onRemove={() => onFileRemove(file.id)}
                onPreview={
                  onFilePreview ? () => onFilePreview(file) : undefined
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FileItem({
  file,
  onRemove,
  onPreview,
}: {
  file: UploadedFile;
  onRemove: () => void;
  onPreview?: () => void;
}) {
  const FileIcon = getFileIcon(file.type);

  return (
    <Card className="p-3">
      <CardContent className="p-0">
        <div className="flex items-center gap-3">
          {/* File Icon */}
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileIcon className="h-5 w-5 text-primary" />
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">
                {file.name}
              </p>
              <Badge
                variant={
                  file.status === 'uploaded'
                    ? 'default'
                    : file.status === 'error'
                      ? 'destructive'
                      : 'secondary'
                }
                className="flex-shrink-0"
              >
                {file.status === 'uploaded' && (
                  <CheckCircle className="h-3 w-3 mr-1" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {file.status === 'uploading'
                  ? 'Uploading'
                  : file.status === 'uploaded'
                    ? 'Uploaded'
                    : 'Error'}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>

              {file.status === 'uploading' && file.progress !== undefined && (
                <div className="flex-1 max-w-32">
                  <Progress value={file.progress} className="h-1" />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {file.status === 'uploaded' && onPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPreview}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">Preview</span>
              </Button>
            )}

            {file.status === 'uploaded' && file.url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(file.url, '_blank')}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  return File;
}
