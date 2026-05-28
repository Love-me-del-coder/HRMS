import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import { apiUploadFile } from '../../services/api';

interface FileUploaderProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
  accept?: string;
}

export function FileUploader({ onUploadSuccess, label = 'Upload File', accept = 'image/*,application/pdf' }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiUploadFile(file);
      if (response.success && response.data.url) {
        setSuccess(true);
        onUploadSuccess(response.data.url);
      } else {
        throw new Error('Failed to upload');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium dark:text-text-dark-secondary text-text-light-secondary mb-1">
        {label}
      </label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
          ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 
            success ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 
            'dark:border-dark-border border-light-border dark:hover:border-primary-dark hover:border-primary-light'}
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={accept} 
          onChange={handleFileChange}
        />
        
        {isUploading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-primary-dark"></div>
        ) : success ? (
          <>
            <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Upload Complete!</span>
          </>
        ) : error ? (
          <>
            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">{error}</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-8 h-8 dark:text-text-dark-tertiary text-text-light-tertiary mb-2" />
            <span className="text-sm font-medium dark:text-text-dark-secondary text-text-light-secondary">
              Click to select or drag and drop
            </span>
          </>
        )}
      </div>
    </div>
  );
}
