"use client"

import { useState, useTransition } from "react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { completeMultipartUpload, createMultipartUpload, generatePresignedUrls } from "@/lib/action"
import axios from "axios"

const CHUNK_SIZE = 10 * 1024 * 1024 // 10 mb 


export function VideoUploadForm({ onSuccess }) {
    const [isPending, startTransition] = useTransition()
    const [partProgress, setPartProgress] = useState({})
    const [thumbnailProgress, setThumbnailProgress] = useState(0)
    const [totalParts, setTotalParts] = useState(0)
    const [uploadStatus, setUploadStatus] = useState("idle")

    const form = useForm({
        defaultValues: {
            thumbnail: null,
            videoQuality: "720",
            video: null,
            duration: "",
        },
        onSubmit: async ({ value }) => {
            console.log("value", value)
            startTransition(async () => {
                toast.info("Initializing upload...")

                const file = value.video
                const bucketName = "pankhuri-v3"
                const key = `videos/${Date.now()}_${file.name}`

                try {
                    // 1. Create a multipart upload to get an UploadId
                    toast.info("Getting upload session...")

                    const allUploadTasks = []

                    const videoUploadPromise = (async () => {
                        const uploadId = await createMultipartUpload(bucketName, key, file.type)

                        if (!uploadId) {
                            throw new Error("Failed to create multipart upload.")
                        }

                        console.log("Upload ID:", uploadId)

                        // 2. Generate presigned URLs for each part
                        toast.info("Preparing upload parts...")
                        const calculatedTotalParts = Math.ceil(file.size / CHUNK_SIZE)
                        setTotalParts(calculatedTotalParts)

                        console.log("\n partss ==> ", calculatedTotalParts)
                        const presignedUrlsData = await generatePresignedUrls(bucketName, key, uploadId, calculatedTotalParts)

                        console.log("\nPresigned URLs:", presignedUrlsData)

                        // Initialize progress for all parts
                        const initialProgress = {}
                        presignedUrlsData.forEach(part => {
                            initialProgress[part.partNumber] = 0
                        })
                        setPartProgress(initialProgress)
                        setUploadStatus("uploading")

                        // 3. Upload each part concurrently
                        toast.info(`Uploading ${calculatedTotalParts} parts...`)
                        const uploadedParts = await Promise.all(
                            presignedUrlsData.map(async (partData, index) => {
                                const chunk = file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
                                const response = await axios.put(partData.url, chunk, {
                                    onUploadProgress: (progressEvent) => {
                                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)

                                        setPartProgress(prev => ({
                                            ...prev,
                                            [partData.partNumber]: percentCompleted
                                        }))
                                    },
                                })
                                console.log("\nResponse:", response.headers)
                                return { PartNumber: partData.partNumber, ETag: response.headers.etag.replace(/"/g, "") }
                            })
                        )
                        console.log("\nUploaded Parts:", uploadedParts)
                        // 4. Complete the multipart upload
                        toast.info("Finalizing upload...")
                        await completeMultipartUpload(bucketName, key, uploadId, uploadedParts)
                    })()

                    allUploadTasks.push(videoUploadPromise);

                    if (value.thumbnail) {
                        const thumbnailKey = `video-thumbnails/${Date.now()}_${value.thumbnail.name}`
                        await axios.put(thumbnailKey, value.thumbnail, {
                            onUploadProgress: (progressEvent) => {
                                setThumbnailProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
                            },
                        })
                        allUploadTasks.push(thumbnailUploadPromise)
                    }


                    setStatusMessage("Uploading files...")
                    await Promise.all(allUploadTasks)

                    toast.success("Upload complete!")
                    setUploadStatus("success")

                    // Reset after a delay
                    setTimeout(() => {
                        setPartProgress({})
                        setTotalParts(0)
                        setUploadStatus("idle")
                        if (onSuccess) onSuccess() //ToDO : Have to add the data in backend later
                    }, 2000)

                } catch (error) {
                    console.error("Upload failed:", error)
                    toast.error("Upload failed. Please try again.")
                    setUploadStatus("error : ", error.message)
                }
            })
        },
    })

    const handleThumbnailChange = (e) => {
        const file = e.target.files?.[0] || null
        form.setFieldValue("thumbnail", file)
    }

    const handleVideoChange = (e) => {
        const file = e.target.files?.[0] || null
        form.setFieldValue("video", file)
        console.log("Form state after:", form.state.values.video)
    }

    const handleDurationChange = (e) => {
        form.setFieldValue("duration", e.target.value)
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="space-y-6"
        >
            {/* Thumbnail Upload Field */}
            <form.Field
                name="thumbnail"
                children={(field) => (
                    <div className="space-y-2">
                        <Label htmlFor="thumbnail">Thumbnail Upload</Label>
                        <Input
                            id="thumbnail"
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            disabled={isPending}
                            className="cursor-pointer"
                        />
                        {field.state.value && <p className="text-sm text-muted-foreground">Selected: {field.state.value.name}</p>}
                        <p className="text-xs text-muted-foreground">Upload a thumbnail image for your video (PNG, JPG, etc.)</p>
                    </div>
                )}
            />

            {/* Thumbnail upload Progress Section */}
            {isPending && thumbnailProgress > 0 && (

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold"> Thumbnail Upload Progress</span>
                        <span className="text-muted-foreground font-medium">
                            {Math.round(
                                thumbnailProgress
                            )}%
                        </span>
                    </div>
                    <Progress
                        value={thumbnailProgress}
                        className="h-3 bg-gradient-to-r from-purple-200 to-pink-200"
                    />
                </div>


            )}

            {/* Video Quality Select Field */}
            <form.Field
                name="videoQuality"
                children={(field) => (
                    <div className="space-y-2">
                        <Label htmlFor="quality">Video Quality</Label>
                        <Select
                            value={field.state.value}
                            onValueChange={(value) => form.setFieldValue("videoQuality", value)}
                            disabled={isPending}
                        >
                            <SelectTrigger id="quality">
                                <SelectValue placeholder="Select video quality" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="480">480p</SelectItem>
                                <SelectItem value="720">720p (HD)</SelectItem>
                                <SelectItem value="1080">1080p (Full HD)</SelectItem>
                                <SelectItem value="1440">1440p (2K)</SelectItem>
                                <SelectItem value="2160">2160p (4K)</SelectItem>
                                <SelectItem value="4320">4320p (8K)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Choose the output quality for your uploaded video</p>
                    </div>
                )}
            />

            {/* Video Upload Field */}
            <form.Field
                name="video"
                children={(field) => (
                    <div className="space-y-2">
                        <Label htmlFor="video">Video Upload</Label>
                        <Input
                            id="video"
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            disabled={isPending}
                            className="cursor-pointer"
                        />
                        {field.state.value && <p className="text-sm text-muted-foreground">Selected: {field.state.value.name}</p>}
                        <p className="text-xs text-muted-foreground">Choose the video file to upload (MP4, WebM, etc.)</p>
                    </div>
                )}
            />

            {/* Duration Field */}
            <form.Field
                name="duration"
                children={(field) => (
                    <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                            id="duration"
                            type="text"
                            placeholder="e.g., 5:30 or 330 seconds"
                            value={field.state.value}
                            onChange={handleDurationChange}
                            disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground">Enter the video duration (format: MM:SS or total seconds)</p>
                    </div>
                )}
            />

            {/* Upload Progress Section */}
            {isPending && totalParts > 0 && (
                <Card className="bg-muted/50 border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Upload Progress</CardTitle>
                        <CardDescription>
                            {uploadStatus === "uploading" && `Uploading ${totalParts} parts to DigitalOcean Spaces`}
                            {uploadStatus === "success" && "Upload completed successfully!"}
                            {uploadStatus === "error" && "Upload failed"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* Overall Progress */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold">Overall Progress</span>
                                <span className="text-muted-foreground font-medium">
                                    {Math.round(
                                        Object.values(partProgress).reduce((acc, curr) => acc + curr, 0) / totalParts
                                    )}%
                                </span>
                            </div>
                            <Progress
                                value={Math.round(
                                    Object.values(partProgress).reduce((acc, curr) => acc + curr, 0) / totalParts
                                )}
                                className="h-3 bg-gradient-to-r from-purple-200 to-pink-200"
                            />
                        </div>

                        {/* Individual Part Progress */}
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            <p className="text-xs font-medium text-muted-foreground">Individual Parts:</p>
                            {Object.entries(partProgress)
                                .sort(([a], [b]) => Number(a) - Number(b))
                                .map(([partNumber, progress]) => (
                                    <div key={partNumber} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Part {partNumber}</span>
                                            <span className="font-medium">{progress}%</span>
                                        </div>
                                        <Progress
                                            value={progress}
                                            className="h-1.5"
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={isPending} className="min-w-[120px]">
                    {isPending ? "Uploading..." : "Upload Video"}
                </Button>
            </div>
        </form>
    )
}
