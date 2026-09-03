import { useState } from 'react';
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
}

interface ImageUploadPreviewProps {
  existingImages?: string[];
  productName?: string;
  maxImages?: number;
  onFilesChange: (files: File[]) => void;
}

export function ImageUploadPreview({ 
  existingImages = [], 
  productName = 'Product',
  maxImages = 8,
  onFilesChange 
}: ImageUploadPreviewProps) {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  const handleFileSelect = (selected: FileList | null) => {
    if (!selected) return;

    const files = Array.from(selected);
    const remaining = maxImages - existingImages.length - imageFiles.length;
    const toAdd = files.slice(0, remaining);

    // Create preview URLs and initialize upload states
    const newImageFiles: ImageFile[] = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending' as const,
    }));

    setImageFiles((current) => [...current, ...newImageFiles]);

    // Simulate upload progress
    newImageFiles.forEach((imageFile, index) => {
      simulateUpload(imageFiles.length + index);
    });

    // Pass files to parent
    onFilesChange([...imageFiles.map(f => f.file), ...toAdd]);
  };

  const simulateUpload = (index: number) => {
    setImageFiles((current) => {
      const updated = [...current];
      if (updated[index]) {
        updated[index] = { ...updated[index], status: 'uploading' };
      }
      return updated;
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setImageFiles((current) => {
          const updated = [...current];
          if (updated[index]) {
            updated[index] = { ...updated[index], progress: 100, status: 'complete' };
          }
          return updated;
        });
      } else {
        setImageFiles((current) => {
          const updated = [...current];
          if (updated[index]) {
            updated[index] = { ...updated[index], progress };
          }
          return updated;
        });
      }
    }, 200);
  };

  const removeFile = (index: number) => {
    setImageFiles((current) => {
      const updated = current.filter((_, i) => i !== index);
      // Revoke URL to prevent memory leaks
      if (current[index]) {
        URL.revokeObjectURL(current[index].preview);
      }
      // Update parent with new file list
      onFilesChange(updated.map(f => f.file));
      return updated;
    });
  };

  const totalImages = existingImages.length + imageFiles.length;
  const canUploadMore = totalImages < maxImages;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {/* Existing images */}
        {existingImages.map((image, index) => (
          <div key={`existing-${index}`} className="relative aspect-square brutal-border bg-white overflow-hidden group">
            <img 
              src={image} 
              alt={`${productName} ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-brand-600 text-white text-2xs font-bold px-2 py-0.5 rounded">
                SAVED
              </span>
            </div>
          </div>
        ))}

        {/* New uploaded files with preview */}
        {imageFiles.map((imageFile, index) => (
          <div 
            key={`new-${index}`} 
            className="relative aspect-square brutal-border bg-paper-100 overflow-hidden"
          >
            {/* Image preview */}
            <img 
              src={imageFile.preview} 
              alt={imageFile.file.name}
              className={cn(
                "w-full h-full object-cover transition-opacity",
                imageFile.status === 'uploading' && "opacity-50"
              )}
            />

            {/* Upload progress overlay */}
            {imageFile.status === 'uploading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
                <Loader2 className="w-6 h-6 text-brand-600 animate-spin mb-2" />
                <div className="w-3/4 h-1.5 bg-paper-300 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-600 transition-all duration-200"
                    style={{ width: `${imageFile.progress}%` }}
                  />
                </div>
                <span className="text-2xs font-bold text-ink-600 mt-1">
                  {Math.round(imageFile.progress)}%
                </span>
              </div>
            )}

            {/* Complete indicator */}
            {imageFile.status === 'complete' && (
              <div className="absolute top-1 right-1">
                <CheckCircle2 className="w-4 h-4 text-success-600 bg-white rounded-full" />
              </div>
            )}

            {/* File info and remove button */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-900/80 to-transparent p-2 flex items-end justify-between">
              <span className="text-2xs font-bold text-white line-clamp-1 flex-1">
                {imageFile.file.name}
              </span>
              <button
                onClick={() => removeFile(index)}
                className="brutal-border bg-white p-0.5 hover:bg-danger-500 hover:text-white transition-colors ml-1"
                aria-label={`Remove ${imageFile.file.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload button */}
        {canUploadMore && (
          <label className="aspect-square brutal-border border-dashed bg-paper-100 flex flex-col items-center justify-center cursor-pointer hover:bg-paper-200 hover:border-brand-600 transition-colors">
            <Upload className="w-5 h-5 text-ink-400 mb-1" />
            <span className="text-2xs font-bold uppercase text-ink-500">Upload</span>
            <span className="text-3xs text-ink-400 mt-0.5">
              {maxImages - totalImages} left
            </span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(event) => handleFileSelect(event.target.files)}
            />
          </label>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-ink-500">
        <span className="font-semibold">{totalImages} / {maxImages} images</span>
        <span>•</span>
        <span>Max 5MB per image</span>
        <span>•</span>
        <span>JPEG, PNG, WebP, AVIF</span>
      </div>
    </div>
  );
}
