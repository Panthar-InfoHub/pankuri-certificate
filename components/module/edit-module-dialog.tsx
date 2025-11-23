"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateModule } from "@/lib/backend_actions/module"

const moduleSchema = z.object({
    courseId: z.string().min(1, "Course is required"),
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
    description: z.string().optional(),
    sequence: z.number().int().min(1, "Sequence must be at least 1"),
    duration: z.number().int().min(0).optional(),
    status: z.enum(["draft", "published", "archived"]),
})

export default function EditModuleDialog({ module, courses, children }) {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        defaultValues: {
            courseId: module.courseId || "",
            title: module.title || "",
            slug: module.slug || "",
            description: module.description || "",
            sequence: module.sequence || 1,
            duration: module.duration || 0,
            status: module.status || "draft",
        },
        onSubmit: async ({ value }) => {
            setIsSubmitting(true)
            try {
                const payload = {
                    ...value,
                    duration: value.duration || undefined,
                    description: value.description || undefined,
                }

                const result = await updateModule(module.id, payload)

                if (result.success) {
                    toast.success("Module updated successfully!")
                    setOpen(false)
                    router.refresh()
                } else {
                    toast.error(result.error || "Failed to update module")
                }
            } catch (error) {
                toast.error("An unexpected error occurred")
            } finally {
                setIsSubmitting(false)
            }
        },
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Module</DialogTitle>
                    <DialogDescription>
                        Update module information and settings
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
                        validators={{
                            onChange: moduleSchema.shape.courseId,
                        }}
                    >
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Course *</Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value)}
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
                                {field.state.meta.errors && (
                                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    {/* Title */}
                    <form.Field
                        name="title"
                        validators={{
                            onChange: moduleSchema.shape.title,
                        }}
                    >
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Module Title *</Label>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="e.g., Introduction to React"
                                />
                                {field.state.meta.errors && (
                                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    {/* Slug */}
                    <form.Field
                        name="slug"
                        validators={{
                            onChange: moduleSchema.shape.slug,
                        }}
                    >
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Slug *</Label>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="introduction-to-react"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use lowercase letters, numbers, and hyphens only.
                                </p>
                                {field.state.meta.errors && (
                                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    {/* Description */}
                    <form.Field name="description">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Description</Label>
                                <Textarea
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Brief description of what this module covers"
                                    rows={3}
                                />
                            </div>
                        )}
                    </form.Field>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Sequence */}
                        <form.Field
                            name="sequence"
                            validators={{
                                onChange: moduleSchema.shape.sequence,
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Sequence *</Label>
                                    <Input
                                        id={field.name}
                                        type="number"
                                        min="1"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)}
                                    />
                                    {field.state.meta.errors && (
                                        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        {/* Duration */}
                        <form.Field
                            name="duration"
                            validators={{
                                onChange: moduleSchema.shape.duration,
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Duration (min)</Label>
                                    <Input
                                        id={field.name}
                                        type="number"
                                        min="0"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                                        placeholder="Optional"
                                    />
                                </div>
                            )}
                        </form.Field>

                        {/* Status */}
                        <form.Field
                            name="status"
                            validators={{
                                onChange: moduleSchema.shape.status,
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Status *</Label>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(value) => field.handleChange(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Module
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
