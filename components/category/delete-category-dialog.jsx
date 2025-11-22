"use client"

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
import { deleteCategory } from "@/lib/backend_actions/category"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function DeleteCategoryDialog({ children, category }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setLoading(true)

        const result = await deleteCategory(category.id)

        if (result.success) {
            toast.success("Category deleted successfully")
            setOpen(false)
            router.refresh()
        } else {
            toast.error(result.error || "Failed to delete category")
        }

        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span>Delete Category</span>
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{category.name}</strong>? This action will deactivate the category and
                        remove it from available offerings.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex">
                        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                        <div className="ml-2">
                            <h3 className="text-sm font-medium text-red-800">Warning</h3>
                            <p className="text-sm text-red-700 mt-1">
                                This will deactivate the category and remove it from available offerings.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? <> <Loader2 className="animate-spin" />  Deleting...</> : "Delete Category"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}