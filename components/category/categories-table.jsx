"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
// import { deleteCategory, updateCategoryStatus } from "@/lib/category-actions"
import { deleteCategory, updateCategoryStatus } from "@/lib/backend_actions/category"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { DeleteCategoryDialog } from "./delete-category-dialog"
import { EditCategoryDialog } from "./edit-category-dialog"


export function CategoriesTable({ categories, parentCategories }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [editingCategory, setEditingCategory] = useState(null)

    const handleToggleStatus = async (categoryId, currentStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active"
        startTransition(async () => {
            const result = await updateCategoryStatus(categoryId, newStatus)
            if (result.success) {
                toast.success(`Category ${newStatus === "active" ? "activated" : "deactivated"}`)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update status")
            }
        })
    }

    if (!categories || categories.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No categories found. Create your first category to get started.</p>
            </div>
        )
    }

    return (
        <>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Icon</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sequence</TableHead>
                            <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>
                                    {category.icon ? (
                                        <div className="relative w-8 h-8 rounded overflow-hidden bg-muted">
                                            <Image
                                                src={category?.icon || ""}
                                                alt={category.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs">
                                            {category.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                                <TableCell className="max-w-[300px] truncate">{category.description || "—"}</TableCell>
                                <TableCell>
                                    <Badge variant={category.status === "active" ? "default" : "secondary"}>{category.status}</Badge>
                                </TableCell>
                                <TableCell>{category.sequence}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={isPending}>
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <EditCategoryDialog category={category} parentCategories={parentCategories} asChild>
                                                    <Button variant="ghost" className="w-full justify-start p-0">
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                </EditCategoryDialog>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleStatus(category.id, category.status)}>
                                                {category.status === "active" ? (
                                                    <>
                                                        <EyeOff className="mr-2 h-4 w-4" />
                                                        Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Activate
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <DeleteCategoryDialog category={category} asChild>
                                                    <Button variant="ghost" className="w-full justify-start p-0 text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </DeleteCategoryDialog>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

        </>
    )
}
