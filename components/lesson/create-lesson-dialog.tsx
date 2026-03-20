"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, GraduationCap, LayoutList } from "lucide-react"
import { toast } from "sonner"
import { createLesson } from "@/lib/backend_actions/lesson"
import { getModulesByCourse } from "@/lib/backend_actions/module"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { VideoCombobox } from "@/components/course/video-combobox"
import MDEditor, { commands } from "@uiw/react-md-editor"
import "@uiw/react-md-editor/markdown-editor.css"

// moduleId is optional here so the wizard can skip the module step (sends null)
const lessonSchema = z.object({
    courseId: z.string().min(1, "Course is required"),
    moduleId: z.string().optional(),
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
    videoId: z.string().optional(),
    textContent: z.string().optional(),
    estimatedReadTime: z.number().int().min(0).optional(),
}).refine((data) => {
    if (data.status === "scheduled" && !data.scheduledAt) return false
    return true
}, {
    message: "Scheduled time is required for scheduled status",
    path: ["scheduledAt"],
})

const editorCommands = [
    commands.bold, commands.italic, commands.strikethrough, commands.divider,
    commands.link, commands.quote, commands.code, commands.codeBlock,
    commands.unorderedListCommand, commands.orderedListCommand,
]

// ─────────────────────────────────────────────────────────────────────────────
// LessonFormContent — reusable form body.
// Used by CreateLessonDialog (standalone) AND by the Create Content Wizard.
// Props:
//   lockedCourseId   — when set, course select is hidden and shown as a locked pill
//   lockedCourseName — display name for the locked course pill
//   lockedModuleId   — undefined = not locked; null = locked but no module; string = locked to specific module
//   lockedModuleName — display name for the locked module pill
//   courses          — array used in standalone when course is not locked
//   onSuccess        — called after lesson is created
//   onCancel         — called when user dismisses (back / cancel)
//   cancelLabel      — label for the dismiss button (default "Cancel")
// ─────────────────────────────────────────────────────────────────────────────
export function LessonFormContent({
    lockedCourseId,
    lockedCourseName = "",
    lockedModuleId,
    lockedModuleName = "",
    courses = [],
    onSuccess,
    onCancel,
    cancelLabel = "Cancel",
}: {
    lockedCourseId?: string
    lockedCourseName?: string
    lockedModuleId?: string | null
    lockedModuleName?: string
    courses?: any[]
    onSuccess: () => void
    onCancel: () => void
    cancelLabel?: string
}) {
    const [isPending, startTransition] = useTransition()
    const [modules, setModules] = useState<any[]>([])
    const [loadingModules, setLoadingModules] = useState(false)

    const courseIsLocked = !!lockedCourseId
    const moduleIsLocked = lockedModuleId !== undefined

    const form = useForm({
        defaultValues: {
            courseId: lockedCourseId || "",
            moduleId: lockedModuleId ?? "",
            title: "",
            slug: "",
            type: "video" as "video" | "text",
            description: "",
            sequence: 0,
            duration: 0,
            isFree: false,
            isMandatory: true,
            status: "draft" as "draft" | "published" | "archived" | "scheduled",
            scheduledAt: "",
            videoId: "",
            textContent: "",
            estimatedReadTime: 0,
        } as z.input<typeof lessonSchema>,
        validators: { onSubmit: lessonSchema },
        onSubmit: async ({ value }) => {
            try {
                startTransition(async () => {
                    let formattedScheduledAt = value.scheduledAt
                    if (value.status === "scheduled" && value.scheduledAt) {
                        if (!value.scheduledAt.includes("+") && !value.scheduledAt.includes("Z")) {
                            formattedScheduledAt = `${value.scheduledAt}:00+05:30`
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
                    const result = await createLesson(payload)
                    if (result.success) {
                        toast.success("Lesson created successfully!")
                        form.reset()
                        onSuccess()
                    } else {
                        toast.error(result.error || "Failed to create lesson")
                    }
                })
            } catch {
                toast.error("An unexpected error occurred")
            }
        },
    })

    const fetchModules = async (courseId: string) => {
        if (!courseId) { setModules([]); return }
        setLoadingModules(true)
        try {
            const result = await getModulesByCourse(courseId, { limit: 100 })
            setModules(result.success ? result.data : [])
        } catch {
            setModules([])
            toast.error("Failed to load modules")
        } finally {
            setLoadingModules(false)
        }
    }

    const handleCourseChange = (courseId: string) => {
        form.setFieldValue("courseId", courseId)
        form.setFieldValue("moduleId", "")
        fetchModules(courseId)
    }

    const handleTitleChange = (value: string) => {
        form.setFieldValue("slug", value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim()
        )
    }

    // Pre-fetch modules when course is locked and module is not (module select still shown)
    useEffect(() => {
        if (lockedCourseId && !moduleIsLocked) {
            fetchModules(lockedCourseId)
        }
    }, [lockedCourseId])

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit() }}
            className="space-y-6"
        >
            {/* ── Locked context pills (shown in wizard when course/module are pre-set) ── */}
            {(courseIsLocked || moduleIsLocked) && (
                <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/50 border border-dashed">
                    {courseIsLocked && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full">
                            <GraduationCap className="w-3 h-3" />
                            {lockedCourseName || lockedCourseId}
                        </span>
                    )}
                    {moduleIsLocked && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
                            <LayoutList className="w-3 h-3" />
                            {lockedModuleId === null ? "No module" : (lockedModuleName || lockedModuleId)}
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">Context from previous steps</span>
                </div>
            )}

            {/* ── Course select (only in standalone) ── */}
            {!courseIsLocked && (
                <form.Field
                    name="courseId"
                    children={(field) => (
                        <Field className="space-y-2">
                            <FieldLabel htmlFor={field.name}>Course *</FieldLabel>
                            <Select
                                value={field.state.value}
                                onValueChange={(value) => { field.handleChange(value); handleCourseChange(value) }}
                            >
                                <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )}
                />
            )}

            {/* ── Module select (only when module is not locked) ── */}
            {!moduleIsLocked && (
                <form.Field
                    name="moduleId"
                    children={(field) => (
                        <Field className="space-y-2">
                            <FieldLabel htmlFor={field.name}>Module</FieldLabel>
                            <Select
                                value={field.state.value}
                                onValueChange={(value) => field.handleChange(value)}
                                disabled={!form.state.values.courseId || loadingModules}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={
                                        loadingModules ? "Loading modules..." :
                                            modules.length === 0 ? "No modules available" : "Select a module"
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
                                        "Optional — assign this lesson to a module"}
                            </p>
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )}
                />
            )}

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
                            onChange={(e) => { field.handleChange(e.target.value); handleTitleChange(e.target.value) }}
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
                        <p className="text-xs text-muted-foreground">Auto-generated from title. Lowercase, numbers, hyphens only.</p>
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
                        <div data-color-mode="light" className="rounded-md border border-input bg-background">
                            <MDEditor
                                id={field.name}
                                value={field.state.value}
                                onChange={(v) => field.handleChange(v || "")}
                                commands={editorCommands}
                                preview="edit"
                                height={220}
                                textareaProps={{ placeholder: "Brief description of the lesson content..." }}
                            />
                        </div>
                    </Field>
                )}
            />

            {/* Type + Status */}
            <Field orientation="horizontal">
                <form.Field
                    name="type"
                    children={(field) => (
                        <Field className="space-y-2">
                            <FieldLabel htmlFor={field.name}>Lesson Type *</FieldLabel>
                            <Select
                                value={field.state.value}
                                onValueChange={(value: "video" | "text") => field.handleChange(value)}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                </SelectContent>
                            </Select>
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )}
                />
                <form.Field
                    name="status"
                    children={(field) => (
                        <Field className="space-y-2">
                            <FieldLabel htmlFor={field.name}>Status *</FieldLabel>
                            <Select
                                value={field.state.value}
                                onValueChange={(value: "draft" | "published" | "archived" | "scheduled") => field.handleChange(value)}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
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

            {/* Scheduled At */}
            <form.Subscribe
                selector={(state) => state.values.status}
                children={(status) => status === "scheduled" && (
                    <form.Field
                        name="scheduledAt"
                        children={(field) => (
                            <Field className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Schedule At (IST) *</FieldLabel>
                                <Input id={field.name} type="datetime-local" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                <p className="text-xs text-muted-foreground">Select the date and time for the lesson to go live.</p>
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />
                )}
            />

            {/* Video / Text content */}
            <form.Subscribe
                selector={(state) => state.values.type}
                children={() => (
                    <>
                        {form.state.values.type === "video" && (
                            <>
                                <form.Field
                                    name="videoId"
                                    children={(field) => (
                                        <Field className="space-y-2">
                                            <FieldLabel htmlFor={field.name}>Select Video *</FieldLabel>
                                            <VideoCombobox value={field.state.value} onValueChange={(v) => field.handleChange(v)} disabled={isPending} />
                                            <p className="text-xs text-muted-foreground">Upload videos from the <strong>Video Upload</strong> page, then select them here</p>
                                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )}
                                />
                                <form.Field
                                    name="duration"
                                    children={(field) => (
                                        <Field className="space-y-2">
                                            <FieldLabel htmlFor={field.name}>Duration (min)</FieldLabel>
                                            <Input id={field.name} type="number" min="0" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)} placeholder="Optional" />
                                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )}
                                />
                            </>
                        )}
                        {form.state.values.type === "text" && (
                            <>
                                <form.Field
                                    name="textContent"
                                    children={(field) => (
                                        <Field className="space-y-2">
                                            <FieldLabel htmlFor={field.name}>Text Content *</FieldLabel>
                                            <div data-color-mode="light" className="rounded-md border border-input bg-background">
                                                <MDEditor id={field.name} value={field.state.value} onChange={(v) => field.handleChange(v || "")} commands={editorCommands} preview="edit" height={250} textareaProps={{ placeholder: "Write the chapter content..." }} />
                                            </div>
                                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )}
                                />
                                <form.Field
                                    name="estimatedReadTime"
                                    children={(field) => (
                                        <Field className="space-y-2">
                                            <FieldLabel htmlFor={field.name}>Estimated Read Time (minutes)</FieldLabel>
                                            <Input id={field.name} type="number" min="0" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)} placeholder="e.g., 5" />
                                            <p className="text-xs text-muted-foreground">Approximate time to read this lesson</p>
                                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )}
                                />
                            </>
                        )}
                    </>
                )}
            />

            {/* Sequence */}
            <form.Field
                name="sequence"
                children={(field) => (
                    <Field className="space-y-2">
                        <FieldLabel htmlFor={field.name}>Sequence *</FieldLabel>
                        <Input id={field.name} type="number" min="0" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)} />
                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                )}
            />

            {/* isFree + isMandatory */}
            <Field orientation="horizontal">
                <form.Field
                    name="isFree"
                    children={(field) => (
                        <Field className="space-y-2">
                            <div className="flex items-center justify-between">
                                <FieldLabel htmlFor={field.name}>Free Preview</FieldLabel>
                                <Switch id={field.name} checked={field.state.value} onCheckedChange={(c) => field.handleChange(c)} />
                            </div>
                            <p className="text-xs text-muted-foreground">Allow users to access this lesson without subscription</p>
                        </Field>
                    )}
                />
                <form.Field
                    name="isMandatory"
                    children={(field) => (
                        <Field className="space-y-2">
                            <div className="flex items-center justify-between">
                                <FieldLabel htmlFor={field.name}>Mandatory</FieldLabel>
                                <Switch id={field.name} checked={field.state.value} onCheckedChange={(c) => field.handleChange(c)} />
                            </div>
                            <p className="text-xs text-muted-foreground">Required for course completion</p>
                        </Field>
                    )}
                />
            </Field>

            {/* Footer */}
            <Field orientation="horizontal">
                <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                    {cancelLabel}
                </Button>
                <Button type="submit" disabled={isPending} variant="gradient" className="flex-1">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Lesson
                </Button>
            </Field>
        </form>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// CreateLessonDialog — standalone dialog wrapper (unchanged public API).
// ─────────────────────────────────────────────────────────────────────────────
export default function CreateLessonDialog({ courses, courseId, moduleId }: {
    courses?: any[]
    courseId?: string
    moduleId?: string
}) {
    const router = useRouter()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!open) {
            document.body.style.overflow = ""
            document.body.style.paddingRight = ""
        }
        return () => {
            document.body.style.overflow = ""
            document.body.style.paddingRight = ""
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="gradient">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Lesson
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-gradient-brand">Create New Lesson</DialogTitle>
                    <DialogDescription>Add a new lesson with video or text content</DialogDescription>
                </DialogHeader>
                <LessonFormContent
                    courses={courses}
                    lockedCourseId={courseId}
                    lockedModuleId={moduleId}
                    onSuccess={() => { setOpen(false); router.refresh() }}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}
