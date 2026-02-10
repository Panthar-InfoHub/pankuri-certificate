"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateLesson } from "@/lib/backend_actions/lesson"
import { getModulesByCourse } from "@/lib/backend_actions/module"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { VideoCombobox } from "@/components/course/video-combobox"

const lessonSchema = z.object({
    courseId: z.string().min(1, "Course is required"),
    moduleId: z.string().min(1, "Module is required"),
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
    type: z.enum(["video", "text"]),
    description: z.string().optional(),
    sequence: z.number().int().min(0, "Sequence must be at least 0"),
    duration: z.number().int().min(0).optional(),
    isFree: z.boolean(),
    isMandatory: z.boolean(),
    status: z.enum(["draft", "published", "archived", "scheduled"]),
    scheduledAt: z.string().optional(),
    // Video lesson fields
    videoId: z.string().optional(),
    // Text lesson fields
    textContent: z.string().optional(),
    estimatedReadTime: z.number().int().min(0).optional(),
}).refine((data) => {
    if (data.status === "scheduled" && !data.scheduledAt) {
        return false;
    }
    return true;
}, {
    message: "Scheduled time is required for scheduled status",
    path: ["scheduledAt"]
})
interface EditDialogProps {
    lesson: z.infer<typeof lessonSchema> & {
        id: string
        scheduledAt?: string
        videoLesson?: { videoId?: string }
        textLesson?: { content?: string, estimatedReadTime?: number }
    }
    courses: any
    children: React.ReactNode
}

