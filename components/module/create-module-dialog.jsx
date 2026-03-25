"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { createModule } from "@/lib/backend_actions/module"
import { useForm } from "@tanstack/react-form"
import { Loader2, Plus, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { Field, FieldError, FieldLabel } from "../ui/field"
import MDEditor, { commands } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";

const moduleSchema = z.object({
    courseId: z.string().min(1, "Course is required"),
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
    description: z.string().optional(),
    sequence: z.number().int().min(1, "Sequence must be at least 1"),
    duration: z.number().int().min(0).optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// ModuleFormContent — reusable form body.
// Used by CreateModuleDialog (standalone) AND by the Create Content Wizard.
// Props:
//   courseId    — pre-locks the course field (wizard always provides this)
//   courses     — array for the course Select used in standalone when no courseId
//   onSuccess   — called with { id, title } after module is created
//   onCancel    — called when user dismisses
//   cancelLabel — label for the dismiss button (default "Cancel")
// ─────────────────────────────────────────────────────────────────────────────
export function ModuleFormContent({ courseId, courses = [], onSuccess, onCancel, cancelLabel = "Cancel" }) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        defaultValues: {
            courseId: courseId || "",
            title: "",
            slug: "",
            description: "",
            sequence: 1,
            duration: 0,
        },
        validators: {
            onSubmit: moduleSchema,
        },
        onSubmit: async ({ value }) => {
            setIsSubmitting(true)
            try {
                const payload = {
                    ...value,
                    duration: value.duration || undefined,
                    description: value.description || undefined,
                }

                const result = await createModule(payload)

                if (result.success) {
                    toast.success("Module created successfully!")
                    form.reset()
                    // Pass id + title back to caller (wizard uses this to advance steps)
                    const moduleId = result.data?.id ?? result.data?.data?.id ?? ""
                    onSuccess({ id: moduleId, title: value.title })
                } else {
                    toast.error(result.error || "Failed to create module")
                }
            } catch (error) {
                toast.error("An unexpected error occurred")
            } finally {
                setIsSubmitting(false)
            }
        },
    })

    // Sync courseId prop into form when it changes (e.g. wizard passes it in)
    useEffect(() => {
        if (courseId) form.setFieldValue("courseId", courseId)
    }, [courseId])

    const handleTitleChange = (value) => {
        const slug = value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim()
        form.setFieldValue("slug", slug)
    }

    const editorCommands = [
        commands.bold, commands.italic, commands.strikethrough, commands.divider,
        commands.link, commands.quote, commands.code, commands.codeBlock,
        commands.unorderedListCommand, commands.orderedListCommand,
    ]

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="space-y-6"
        >
            {/* Course field — hidden when courseId is locked (pre-set from wizard) */}
            {!courseId && (
                <form.Field
                    name="courseId"
                    children={(field) => (
                        <Field className="space-y-2">
                            <FieldLabel htmlFor={field.name}>Course *</FieldLabel>
                            <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
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

            {/* Title */}
            <form.Field
                name="title"
                children={(field) => (
                    <Field className="space-y-2">
                        <FieldLabel htmlFor={field.name}>Module Title *</FieldLabel>
                        <Input
                            id={field.name}
                            placeholder="e.g., Introduction to React"
                            value={field.state.value}
                            onChange={(e) => {
                                field.handleChange(e.target.value)
                                handleTitleChange(e.target.value)
                            }}
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
                            placeholder="introduction-to-react"
                        />
                        <p className="text-xs text-muted-foreground">
                            Auto-generated from title. Lowercase letters, numbers, and hyphens only.
                        </p>
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
                                onChange={(nextValue) => field.handleChange(nextValue || "")}
                                commands={editorCommands}
                                preview="edit"
                                height={250}
                                textareaProps={{ placeholder: "Brief description of what this module covers..." }}
                            />
                        </div>
                    </Field>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                {/* Sequence */}
                <form.Field
                    name="sequence"
                    children={(field) => (
                        <Field className="space-y-2">
                            <FieldLabel htmlFor={field.name}>Sequence *</FieldLabel>
                            <Input
                                id={field.name}
                                type="number"
                                min="1"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)}
                            />
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )}
                />

                {/* Duration */}
                <form.Field
                    name="duration"
                    children={(field) => (
                        <Field className="space-y-2">
                            <FieldLabel htmlFor={field.name}>Duration (min)</FieldLabel>
                            <Input
                                id={field.name}
                                type="number"
                                min="0"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                                placeholder="Optional"
                            />
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )}
                />
            </div>

            <Field orientation="horizontal">
                <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                    {cancelLabel}
                </Button>
                <Button type="submit" disabled={isSubmitting} variant="gradient" className="flex-1">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Module
                </Button>
            </Field>
        </form>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// CreateModuleDialog — standalone dialog wrapper (unchanged public API).
// ─────────────────────────────────────────────────────────────────────────────
export default function CreateModuleDialog({ courses, courseId }) {
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
                    Create Module
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Module</DialogTitle>
                    <DialogDescription>
                        Add a new module to organize course content into sections
                    </DialogDescription>
                </DialogHeader>
                <ModuleFormContent
                    courseId={courseId}
                    courses={courses}
                    onSuccess={() => { setOpen(false); router.refresh() }}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}
