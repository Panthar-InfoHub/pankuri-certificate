"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VideoDescriptionSection } from "./video-description-section"
import { generatePresignedUrlForImage } from "@/lib/action"
import { useForm } from "@tanstack/react-form"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { updateVideo } from "@/lib/backend_actions/videos"

export function EditVideoDialog({ video, children }) {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        defaultValues: {
            title: video.title || "",
            duration: video.duration || 0,
            externalUrl: video.externalUrl || "",
            videoQuality: video.metadata?.quality?.toString() || "720",
            isShort: video.metadata?.isShort || false,
            videoDescription: video.videoDescription || null,
        },
        onSubmit: async ({ value }) => {
            setIsSubmitting(true)
            try {
                // Determine bucket name - same logic as video upload form
                const bucketName = "pankhuri-v3"

                // Process product images if updated/new
                let videoDescriptionWithUrls = value.videoDescription
                if (value.videoDescription?.products?.length > 0) {

                    const productsWithUrls = await Promise.all(
                        value.videoDescription.products.map(async (product) => {
                            // Only upload if it's a new File object
                            if (product.image && product.image instanceof File) {
                                toast.info(`Uploading image for ${product.name}...`)
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

                    videoDescriptionWithUrls = {
                        ...value.videoDescription,
                        products: productsWithUrls
                    }
                }

                const payload = {
                    title: value.title,
                    duration: parseInt(value.duration.toString()) || 0,
                    externalUrl: value.externalUrl || null,
                    metadata: {
                        quality: parseInt(value.videoQuality.toString()) || 0,
                        isShort: value.isShort,
                    },
                    videoDescription: videoDescriptionWithUrls,
                }

                const result = await updateVideo(video.id, payload)

                if (result.success) {
                    toast.success("Video updated successfully!")
                    setOpen(false)
                    router.refresh()
                } else {
                    toast.error(result.error || "Failed to update video")
                }
            } catch (error) {
                console.error("Update error:", error)
                toast.error("An unexpected error occurred")
            } finally {
                setIsSubmitting(false)
            }
        },
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Video Details</DialogTitle>
                    <DialogDescription>
                        Update video title, metadata and description. The video file itself cannot be changed.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-6 pb-4"
                >
                    {/* Title */}
                    <form.Field
                        name="title"
                        children={(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="title">Title of Video</Label>
                                <Input
                                    id="title"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Enter video title"
                                />
                            </div>
                        )}
                    />

                    <form.Field
                        name="externalUrl"
                        children={(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="externalUrl">External URL</Label>
                                {field.state.value}
                                <Input
                                    id="externalUrl"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Enter external URL"
                                />
                            </div>
                        )}
                    />

                    {/* Meta Data Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <form.Field
                            name="videoQuality"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="quality">Video Quality</Label>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(value) => field.handleChange(value)}
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
                                        onValueChange={(value) => field.handleChange(value === "true")}
                                    >
                                        <SelectTrigger id="isShort">
                                            <SelectValue placeholder="Select video type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Short</SelectItem>
                                            <SelectItem value="false">Long</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />

                        <form.Field
                            name="duration"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (seconds)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="Duration in seconds"
                                    />
                                </div>
                            )}
                        />
                    </div>

                    {/* Video Description Section */}
                    <form.Field
                        name="videoDescription"
                        children={(field) => (
                            <VideoDescriptionSection
                                value={field.state.value}
                                onChange={(value) => field.handleChange(value)}
                                disabled={isSubmitting}
                            />
                        )}
                    />

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isSubmitting}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting} variant="gradient" className="min-w-[120px]">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Video"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