export default function EditLessonDialog({ lesson, courses, children }: EditDialogProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [modules, setModules] = useState([])
    const [loadingModules, setLoadingModules] = useState(false)

    // Fetch modules when dialog opens or course changes
    useEffect(() => {
        const fetchModules = async () => {
            const courseId = lesson.courseId || form.state.values.courseId
            if (open && courseId) {
                setLoadingModules(true)
                try {
                    const result = await getModulesByCourse(courseId, { limit: 100 })
                    setModules(result.success ? result.data : [])
                } catch (error) {
                    setModules([])
                } finally {
                    setLoadingModules(false)
                }
            }
        }
        fetchModules()
    }, [open, lesson.courseId])


    const form = useForm({
        defaultValues: {
            courseId: lesson.courseId || "",
            moduleId: lesson.moduleId || "",
            title: lesson.title || "",
            slug: lesson.slug || "",
            type: lesson.type || "video" as "video" | "text",
            description: lesson.description || "",
            sequence: lesson.sequence || 0,
            duration: lesson.duration || 0,
            isFree: lesson.isFree || false,
            isMandatory: lesson.isMandatory !== undefined ? lesson.isMandatory : true,
            status: lesson.status || "draft" as "draft" | "published" | "archived" | "scheduled",
            scheduledAt: lesson.scheduledAt ? lesson.scheduledAt.substring(0, 16) : "",
            videoId: lesson.videoLesson?.videoId || "",
            textContent: lesson.textLesson?.content || "",
            estimatedReadTime: lesson.textLesson?.estimatedReadTime || 0,
        } as z.input<typeof lessonSchema>,
        validators: {
            onSubmit: lessonSchema,
        },
        onSubmit: async ({ value }) => {
            setIsSubmitting(true)
            try {
                // Format scheduledAt to include IST timezone offset if it exists
                let formattedScheduledAt = value.scheduledAt;
                if (value.status === "scheduled" && value.scheduledAt) {
                    // If it doesn't already have a timezone, append IST (+05:30)
                    if (!value.scheduledAt.includes("+") && !value.scheduledAt.includes("Z")) {
                        formattedScheduledAt = `${value.scheduledAt}:00+05:30`;
                    }
                }

                const payload = {
                    ...value,
                    moduleId: value.moduleId || null,
                    duration: value.duration || undefined,
                    description: value.description || undefined,
                    scheduledAt: value.status === "scheduled" ? formattedScheduledAt : undefined,
                    videoId: value.type === "video" ? value.videoId || undefined : undefined,
                    textContent: value.type === "text" ? value.textContent || undefined : undefined,
                    estimatedReadTime: value.type === "text" ? value.estimatedReadTime || undefined : undefined,
                }

                const result = await updateLesson(lesson.id, payload)

                if (result.success) {
                    toast.success("Lesson updated successfully!")
                    setOpen(false)
                    router.refresh()
                } else {
                    toast.error(result.error || "Failed to update lesson")
                }
            } catch (error) {
                toast.error("An unexpected error occurred")
            } finally {
                setIsSubmitting(false)
            }
        },
    })

    // Fetch modules when course is changed
    const handleCourseChange = async (courseId: string) => {
        form.setFieldValue("courseId", courseId)
        form.setFieldValue("moduleId", "") // Reset module selection

        if (courseId) {
            setLoadingModules(true)
            try {
                const result = await getModulesByCourse(courseId, { limit: 100 })
                setModules(result.success ? result.data : [])
            } catch (error) {
                setModules([])
                toast.error("Failed to load modules")
            } finally {
                setLoadingModules(false)
            }
        } else {
            setModules([])
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Lesson</DialogTitle>
                    <DialogDescription>
                        Update lesson information and settings
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-6"
                >
                    {/* Course Selection */}
                    <form.Field
                        name="courseId"
                        children={(field) => (
                            <Field className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Course *</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value) => {
                                        field.handleChange(value)
                                        handleCourseChange(value)
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    <form.Field
                        name="moduleId"
                        children={(field) => (
                            <Field className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Module *</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value)}
                                    disabled={!form.state.values.courseId || loadingModules || modules.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={
                                            loadingModules ? "Loading modules..." :
                                                modules.length === 0 ? "No modules available" :
                                                    "Select a module"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modules.map((module) => (
                                            <SelectItem key={module.id} value={module.id}>
                                                {module.sequence}. {module.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {!form.state.values.courseId ? "Select a course first" :
                                        modules.length === 0 ? "This course has no modules" :
                                            "Lessons must belong to a specific module within the course"}
                                </p>
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    {/* Title */}
                    <form.Field
                        name="title"
                        children={(field) => (
                            <Field className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Lesson Title *</FieldLabel>
                                <Input
                                    id={field.name}
                                    placeholder="e.g., Introduction to Components"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    {/* Slug */}
                    <form.Field
                        name="slug"
                        children={(field) => (
                            <Field className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Slug *</FieldLabel>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="introduction-to-components"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use lowercase letters, numbers, and hyphens only.
                                </p>
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    {/* Lesson Type */}
                    <form.Field
                        name="type"
                        children={(field) => (
                            <Field className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Lesson Type *</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value: 'video' | 'text') => field.handleChange(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                    </SelectContent>
                                </Select>
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    {/* Description */}
                    <form.Field
                        name="description"
                        children={(field) => (
                            <Field className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                                <Textarea
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Brief description of the lesson content"
                                    rows={3}
                                />
                            </Field>
                        )}
                    />

                    {/* Video Selection - Only show if type is video */}
                    {form.state.values.type === "video" && (
                        <form.Field
                            name="videoId"
                            children={(field) => (
                                <Field className="space-y-2">
                                    <FieldLabel htmlFor={field.name}>Select Video *</FieldLabel>
                                    <VideoCombobox
                                        value={field.state.value}
                                        onValueChange={(value) => field.handleChange(value)}
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Upload videos from the <strong>Video Upload</strong> page, then select them here
                                    </p>
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />
                    )}

                    {/* Text Content - Only show if type is text */}
                    {form.state.values.type === "text" && (
                        <>
                            <form.Field
                                name="textContent"
                                children={(field) => (
                                    <Field className="space-y-2">
                                        <FieldLabel htmlFor={field.name}>Text Content *</FieldLabel>
                                        <Textarea
                                            id={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="Enter the lesson content here..."
                                            rows={8}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Main text content for this lesson
                                        </p>
                                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                )}
                            />

                            <form.Field
                                name="estimatedReadTime"
                                children={(field) => (
                                    <Field className="space-y-2">
                                        <FieldLabel htmlFor={field.name}>Estimated Read Time (minutes)</FieldLabel>
                                        <Input
                                            id={field.name}
                                            type="number"
                                            min="0"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                                            placeholder="e.g., 5"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Approximate time to read this lesson content
                                        </p>
                                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                )}
                            />
                        </>
                    )}

                    <Field orientation="horizontal">
                        {/* Sequence */}
                        <form.Field
                            name="sequence"
                            children={(field) => (
                                <Field className="space-y-2">
                                    <FieldLabel htmlFor={field.name}>Sequence *</FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="number"
                                        min="0"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                                    />
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />

                        {/* Status */}
                        <form.Field
                            name="status"
                            children={(field) => (
                                <Field className="space-y-2">
                                    <FieldLabel htmlFor={field.name}>Status *</FieldLabel>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(value: 'draft' | 'published' | 'archived' | 'scheduled') => field.handleChange(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />
                    </Field>

                    {/* Scheduled At - Only show if status is scheduled */}
                    <form.Subscribe
                        selector={(state) => state.values.status}
                        children={(status) => (
                            status === "scheduled" && (
                                <form.Field
                                    name="scheduledAt"
                                    children={(field) => (
                                        <Field className="space-y-2">
                                            <FieldLabel htmlFor={field.name}>Schedule At (IST) *</FieldLabel>
                                            <Input
                                                id={field.name}
                                                type="datetime-local"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Select the date and time for the lesson to go live.
                                            </p>
                                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )}
                                />
                            )
                        )}
                    />

                    {/* Duration (optional) */}
                    <form.Field
                        name="duration"
                        children={(field) => (
                            <Field className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Duration (minutes)</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="number"
                                    min="0"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                                    placeholder="Optional - estimated time to complete"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Optional: Estimated time for students to complete this lesson
                                </p>
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    <Field orientation="horizontal">
                        {/* Is Free */}
                        <form.Field
                            name="isFree"
                            children={(field) => (
                                <Field className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <FieldLabel htmlFor={field.name}>Free Preview</FieldLabel>
                                        <Switch
                                            id={field.name}
                                            checked={field.state.value}
                                            onCheckedChange={(checked) => field.handleChange(checked)}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Allow users to access this lesson for free
                                    </p>
                                </Field>
                            )}
                        />

                        {/* Is Mandatory */}
                        <form.Field
                            name="isMandatory"
                            children={(field) => (
                                <Field className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <FieldLabel htmlFor={field.name}>Mandatory</FieldLabel>
                                        <Switch
                                            id={field.name}
                                            checked={field.state.value}
                                            onCheckedChange={(checked) => field.handleChange(checked)}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Required for course completion
                                    </p>
                                </Field>
                            )}
                        />
                    </Field>

                    <Field orientation="horizontal">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="flex-1">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting} variant="gradient" className="flex-1">
                            {isSubmitting && <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating... </>}
                            Update Lesson
                        </Button>
                    </Field>
                </form>
            </DialogContent>
        </Dialog>
    )
}
