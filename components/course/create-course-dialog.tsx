"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { generatePresignedUrlForImage } from "@/lib/action"
import { createCourse } from "@/lib/backend_actions/course"
import { handleImageChange } from "@/lib/utils"
import { useForm } from "@tanstack/react-form"
import axios from "axios"
import { VideoCombobox } from "./video-combobox"
import { Loader2, X, CircleDollarSign } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Switch } from "../ui/switch"
import { courseSchema } from "@/lib/zod/schema"
import z from "zod"



// ─────────────────────────────────────────────────────────────────────────────
// CourseFormContent — reusable form body.
// Used by CreateCourseDialog (standalone) AND by the Create Content Wizard.
// Props:
//   categories  — array of category objects { id, name }
//   trainers    — array of trainer objects  { id, user: { displayName } }
//   onSuccess   — called with { id, title } after the course is created
//   onCancel    — called when the user dismisses the form
//   cancelLabel — label for the dismiss button (default "Cancel")
// ─────────────────────────────────────────────────────────────────────────────
export function CourseFormContent({ categories, trainers = [], onSuccess, onCancel, cancelLabel = "Cancel" }: any) {
    const [isPending, startTransition] = useTransition()
    const [thumbnailPreview, setThumbnailPreview] = useState("")
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState("")
    const [coverFile, setCoverFile] = useState<File | null>(null)

    const form = useForm({
        defaultValues: {
            title: "",
            slug: "",
            description: "",
            thumbnailImage: "",
            coverImage: "",
            categoryId: "",
            trainerId: "",
            level: "beginner",
            duration: 0,
            language: "en",
            hasPricing: false,
            price: undefined,
            discountedPrice: undefined,
            hasCertificate: false,
            tags: [],
            demoVideoId: "",
        } as z.input<typeof courseSchema>,
        validators: {
            onSubmit: courseSchema,
        },
        onSubmit: async ({ value }) => {
            startTransition(async () => {
                try {
                    let thumbnailUrl = value.thumbnailImage
                    let coverUrl = value.coverImage
                    const public_bucketName = process.env.NEXT_PUBLIC_PUBLIC_BUCKET_NAME
                    const public_endpoint = process.env.NEXT_PUBLIC_PUBLIC_ASSET_ENDPOINT_URL

                    // Upload thumbnail if selected
                    if (thumbnailFile) {
                        toast.info("Uploading thumbnail...")
                        const thumbnailKey = `${process.env.NEXT_PUBLIC_BUCKET_MODE}/course-thumbnails/${Date.now()}_${thumbnailFile.name}`
                        const { url } = await generatePresignedUrlForImage(public_bucketName, thumbnailKey, thumbnailFile.type)

                        await axios.put(url, thumbnailFile, {
                            headers: {
                                'Content-Type': thumbnailFile.type,
                                // 'x-amz-acl': 'public-read'
                            },
                        })

                        thumbnailUrl = `${public_endpoint}/${thumbnailKey}`
                        toast.success("Thumbnail uploaded successfully")
                    }

                    // Upload cover if selected
                    if (coverFile) {
                        toast.info("Uploading cover image...")
                        const coverKey = `${process.env.NEXT_PUBLIC_BUCKET_MODE}/course-covers/${Date.now()}_${coverFile.name}`
                        const { url } = await generatePresignedUrlForImage(public_bucketName, coverKey, coverFile.type)

                        await axios.put(url, coverFile, {
                            headers: {
                                'Content-Type': coverFile.type,
                                // 'x-amz-acl': 'public-read'
                            },
                        })

                        coverUrl = `${public_endpoint}/${coverKey}`
                        toast.success("Cover image uploaded successfully")
                    }

                    // Create course with uploaded images
                    const result = await createCourse({
                        ...value,
                        thumbnailImage: thumbnailUrl,
                        coverImage: coverUrl,
                        price: value.hasPricing && value.price ? value.price * 100 : undefined,
                        discountedPrice: value.hasPricing && value.discountedPrice ? value.discountedPrice * 100 : undefined
                    })

                    if (result.success) {
                        toast.success("Course created successfully")
                        form.reset()
                        setThumbnailPreview("")
                        setThumbnailFile(null)
                        setCoverPreview("")
                        setCoverFile(null)
                        // Pass id + title back to caller (wizard uses this to advance steps)
                        const courseId = result.data?.id ?? result.data?.data?.id ?? ""
                        onSuccess({ id: courseId, title: value.title })
                    } else {
                        toast.warning(result.error || "Failed to create course")
                    }
                } catch (error: any) {
                    console.error("Error creating course:", error)
                    toast.error(error.message || "An unexpected error occurred")
                }
            })
        },
    })

    const handleRemoveThumbnail = () => {
        setThumbnailFile(null)
        setThumbnailPreview("")
        form.setFieldValue("thumbnailImage", "")
    }

    const handleRemoveCover = () => {
        setCoverFile(null)
        setCoverPreview("")
        form.setFieldValue("coverImage", "")
    }

    const handleTitleChange = (value: any) => {
        const slug = value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim()
        form.setFieldValue("slug", slug)
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <form.Field
                name="title"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="title">Course Title *</FieldLabel>
                        <Input
                            id="title"
                            placeholder="Enter course title"
                            disabled={isPending}
                            value={field.state.value}
                            onChange={(e) => {
                                field.handleChange(e.target.value)
                                handleTitleChange(e.target.value)
                            }}
                            onBlur={field.handleBlur}
                        />
                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                )}
            />

            <form.Field
                name="slug"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="slug">Slug *</FieldLabel>
                        <Input
                            id="slug"
                            placeholder="course-slug"
                            disabled={isPending}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                        />
                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                )}
            />

            <form.Field
                name="description"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="description">Description</FieldLabel>
                        <Textarea
                            id="description"
                            placeholder="Enter course description"
                            disabled={isPending}
                            rows={3}
                            value={field.state.value || ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                        />
                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                )}
            />

            <div className="p-4 rounded-xl border border-dashed bg-muted/40 transition-all duration-300 hover:bg-muted/60">
                <form.Field
                    name="hasPricing"
                    children={(field) => (
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <FieldLabel htmlFor={field.name} className="text-base font-semibold flex items-center gap-2">
                                    <CircleDollarSign className="w-4 h-4 text-primary" />
                                    Course Pricing
                                </FieldLabel>
                                <FieldDescription>
                                    Does this course have a specific price?
                                </FieldDescription>
                            </div>
                            <Switch
                                id={field.name}
                                checked={field.state.value}
                                onCheckedChange={(checked) => field.handleChange(checked)}
                            />
                        </div>
                    )}
                />


                <form.Subscribe selector={(state) => state.values.hasPricing}
                    children={(hasPricing) => (
                        hasPricing ? (
                            <div className="mt-6 pt-6 border-t border-dashed grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                {/* Insert price and discounted price */}
                                <form.Field
                                    name="price"
                                    children={(field) => (
                                        <Field className="flex flex-col gap-2">
                                            <FieldLabel htmlFor={field.name} className="text-sm font-medium text-foreground/80">
                                                Base Price (₹) *
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                disabled={isPending}
                                                type="number"
                                                onChange={(e) => field.handleChange(parseInt(e.target.value))}
                                                placeholder="0.00"
                                                className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1"
                                            />
                                            <FieldDescription className="text-[10px]">
                                                Original price before discount
                                            </FieldDescription>
                                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )}
                                />

                                {/* Discounted Price */}
                                <form.Field
                                    name="discountedPrice"
                                    children={(field) => (
                                        <Field className="flex flex-col gap-2">
                                            <FieldLabel htmlFor={field.name} className="text-sm font-medium text-foreground/80">
                                                Discounted Price (₹)
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                type="number"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(parseInt(e.target.value))}
                                                placeholder="0.00"
                                                className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1"
                                            />
                                            <FieldDescription className="text-[10px]">
                                                Final price users will pay
                                            </FieldDescription>
                                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )}
                                />
                            </div>
                        ) : null
                    )}
                />
            </div>

            <form.Field
                name="categoryId"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="categoryId">Category *</FieldLabel>
                        <Select
                            disabled={isPending}
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                )}
            />

            <form.Field
                name="trainerId"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="trainerId">Select Trainer *</FieldLabel>
                        <Select disabled={isPending} value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select trainer" />
                            </SelectTrigger>
                            <SelectContent>
                                {trainers.map((trainer: any) => (
                                    <SelectItem key={trainer.id} value={trainer.id}>
                                        {trainer.user.displayName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                )}
            />

            <form.Field
                name="demoVideoId"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="demoVideoId">Demo Video (Optional)</FieldLabel>
                        <VideoCombobox
                            value={field.state.value}
                            onValueChange={(value: any) => field.handleChange(value)}
                            disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Select a demo video to showcase this course
                        </p>
                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                )}
            />

            <Field orientation="horizontal">
                <form.Field
                    name="level"
                    children={(field) => (
                        <Field>
                            <FieldLabel htmlFor="level">Level</FieldLabel>
                            <Select
                                disabled={isPending}
                                value={field.state.value}
                                onValueChange={(value: "beginner" | "intermediate" | "advanced" | "expert") => field.handleChange(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                    <SelectItem value="expert">Expert</SelectItem>
                                </SelectContent>
                            </Select>
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )}
                />

                <form.Field
                    name="duration"
                    children={(field) => (
                        <Field>
                            <FieldLabel htmlFor="duration">Duration (minutes)</FieldLabel>
                            <Input
                                id="duration"
                                type="number"
                                placeholder="60"
                                disabled={isPending}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                                onBlur={field.handleBlur}
                            />
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )}
                />
            </Field>

            <Field orientation="horizontal">
                <form.Field
                    name="language"
                    children={(field) => (
                        <Field>
                            <FieldLabel htmlFor="language">Language</FieldLabel>
                            <Input
                                id="language"
                                placeholder="en"
                                disabled={isPending}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )}
                />

                <form.Field
                    name="hasCertificate"
                    children={(field) => (
                        <Field>
                            <FieldLabel htmlFor="hasCertificate">Certificate</FieldLabel>
                            <Select
                                disabled={isPending}
                                value={field.state.value ? "true" : "false"}
                                onValueChange={(value) => field.handleChange(value === "true")}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Yes</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                            </Select>
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )}
                />
            </Field>

            <Field orientation="horizontal">

                <form.Field
                    name="thumbnailImage"
                    children={(field) => (
                        <Field>
                            <FieldLabel htmlFor="thumbnail">Thumbnail Image</FieldLabel>
                            <Input
                                id="thumbnail"
                                type="file"
                                accept="image/*"
                                disabled={isPending}
                                onChange={e => { handleImageChange(e, setThumbnailFile, setThumbnailPreview) }}
                                className="cursor-pointer"
                            />
                            {thumbnailFile && <p className="text-sm text-muted-foreground mt-1">Selected: {thumbnailFile.name}</p>}
                            {thumbnailPreview && (
                                <div className="relative w-full aspect-video rounded-md overflow-hidden border border-input mt-2">
                                    <Image src={thumbnailPreview} alt="Thumbnail Preview" fill className="object-cover" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={handleRemoveThumbnail}
                                        disabled={isPending}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )}
                />

                <form.Field
                    name="coverImage"
                    children={(field) => (
                        <Field>
                            <FieldLabel htmlFor="cover">Cover Image</FieldLabel>
                            <Input
                                id="cover"
                                type="file"
                                accept="image/*"
                                disabled={isPending}
                                onChange={e => { handleImageChange(e, setCoverFile, setCoverPreview) }}
                                className="cursor-pointer"
                            />
                            {coverFile && <p className="text-sm text-muted-foreground mt-1">Selected: {coverFile.name}</p>}
                            {coverPreview && (
                                <div className="relative w-full aspect-video rounded-md overflow-hidden border border-input mt-2">
                                    <Image src={coverPreview} alt="Cover Preview" fill className="object-cover" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={handleRemoveCover}
                                        disabled={isPending}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )}
                />
            </Field>

            <Field orientation="horizontal">
                <Button type="button" variant="outline" disabled={isPending} onClick={onCancel} className="flex-1">
                    {cancelLabel}
                </Button>
                <Button type="submit" disabled={isPending} variant="gradient" className="flex-1">
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        "Create Course"
                    )}
                </Button>
            </Field>
        </form>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// CreateCourseDialog — standalone dialog wrapper (unchanged public API).
// ─────────────────────────────────────────────────────────────────────────────
export function CreateCourseDialog({ children, categories, trainers = [] }: any) {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>Add a new course to your platform</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[600px] w-full pr-4">
                    <CourseFormContent
                        categories={categories}
                        trainers={trainers}
                        onSuccess={() => { setOpen(false); router.refresh() }}
                        onCancel={() => setOpen(false)}
                    />
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
