"use client"

import { deleteTrainer } from "@/lib/backend_actions/trainer"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { Dialog, DialogTrigger, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Field } from "../ui/field"
import { Loader2 } from "lucide-react"

export function DeleteTrainerDialog({ trainer, children }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteTrainer(trainer.id)
            if (result.success) {
                toast.success("Trainer deleted successfully")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to delete trainer")
            }
        })
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader className="bg-red-50 border border-red-200 rounded-md p-3"  >
                    <DialogTitle className="font-medium text-red-800" >Are you absolutely sure?</DialogTitle>
                    <DialogDescription className="text-sm text-red-700" >
                        This will permanently delete the trainer profile for <span className="font-semibold">"{trainer.user?.displayName}"</span>.
                        This action cannot be undone and will remove all trainer-specific data. The user account will remain intact.
                    </DialogDescription>
                </DialogHeader>
                <Field orientation="horizontal">
                    <DialogClose disabled={isPending}  >
                        <Button variant="outline" asChild disabled={isPending}>
                            <div>
                                Cancel
                            </div>
                        </Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="flex-1">
                        {isPending ? <> <Loader2 className="animate-spin" /> Deleting...</> : "Delete Trainer"}
                    </Button>
                </Field>
            </DialogContent>
        </Dialog>
    )
}
