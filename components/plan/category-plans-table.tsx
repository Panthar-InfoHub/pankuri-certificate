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
import { MoreHorizontal, Pencil, Trash2, IndianRupee, Check, Copy, CopyCheck } from "lucide-react" // Importing IndianRupee for price if needed
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
// import { toast } from "sonner" 
// Uncomment and use toast and backend actions when available
// import { deletePlan } from "@/lib/backend_actions/plans"
import PaginationNumberless from "../customized/pagination/pagination-12"
import { toast } from "sonner"

interface PlanProps {
    plans: any[]
    pagination?: any
}

export function CategoryPlansTable({ plans, pagination }: PlanProps) {
    const router = useRouter()
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    if (!plans || plans.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No plans found. Create your first plan to get started.</p>
            </div>
        )
    }

    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            toast.success("Plan ID copied to clipboard");
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    return (
        <>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Plan Id</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow key={plan.id}>
                                <TableCell>
                                    <div className="font-medium">{plan.name}</div>
                                    <div className="text-xs text-muted-foreground">{plan.slug}</div>
                                </TableCell>

                                <TableCell className="cursor-pointer" onClick={() => handleCopy(plan.planId, plan.id)}>
                                    <Badge variant="secondary" className="flex items-center gap-2 w-fit">
                                        {plan.planId || "N/A"}
                                        {copiedId === plan.id ? (
                                            <Check className="h-3 w-3" />
                                        ) : (
                                            <CopyCheck className="h-3 w-3" />
                                        )}
                                    </Badge>
                                </TableCell>
                                <TableCell className="capitalize">
                                    <Badge variant="default">
                                        {plan.subscriptionType}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold">₹{plan.discountedPrice}</span>
                                        {plan.price > plan.discountedPrice && (
                                            <span className="text-xs text-muted-foreground line-through">₹{plan.price}</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize">{plan.provider}</TableCell>
                                <TableCell>
                                    <Badge variant={plan.isActive ? "outline" : "secondary"}>
                                        {plan.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
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
                                            {/* 
                                            <DropdownMenuItem onClick={() => {}}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                             */}
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* <PaginationNumberless pagination={pagination} redirectTo="plan/category" /> */}
        </>
    )
}
