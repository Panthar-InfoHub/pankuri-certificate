import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getVideoMetadata = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = function () {
      window.URL.revokeObjectURL(video.src)
      const metadata = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Math.floor(video.duration) // Duration in seconds
      }
      resolve(metadata)
    }

    video.onerror = function () {
      reject(new Error("Failed to load video metadata"))
    }

    video.src = URL.createObjectURL(file)
  })
}

export const determineQuality = (height) => {
  if (height >= 1080) return "1080"  // Full HD
  if (height >= 720) return "720"    // HD
  if (height >= 480) return "480"    // SD
  return "360"                        // Low quality
}

export const formatDuration = (sec) => {
  const minutes = Math.floor(sec / 60)
  const seconds = sec % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export const handleImageChange = (e, setFile, setPreview) => {
  const file = e.target.files?.[0]
  if (!file) return
  setFile(file)
  const reader = new FileReader()
  reader.onloadend = () => setPreview(reader.result)
  reader.readAsDataURL(file)
}


export const getAttachmentType = (extension: string) => {
  if (extension === "pdf") return "pdf"
  if (extension === "zip") return "zip"
  if (["doc", "docx", "odt", "txt", "rtf", "xls", "xlsx", "ods", "csv", "ppt", "pptx", "odp"].includes(extension)) return "document"
  if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(extension)) return "image"
  return "other"
}