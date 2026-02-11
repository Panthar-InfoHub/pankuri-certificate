"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { completeMultipartUpload, createMultipartUpload, generatePresignedUrlForImage, generatePresignedUrls } from "@/lib/action"
import { createVideo } from "@/lib/backend_actions/videos"
import { determineQuality, formatDuration, getVideoMetadata } from "@/lib/utils"
import { useForm } from "@tanstack/react-form"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { VideoDescriptionSection } from "./video-upload/video-description-section"

const CHUNK_SIZE = 10 * 1024 * 1024 // 10 mb 


export function VideoUploadForm({ onSuccess }) {
    const [isPending, startTransition] = useTransition()
    const [partProgress, setPartProgress] = useState({})
    const [thumbnailProgress, setThumbnailProgress] = useState(0)
    const [totalParts, setTotalParts] = useState(0)
    const router = useRouter();
    const [uploadStatus, setUploadStatus] = useState("idle")

    const form = useForm({
        defaultValues: {
            thumbnail: null,
            title: null,
            videoQuality: "720",
            isShort: false,
            video: null,
            externalUrl: "",
            duration: "",
            videoDescription: null,
        },
        onSubmit: async ({ value }) => {
            console.log("value", value)
            startTransition(async () => {
                toast.info("Initializing upload...")

                const file = value.video
                const bucketName = "pankhuri-v3"
                const key = `${process.env.NEXT_PUBLIC_BUCKET_MODE}/videos/${Date.now()}_${file.name}`

                try {
                    // 1. Create a multipart upload to get an UploadId
                    toast.info("Getting upload session...")

                    const allUploadTasks = []

                    const videoUploadPromise = (async () => {
                        const uploadId = await createMultipartUpload(bucketName, key, file.type)

                        if (!uploadId) {
                            throw new Error("Failed to create multipart upload.")
                        }

                        // console.log("Upload ID:", uploadId)

                        // 2. Generate presigned URLs for each part
                        toast.info("Preparing upload parts...")
                        const calculatedTotalParts = Math.ceil(file.size / CHUNK_SIZE)
                        setTotalParts(calculatedTotalParts)

                        // console.log("\n partss ==> ", calculatedTotalParts)
                        const presignedUrlsData = await generatePresignedUrls(bucketName, key, uploadId, calculatedTotalParts)

                        // console.log("\nPresigned URLs:", presignedUrlsData)

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
                        // console.log("\nUploaded Parts:", uploadedParts)
                        // 4. Complete the multipart upload
                        toast.info("Finalizing video upload...")
                        await completeMultipartUpload(bucketName, key, uploadId, uploadedParts)
                    })()

                    allUploadTasks.push(videoUploadPromise);

                    if (value.thumbnail) {
                        const thumbnailUploadPromise = (async () => {
                            const thumbnailKey = `${process.env.NEXT_PUBLIC_BUCKET_MODE}/video-thumbnails/${Date.now()}_${value.thumbnail.name}`
                            const { url } = await generatePresignedUrlForImage(bucketName, thumbnailKey, value.thumbnail.type)
                            await axios.put(url, value.thumbnail,
                                {
                                    headers: {
                                        'Content-Type': value.thumbnail.type,
                                        'x-amz-acl': 'public-read'
                                    },
                                    onUploadProgress: (progressEvent) => {
                                        setThumbnailProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
                                    },
                                })
                            const publicThumbnailUrl = `https://${bucketName}.blr1.digitaloceanspaces.com/${thumbnailKey}`;

                            return publicThumbnailUrl;
                        })()
                        allUploadTasks.push(thumbnailUploadPromise)
                    }
                    console.log("\nAll upload tasks added....")


                    const result = await Promise.all(allUploadTasks)

                    console.log("\nAll upload tasks completed....", result)
                    toast.success("\nUpload complete!")
                    setUploadStatus("success")

                    // Upload product images if any
                    let videoDescriptionWithUrls = value.videoDescription
                    if (value.videoDescription?.products?.length > 0) {

                        console.debug("Products with images found, uploading images... ==> ", value.videoDescription.products)
                        toast.info("Uploading product images...")
                        const productsWithUrls = await Promise.all(
                            value.videoDescription.products.map(async (product) => {
                                if (product.image && product.image instanceof File) {
                                    const imageKey = `${process.env.NEXT_PUBLIC_BUCKET_MODE}/product-images/${Date.now()}_${product.image.name}`
                                    const { url } = await generatePresignedUrlForImage(bucketName, imageKey, product.image.type)

                                    await axios.put(url, product.image, {
                                        headers: {
                                            'Content-Type': product.image.type,
                                            'x-amz-acl': 'public-read'
                                        }
                                    })

                                    const publicImageUrl = `https://${bucketName}.blr1.digitaloceanspaces.com/${imageKey}`
                                    return { ...product, image: publicImageUrl }
                                }
                                return product
                            })
                        )

                        console.debug("Products with uploaded image URLs: ", productsWithUrls)

                        videoDescriptionWithUrls = {
                            ...value.videoDescription,
                            products: productsWithUrls
                        }
                    }

                    console.log("\nFinal video description with URLs: ", videoDescriptionWithUrls)

                    console.log("\nUpdating backend with video details...")
                    await createVideo({
                        title: value.title,
                        thumbnailUrl: result.length > 1 ? result[1] : "",
                        storageKey: key,
                        metadata: {
                            quality: parseInt(value.videoQuality, 10) || 0,
                            isShort: value.isShort,
                        },
                        externalUrl: value.externalUrl || null,
                        duration: parseInt(value.duration, 10) || 0,
                        status: "processing",
                        quality: parseInt(value.videoQuality, 10) || 0,
                        videoDescription: videoDescriptionWithUrls || null,
                    });

                    // Reset after a delay
                    setTimeout(() => {
                        setPartProgress({})
                        setTotalParts(0)
                        setUploadStatus("idle")
                        router.refresh();
                        if (onSuccess) onSuccess()
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

    const handleVideoChange = async (e) => {
        const file = e.target.files?.[0] || null
        form.setFieldValue("video", file)
        console.log("Form state after:", form.state.values.video)

        try {

            const metadata = await getVideoMetadata(file)
            const quality = determineQuality(metadata.height)
            form.setFieldValue("videoQuality", quality)
            form.setFieldValue("duration", metadata.duration.toString())

            const isShort = metadata.duration < 60
            form.setFieldValue("isShort", isShort)

            toast.success(
                `Video analyzed: ${quality}p (${metadata.width}x${metadata.height}), ${formatDuration(metadata.duration)}${isShort ? ' - Short detected!' : ''}`
            )
        } catch (error) {
            console.error("Failed to extract video metadata:", error)
            toast.warning("Could not auto-detect video properties. Please set manually.")
        }
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
            className="space-y-6 pb-4 px-2"
        >
            {/* Video title Field */}
            <form.Field
                name="title"
                children={(field) => (
                    <div className="space-y-2">
                        <Label htmlFor="title">Title of Video</Label>
                        <Input
                            id="title"
                            type="text"
                            onChange={(e) => form.setFieldValue("title", e.target.value)}
                            disabled={isPending}
                            placeholder="Enter video title"
                        />
                        <p className="text-xs text-muted-foreground">Write the title of your video</p>
                    </div>
                )}
            />

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
            {/* Video Url Field */}
            <form.Field
                name="externalUrl"
                children={(field) => (
                    <div className="space-y-2">
                        <Label htmlFor="externalUrl">Video URL</Label>
                        <Input
                            id="externalUrl"
                            type="text"
                            value={field.state.value}
                            placeholder="http://digitalocean...."
                            onChange={(e) => form.setFieldValue("externalUrl", e.target.value)}
                            disabled={isPending}
                            className="cursor-pointer"
                        />
                        {field.state.value && <p className="text-sm text-muted-foreground">Entered URL: {field.state.value}</p>}
                        <p className="text-xs text-muted-foreground">Enter the URL of the video </p>
                    </div>
                )}
            />

            {/* Video Quality and Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <SelectItem value="360">360p</SelectItem>
                                    <SelectItem value="480">480p</SelectItem>
                                    <SelectItem value="720">720p (HD)</SelectItem>
                                    <SelectItem value="1080">1080p (Full HD)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Output quality</p>
                        </div>
                    )}
                />

                <form.Field
                    name="isShort"
                    children={(field) => (
                        <div className="space-y-2">
                            <Label htmlFor="isShort">Video Type</Label>
                            <Select
                                value={field.state.value ? "true" : "false"}
                                onValueChange={(value) => form.setFieldValue("isShort", (value === "true"))}
                                disabled={isPending}
                            >
                                <SelectTrigger id="isShort">
                                    <SelectValue placeholder="Select video type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Short</SelectItem>
                                    <SelectItem value="false">Long</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Video type</p>
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
                                placeholder="e.g., 5:30"
                                value={field.state.value}
                                onChange={handleDurationChange}
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">MM:SS or seconds</p>
                        </div>
                    )}
                />
            </div>


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



            {/* Video Description Section */}
            <form.Field
                name="videoDescription"
                children={(field) => (
                    <VideoDescriptionSection
                        value={field.state.value}
                        onChange={(value) => form.setFieldValue("videoDescription", value)}
                        disabled={isPending}
                    />
                )}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={isPending} variant="gradient" className="min-w-[120px]">
                    {isPending ? "Uploading..." : "Upload Video"}
                </Button>
            </div>
        </form>
    )
}
