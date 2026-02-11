"use client"

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
import { Field, FieldLabel } from "@/components/ui/field"
import { upsertLessonDescription } from "@/lib/backend_actions/lesson"
import MDEditor, { commands } from "@uiw/react-md-editor"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function LessonDescriptionDialog({ lesson, children }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [textContent, setTextContent] = useState(lesson.lessonDescription?.textContent || "")

    useEffect(() => {
        if (!open) {
            // Reset body styles that Radix might have left behind
            document.body.style.overflow = ''
            document.body.style.paddingRight = ''
            document.body.removeAttribute('data-scroll-locked')
        }
    }, [open])

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

    const editorCommands = [
        commands.bold,
        commands.italic,
        commands.strikethrough,
        commands.divider,
        commands.link,
        commands.quote,
        commands.code,
        commands.codeBlock,
        commands.unorderedListCommand,
        commands.orderedListCommand,
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-3xl " onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>
                        {lesson.lessonDescription ? "Edit" : "Add"} Lesson Description
                    </DialogTitle>
                    <DialogDescription>
                        Add detailed description, overview, or learning objectives for this lesson. Supports Markdown formatting.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Field className="space-y-2" data-color-mode="light">
                        <FieldLabel htmlFor="textContent">Description Content *</FieldLabel>

                        <MDEditor
                            value={textContent}
                            onChange={setTextContent}
                            commands={editorCommands}
                            textareaProps={{
                                placeholder: `# Lesson Overview ${"\n"}This lesson covers...${"\n"}
## What You'll Learn
- Key concept 1
- Key concept 2

## Prerequisites
- Basic knowledge of...

**Useful Resources:**
- [Documentation](https://example.com)`,
                            }}
                            previewOptions={{
                                disallowedElements: ["style"]
                            }}
                            preview='edit'
                            height={300}
                            minHeight={200}
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
