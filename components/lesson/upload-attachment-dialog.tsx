"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, FileText, X } from "lucide-react"
import { toast } from "sonner"
import { uploadLessonAttachment } from "@/lib/backend_actions/lesson"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { generatePresignedUrlForImage } from "@/lib/action"
import axios from "axios"
import { getAttachmentType } from "@/lib/utils"

const attachmentSchema = z.object({
    title: z.string().min(1, "Title is required"),
    file: z.any().optional(),
    sequence: z.number().int().optional(),
})

export default function UploadAttachmentDialog({ lessonId, children }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [attachmentFile, setAttachmentFile] = useState(null)
    const [attachmentPreview, setAttachmentPreview] = useState("")

    const form = useForm({
        defaultValues: {
            title: "",
            file: null,
            sequence: 0,
        } as z.input<typeof attachmentSchema>,
        validators: {
            onSubmit: attachmentSchema,
        },
        onSubmit: async ({ value }) => {
            if (!attachmentFile) {
                toast.error("Please select a file to upload")
                return
            }

            startTransition(async () => {
                try {
                    toast.info("Uploading attachment...")

                    const bucketName = "pankhuri-v3"
                    const fileExtension = attachmentFile.name.split('.').pop()
                    const key = `lesson_attachments/${Date.now()}_${lessonId}.${fileExtension}`

                    // Upload file to DigitalOcean Spaces
                    const { url } = await generatePresignedUrlForImage(bucketName, key, attachmentFile.type)

                    await axios.put(url, attachmentFile, {
                        headers: {
                            'Content-Type': attachmentFile.type,
                            'x-amz-acl': 'public-read'
                        }
                    })

                    const fileUrl = `https://${bucketName}.blr1.digitaloceanspaces.com/${key}`

                    // Create attachment record in database
                    const result = await uploadLessonAttachment(lessonId, {
                        title: value.title,
                        fileUrl: fileUrl,
                        fileName: attachmentFile.name,
                        fileSize: attachmentFile.size,
                        type: getAttachmentType(fileExtension.toLowerCase()),
                        mimeType: attachmentFile.type,
                        sequence: value.sequence
                    })

                    if (result.success) {
                        toast.success("Attachment uploaded successfully!")
                        setOpen(false)
                        form.reset()
                        setAttachmentFile(null)
                        setAttachmentPreview("")
                        router.refresh()
                    } else {
                        toast.error(result.error || "Failed to upload attachment")
                    }
                } catch (error) {
                    console.error("Upload error:", error)
                    toast.error("An unexpected error occurred during upload")
                }
            })
        },
    })

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setAttachmentFile(file)

        // Auto-populate title with filename if empty
        if (!form.state.values.title) {
            form.setFieldValue("title", file.name.replace(/\.[^/.]+$/, ""))
        }

        // Create preview for file info
        setAttachmentPreview(file.name)
    }

    const handleRemoveFile = () => {
        setAttachmentFile(null)
        setAttachmentPreview("")
        form.setFieldValue("file", null)
    }

    const handleOpenChange = (newOpen) => {
        if (!isPending) {
            setOpen(newOpen)
            if (!newOpen) {
                form.reset()
                setAttachmentFile(null)
                setAttachmentPreview("")
            }
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-gradient-brand" >Upload Attachment</DialogTitle>
                    <DialogDescription>
                        Add supplementary materials, resources, or files for this lesson
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-4"
                >
                    {/* Title Field */}
                    <form.Field
                        name="title"
                        children={(field) => (
                            <Field className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Attachment Title *</FieldLabel>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="e.g., Course Materials PDF"
                                    disabled={isPending}
                                />
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    {/* Sequence Field */}
                    <form.Field
                        name="sequence"
                        children={(field) => (
                            <Field className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Sequence *</FieldLabel>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(parseInt(e.target.value))}
                                    placeholder="e.g., Sequence number for ordering"
                                    disabled={isPending}
                                />
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    {/* File Upload Field */}
                    <form.Field
                        name="file"
                        children={(field) => (
                            <Field className="space-y-2">
                                <FieldLabel htmlFor={field.name}>File *</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="file"
                                    onChange={handleFileChange}
                                    disabled={isPending}
                                    className="cursor-pointer"
                                />
                                {attachmentFile && (
                                    <div className="relative flex items-center gap-2 p-3 bg-muted rounded-lg text-sm border-2">
                                        <FileText className="h-5 w-5 text-primary shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{attachmentFile.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(attachmentFile.size)}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveFile}
                                            disabled={isPending}
                                            className="shrink-0 h-8 w-8 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    <Field orientation="horizontal">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="flex-1" disabled={isPending}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending || !attachmentFile} variant="gradient" className="flex-1">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!isPending && <Upload className="mr-2 h-4 w-4" />}
                            Upload
                        </Button>
                    </Field>
                </form>
            </DialogContent>
        </Dialog>
    )
}
