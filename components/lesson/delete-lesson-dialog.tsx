"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { deleteLesson } from "@/lib/backend_actions/lesson"

export default function DeleteLessonDialog({ lesson, open, onOpenChange }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteLesson(lesson.id)

            if (result.success) {
                toast.success("Lesson deleted successfully!")
                onOpenChange(false)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to delete lesson")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete the lesson <strong>{lesson.title}</strong>.

                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                            <div className="flex">
                                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                                <div className="ml-2">
                                    <h3 className="text-sm font-medium text-red-800">Warning</h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        All associated content (videos, text, attachments) will also be deleted.
                                        <br />
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isDeleting}
                        variant="destructive"
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Lesson
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
