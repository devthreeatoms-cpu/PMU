import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { toast } from 'sonner';

interface UploadResult {
  url: string;
  error?: string;
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const convertToWebP = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas toBlob failed"));
            }
          }, 'image/webp', 0.8);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const uploadImage = async (file: File, path: string = 'products/'): Promise<UploadResult> => {
    setIsUploading(true);
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    let fileToUpload: File | Blob = file;

    try {
      // 1. Attempt rapid compression
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1000,
        useWebWorker: true,
        fileType: 'image/webp' as const,
        initialQuality: 0.6,
      };

      try {
        fileToUpload = await imageCompression(file, options);
        
        // If the result is NOT webp, try manual conversion
        if (fileToUpload.type !== 'image/webp') {
           console.log("Compression didn't result in WebP, converting manually...");
           fileToUpload = await convertToWebP(file);
        }
      } catch (compressionErr) {
        console.warn("Compression failed, attempting manual WebP conversion:", compressionErr);
        try {
          fileToUpload = await convertToWebP(file);
        } catch (convErr) {
          console.error("Manual conversion also failed:", convErr);
          fileToUpload = file; // Fallback to original
        }
      }
      
      setIsProcessing(false);

      // Create a clean, unique filename with .webp extension
      const sanitizedName = file.name.split('.')[0]
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 50);
      const filename = `${Date.now()}_${sanitizedName}.webp`;
      const storageRef = ref(storage, `${path}${filename}`);

      // 2. Upload to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload, {
        contentType: fileToUpload.type,
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(currentProgress);
          },
          (err) => {
            console.error("Firebase Storage Error:", err);
            setError(err.message);
            setIsUploading(false);
            toast.error("Cloud Storage Error: " + err.message);
            reject({ url: '', error: err.message });
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setIsUploading(false);
              resolve({ url: downloadURL });
            } catch (err: any) {
              setError(err.message);
              setIsUploading(false);
              reject({ url: '', error: err.message });
            }
          }
        );
      });
    } catch (err: any) {
      console.error("Upload process failed:", err);
      setError(err.message);
      setIsProcessing(false);
      setIsUploading(false);
      return { url: '', error: err.message };
    }
  };

  return { uploadImage, isUploading, isProcessing, progress, error };
}
