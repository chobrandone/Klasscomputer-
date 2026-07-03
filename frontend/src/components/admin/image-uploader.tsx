'use client';

import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/api';
import { cn } from '@/lib/utils';

/** Drag & drop multi-image uploader — posts to /upload/images and returns URLs. */
export function ImageUploader({
  images,
  onChange,
  max = 6,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).slice(0, max - images.length);
    if (!list.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      list.forEach((file) => formData.append('files', file));
      const res = await fetch(`${API_URL}/upload/images`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Upload failed');
      const { urls } = await res.json();
      onChange([...images, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          dragging
            ? 'border-brand bg-brand/5'
            : 'border-[#E0E0E0] hover:border-brand/60 dark:border-[#2A2A2A]',
        )}
      >
        <ImagePlus className="h-8 w-8 text-[#999999]" />
        <p className="text-sm font-semibold">
          {uploading ? 'Uploading…' : 'Drop images here or click to browse'}
        </p>
        <p className="text-xs text-[#999999]">PNG, JPG, WebP — up to 5MB each, max {max} images</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={url + i} className="group relative h-24 w-24 overflow-hidden rounded border border-[#E0E0E0] dark:border-[#2A2A2A]">
              <Image src={url} alt="" fill className="object-cover" sizes="96px" />
              {i === 0 && (
                <span className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-center text-[10px] font-bold text-white">
                  MAIN
                </span>
              )}
              <button
                type="button"
                onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
