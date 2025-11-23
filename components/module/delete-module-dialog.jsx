"use client"

import { deleteModule } from "@/lib/backend_actions/module"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "../ui/dialog"

export default function DeleteModuleDialog({ module, open, onOpenChange }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteModule(module.id)

            if (result.success) {
                toast.success("Module deleted successfully!")
                onOpenChange(false)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to delete module")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete the module <strong>{module.title}</strong>.
                        <span className="text-destructive font-semibold"> Warning: All lessons within this module will also be deleted.</span>
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose disabled={isDeleting}>Cancel</DialogClose>
                    <Button onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {isDeleting && <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting... </>}
                        Delete Module
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
