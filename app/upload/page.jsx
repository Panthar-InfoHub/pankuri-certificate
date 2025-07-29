"use client" // This component needs client-side interactivity

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast" // For toast notifications

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a file to upload.")
      return
    }

    // Check if the file is a CSV
    if (file.type !== "text/csv") {
      toast.error("Please upload a CSV file.")
      return
    }

    setIsUploading(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      const csvContent = e.target.result
      // Store the CSV content in localStorage to pass it to the next page
      localStorage.setItem("uploadedCsvContent", csvContent)
      toast.success("CSV file uploaded successfully!")
      setIsUploading(false)
      router.push("/display-csv") // Redirect to the display page
    }

    reader.onerror = () => {
      toast.error("Failed to read file.")
      setIsUploading(false)
    }

    reader.readAsText(file)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center">Upload Your <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">CSV</span>  File</h1>
      <p className="text-md text-gray-600 text-center max-w-prose">
        Select a CSV file from your device to view its contents and proceed.
      </p>
      <div className="grid w-full max-w-sm items-center gap-2">
        <Label htmlFor="csv-file" className="text-lg font-medium text-gray-700">
          Choose CSV  File
        </Label>
        <Input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="file:text-primary file:font-semibold file:border-0 file:bg-transparent file:cursor-pointer hover:file:text-primary/90"
        />
      </div>
      <Button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full max-w-xs py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 ease-in-out cursor-pointer"
      >
        {isUploading ? "Uploading..." : "Upload and View"}
      </Button>
    </main>
  )
}
