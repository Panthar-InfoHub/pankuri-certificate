"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { upsertLessonDescription } from "@/lib/backend_actions/lesson"
import { Field, FieldLabel } from "@/components/ui/field"

export default function LessonDescriptionDialog({ lesson, children }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [textContent, setTextContent] = useState(lesson.lessonDescription?.textContent || "")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const result = await upsertLessonDescription(lesson.id, { textContent })

            if (result.success) {
                toast.success("Lesson description updated successfully!")
                setOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update lesson description")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {lesson.lessonDescription ? "Edit" : "Add"} Lesson Description
                    </DialogTitle>
                    <DialogDescription>
                        Add detailed description, overview, or learning objectives for this lesson. Supports Markdown formatting.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Field className="space-y-2">
                        <FieldLabel htmlFor="textContent">Description Content *</FieldLabel>
                        <Textarea
                            id="textContent"
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            placeholder={`# Lesson Overview ${"\n"}This lesson covers...${"\n"}
## What You'll Learn
- Key concept 1
- Key concept 2

## Prerequisites
- Basic knowledge of...

**Useful Resources:**
- [Documentation](https://example.com)`}
                            rows={20}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Markdown supported. Use # for headings, ** for bold, * for lists, etc.
                        </p>
                    </Field>

                    <Field orientation="horizontal">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="flex-1">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting} variant="gradient" className="flex-1">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {lesson.lessonDescription ? "Update" : "Add"} Description
                        </Button>
                    </Field>
                </form>
            </DialogContent>
        </Dialog>
    )
}
