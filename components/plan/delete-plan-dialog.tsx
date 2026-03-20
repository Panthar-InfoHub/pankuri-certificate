"use client"

import { useTransition, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2, AlertCircle } from "lucide-react"
import { deletePlan } from "@/lib/backend_actions/plans"

export function DeletePlanDialog({ plan, children }: { plan: any, children: React.ReactNode }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deletePlan(plan.id)
            if (result.success) {
                toast.success("Plan deactivated successfully")
                setOpen(false)
                router.refresh()
            } else {
                toast.warning(result.error || "Failed to deactivate plan")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-destructive flex items-center gap-2">
                        <Trash2 className="h-5 w-5" />
                        Deactivate Plan
                    </DialogTitle>
                    <DialogDescription className="space-y-4 pt-2">
                        <div>
                            Are you sure you want to deactivate <strong>{plan.name}</strong>?
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-lg border bg-amber-50/50 border-amber-200 text-amber-800 text-[12px] font-medium dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>
                                Existing subscribers will continuous billing operations untouched. 
                                No new users can purchase subscription for this plan layout going forwards.
                            </p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                        <Button variant="outline" type="button" disabled={isPending} className="flex-1">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" disabled={isPending} onClick={handleDelete} className="flex-1">
                        {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Deactivate Plan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
