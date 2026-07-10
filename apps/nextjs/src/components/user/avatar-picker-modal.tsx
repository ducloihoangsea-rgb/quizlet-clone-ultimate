"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@acme/ui/dialog";
import Cropper from "@acme/ui/cropper";
import { Dropzone } from "@acme/ui/dropzone";

import { api } from "~/trpc/react";
import { toast } from "@acme/ui/toast";

const profilePictures = [
  "dog.jpg",
  "frog.jpg",
  "lion.jpg",
  "monkey.jpg",
  "rabbit.jpg",
  "owl.png",
  "bunny.png",
  "panda.png",
  "cat.png",
  "pug.png",
  "koala.png",
  "goat.png",
  "penguin.png",
  "shark.png",
  "frog_face.png",
  "otter.png",
  "majestic_lion.png",
];

const UploadTrigger = React.forwardRef<HTMLLabelElement, any>(
  ({ onChange, disabled, className, children, ...props }, ref) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0] && onChange) {
        // Pass a dummy function for setCurrentFile as the new UI doesn't display the file name locally
        onChange(e.target.files[0], () => {});
      }
      e.target.value = '';
    };

    return (
      <label ref={ref} className={className} {...props}>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
          disabled={disabled} 
        />
        {children}
      </label>
    );
  }
);
UploadTrigger.displayName = "UploadTrigger";

interface AvatarPickerModalProps {
  children: React.ReactNode;
  currentImage: string | null;
  onAvatarChange?: (newImage: string) => void;
}

export default function AvatarPickerModal({ children, currentImage, onAvatarChange }: AvatarPickerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { mutate, isPending } = api.user.update.useMutation({
    onSuccess(data) {
      if (data.image && onAvatarChange) {
        onAvatarChange(data.image);
      }
      toast.success("Đã cập nhật ảnh đại diện!");
      setIsOpen(false);
    },
    onError() {
      toast.error("Có lỗi xảy ra khi cập nhật ảnh đại diện.");
    },
    onSettled() {
      setIsUploading(false);
    }
  });

  const updateUserImage = (image: string) => {
    setIsUploading(true);
    mutate({ image });
  };

  const uploadAndUpdate = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      const data = await response.json();
      updateUserImage(data.url);
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên.");
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative cursor-pointer group">
          {children}
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border-4 border-transparent group-hover:border-primary/50">
            <span className="text-white text-xs font-bold drop-shadow-md">ĐỔI ẢNH</span>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-[#0a092d] text-white border-slate-800 p-8 sm:rounded-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold tracking-tight">Ảnh hồ sơ</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Current Avatar Display */}
          <div className="shrink-0 flex justify-center w-full md:w-auto">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-indigo-500 overflow-hidden border-4 border-[#2b2b4d]">
              {currentImage ? (
                <Image src={currentImage} alt="Current avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold">U</div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                   <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                </div>
              )}
            </div>
          </div>

          {/* Avatar Selection Grid */}
          <div className="flex-1 w-full">
            <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
              {profilePictures.map((picture) => (
                <button
                  key={picture}
                  onClick={() => updateUserImage(`/images/${picture}`)}
                  disabled={isUploading || isPending}
                  className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-transparent hover:border-white hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-primary/50 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Image
                    src={`/images/${picture}`}
                    alt={picture}
                    fill
                    className="object-cover bg-indigo-400"
                  />
                </button>
              ))}
              
              {/* Custom Upload Button */}
              <Cropper aspect={1 / 1} afterCrop={uploadAndUpdate}>
                <UploadTrigger 
                  disabled={isUploading || isPending}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[#4b4b7c] text-white flex items-center justify-center hover:bg-white/10 transition-all hover:scale-105 cursor-pointer focus-within:ring-4 focus-within:ring-primary/50 ${isUploading || isPending ? 'opacity-50 hover:scale-100 cursor-not-allowed' : ''}`}
                >
                  <Plus className="w-8 h-8" />
                </UploadTrigger>
              </Cropper>
            </div>
            <p className="mt-6 text-sm text-slate-400 text-center md:text-left">
              Thêm các ảnh vào thư mục public/images để hiển thị thêm tại đây.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
