"use client"

import { deleteCourse } from "@/lib/backend_actions/course"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { Dialog, DialogTrigger, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"

export function DeleteCourseDialog({ course, children }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteCourse(course.id)
            if (result.success) {
                toast.success("Course deleted successfully")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to delete course")
            }
        })
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete the course <span className="font-semibold">"{course.title}"</span>.
                        This action cannot be undone and will also delete all associated modules, lessons, and enrollments.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose disabled={isPending}>Cancel</DialogClose>
                    <DialogClose onClick={handleDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {isPending ? "Deleting..." : "Delete Course"}
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
