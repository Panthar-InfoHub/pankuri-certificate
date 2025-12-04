"use client"

import { useState, useTransition } from "react"
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
import { Loader2, AlertTriangle, UserMinus } from "lucide-react"
import { toast } from "sonner"
import { Field } from "@/components/ui/field"
import { getCourseById, updateCourse } from "@/lib/backend_actions/course"

export default function RemoveTrainerDialog({ courseId, trainer, children }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleRemove = () => {
        startTransition(async () => {
            try {
                // Fetch current course data
                const courseResult = await getCourseById(courseId)
                if (!courseResult.success) {
                    toast.error("Failed to fetch course data")
                    return
                }

                const course = courseResult.data

                // Update course WITHOUT trainerId (empty/undefined to remove)
                const payload = {
                    title: course.title,
                    slug: course.slug,
                    description: course.description,
                    categoryId: course.categoryId,
                    // trainerId: undefined, // Remove trainer by not including it
                    thumbnailImage: course.thumbnailImage,
                    coverImage: course.coverImage,
                    level: course.level,
                    duration: course.duration,
                    language: course.language,
                    status: course.status,
                    hasCertificate: course.hasCertificate,
                    tags: course.tags || [],
                    metadata: course.metadata || {},
                    demoVideoId: course.demoVideoId,
                }

                const result = await updateCourse(courseId, payload)

                if (result.success) {
                    toast.success("Trainer removed successfully!")
                    setOpen(false)
                    router.refresh()
                } else {
                    toast.error(result.error || "Failed to remove trainer")
                }
            } catch (error) {
                console.error("Remove trainer error:", error)
                toast.error("An unexpected error occurred")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Remove Trainer from Course</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove this trainer?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="font-medium text-sm">Warning</p>
                            <p className="text-sm text-muted-foreground">
                                This trainer will no longer be associated with this course. This action can be undone by adding the trainer again.
                            </p>
                        </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">{trainer.name}</p>
                        {trainer.email && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {trainer.email}
                            </p>
                        )}
                    </div>

                    <Field orientation="horizontal">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="flex-1" disabled={isPending}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button 
                            onClick={handleRemove} 
                            disabled={isPending} 
                            variant="destructive" 
                            className="flex-1"
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!isPending && <UserMinus className="mr-2 h-4 w-4" />}
                            Remove Trainer
                        </Button>
                    </Field>
                </div>
            </DialogContent>
        </Dialog>
    )
}
