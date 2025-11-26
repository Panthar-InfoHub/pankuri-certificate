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
import { Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { deleteLessonAttachment } from "@/lib/backend_actions/lesson"
import { Field } from "@/components/ui/field"

export default function DeleteAttachmentDialog({ attachment, children }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        
        try {
            const result = await deleteLessonAttachment(attachment.id)

            if (result.success) {
                toast.success("Attachment deleted successfully!")
                setOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to delete attachment")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Attachment</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this attachment?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="font-medium text-sm">Warning</p>
                            <p className="text-sm text-muted-foreground">
                                This will permanently delete the attachment file and remove it from the lesson. This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">{attachment.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {attachment.fileUrl.split('/').pop()}
                        </p>
                    </div>

                    <Field orientation="horizontal">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="flex-1" disabled={isDeleting}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button 
                            onClick={handleDelete} 
                            disabled={isDeleting} 
                            variant="destructive" 
                            className="flex-1"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Attachment
                        </Button>
                    </Field>
                </div>
            </DialogContent>
        </Dialog>
    )
}
