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
import { updateUserRole } from "@/lib/backend_actions/users"
import { grantManualSubscription } from "@/lib/backend_actions/subscription"
import { getAllActivePlans } from "@/lib/backend_actions/plans"
import { MoreHorizontal, Shield, Mail, Calendar, Crown, CreditCard, RefreshCw, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
import { toast } from "sonner"
import PaginationNumberless from "../customized/pagination/pagination-12"
import { PaginationInfo } from "@/lib/types"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface UserTableProps {
    users: any,
    pagination?: PaginationInfo,
}

export function UsersTable({ users, pagination }: UserTableProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Manual Subscription State
    const [selectedUserForSub, setSelectedUserForSub] = useState<any>(null)
    const [plans, setPlans] = useState<any[]>([])
    const [granting, setGranting] = useState(false)
    const [loadingPlans, setLoadingPlans] = useState(false)
    const [selectedPlanType, setSelectedPlanType] = useState<string>("")
    const [overrideAccess, setOverrideAccess] = useState<boolean>(false)
    const [grantForm, setGrantForm] = useState({
        planId: "",
        amount: "",
        expiryDate: "",
        notes: ""
    })

    const calculateExpiry = (plan: any) => {
        if (!plan) return "";
        const date = new Date();
        if (plan.subscriptionType === "monthly") {
            date.setDate(date.getDate() + 30);
            return date.toISOString().split("T")[0];
        } else if (plan.subscriptionType === "yearly") {
            date.setDate(date.getDate() + 365);
            return date.toISOString().split("T")[0];
        } else if (plan.subscriptionType === "lifetime") {
            return ""; // No Expiry
        }
        if (plan.duration) {
            date.setDate(date.getDate() + plan.duration);
            return date.toISOString().split("T")[0];
        }
        return "";
    }

    useEffect(() => {
        if (selectedUserForSub) {
            if (!selectedPlanType) {
                setPlans([])
                return
            }
            const fetchPlans = async () => {
                setLoadingPlans(true)
                try {
                    const res = await getAllActivePlans({ plan_type: selectedPlanType === "all" ? "" : selectedPlanType })
                    if (res.success) {
                        setPlans(res.data)
                    }
                } finally {
                    setLoadingPlans(false)
                }
            }
            fetchPlans()
        } else {
            setGrantForm({ planId: "", amount: "", expiryDate: "", notes: "" })
            setSelectedPlanType("")
            setOverrideAccess(false)
        }
    }, [selectedUserForSub, selectedPlanType])

    const handleGrantSubscription = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUserForSub || !grantForm.planId) {
            toast.error("Please select a plan")
            return
        }

        if (overrideAccess && !grantForm.notes.trim()) {
            toast.error("Notes are mandatory when Override Access is enabled")
            return
        }

        setGranting(true)
        try {
            const payload = {
                userId: selectedUserForSub.id,
                planId: grantForm.planId,
                amount: grantForm.amount ? Math.round(parseFloat(grantForm.amount) * 100) : undefined,
                expiryDate: grantForm.expiryDate || undefined,
                notes: grantForm.notes || undefined
            }

            const res = await grantManualSubscription(payload)
            if (res.success) {
                toast.success("Subscription granted successfully")
                setSelectedUserForSub(null)
                router.refresh()
            } else {
                toast.error(res.error || "Failed to grant subscription")
            }
        } catch (error) {
            toast.error("An error occurred while granting subscription")
        } finally {
            setGranting(false)
        }
    }

    const handleMakeAdmin = async (userId, currentRole) => {
        startTransition(async () => {
            const role = currentRole === "admin" ? "user" : "admin"
            const result = await updateUserRole(userId, role)
            if (result.success) {
                toast.success("Role updated successfully")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update user role")
            }
        })
    }

    if (!users || users.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No users found.</p>
            </div>
        )
    }

    return (
        <div className="w-full" >
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Avatar</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-accent/50">
                                <TableCell>
                                    {user.profileImage ? (
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                                            <Image
                                                src={user.profileImage}
                                                alt={user.displayName || user.email}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                            {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="max-w-[200px]">
                                        <p className="font-medium truncate">{user.displayName || "—"}</p>
                                        {user.phoneNumber && (
                                            <p className="text-xs text-muted-foreground">{user.phoneNumber}</p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === "admin" ? "default" : user.trainerProfile ? "secondary" : "outline"} className="capitalize">
                                        {user.role === "admin" && <Crown className="h-3 w-3 mr-1" />}
                                        {user.role === "admin" ? "Admin" : user.trainerProfile ? "Trainer" : "User"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
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
                                            <DropdownMenuItem
                                                onClick={() => handleMakeAdmin(user.id, user.role)}
                                            >
                                                <Crown className="mr-2 h-4 w-4" />
                                                {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSelectedUserForSub(user)}>
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                Add Payment
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <PaginationNumberless pagination={pagination} />

            {/* Grant Manual Subscription Dialog */}
            <Dialog open={!!selectedUserForSub} onOpenChange={(open) => !open && setSelectedUserForSub(null)}>
                <DialogContent className="sm:max-w-xl overflow-x-hidden">
                    <DialogHeader>
                        <DialogTitle>Grant Manual Subscription</DialogTitle>
                        <DialogDescription>
                            Grant offline/manual subscription to {selectedUserForSub?.displayName || selectedUserForSub?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleGrantSubscription} className="w-full max-w-full space-y-4 pt-2">
                        <div className="max-h-[380px] overflow-y-auto overflow-x-hidden w-full max-w-full px-1 space-y-4">
                            <div className="space-y-2">
                                <Label>Filter Plan Type</Label>
                                <Select 
                                    value={selectedPlanType} 
                                    onValueChange={(value) => {
                                        setSelectedPlanType(value);
                                        setGrantForm({ ...grantForm, planId: "" }); // Reset plan selection
                                    }}
                                >
                                    <SelectTrigger className="w-full max-w-full overflow-hidden min-w-0">
                                        <div className="truncate w-full text-left">
                                            <SelectValue placeholder="Choose a type first" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="WHOLE_APP">Whole App</SelectItem>
                                        <SelectItem value="CATEGORY">Category</SelectItem>
                                        <SelectItem value="COURSE">Course</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Plan</Label>
                                <Select 
                                    value={grantForm.planId} 
                                    onValueChange={(value) => {
                                        const selectedPlan = plans.find(p => p.id === value);
                                        setGrantForm({
                                            ...grantForm,
                                            planId: value,
                                            amount: selectedPlan ? (selectedPlan.price / 100).toString() : "",
                                            expiryDate: selectedPlan ? calculateExpiry(selectedPlan) : ""
                                        });
                                    }}
                                    disabled={!selectedPlanType || loadingPlans}
                                >
                                    <SelectTrigger className="w-full max-w-sm overflow-hidden min-w-0">
                                        <div className="truncate w-full text-left">
                                            <SelectValue placeholder={
                                                loadingPlans ? "Loading plans..." 
                                                : !selectedPlanType ? "Choose type first..." 
                                                : plans.length === 0 ? "No plans found" 
                                                : "Choose a plan"
                                            } />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {plans.map((plan) => (
                                            <SelectItem key={plan.id} value={plan.id}>
                                                {plan.name} ({plan.planType}) - ₹{plan.price / 100}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2 border-t pt-2">
                                <Switch
                                    id="override-access"
                                    checked={overrideAccess}
                                    onCheckedChange={setOverrideAccess}
                                />
                                <Label htmlFor="override-access" className="flex items-center gap-1 cursor-pointer">
                                    Override Amount / Expiry 
                                    <span className="text-xs text-muted-foreground">(Requires admin check)</span>
                                </Label>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Override Amount (Optional)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Leaves blank for plan default"
                                    value={grantForm.amount}
                                    onChange={(e) => setGrantForm({ ...grantForm, amount: e.target.value })}
                                    disabled={!overrideAccess}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                                <Input
                                    id="expiryDate"
                                    type="date"
                                    value={grantForm.expiryDate}
                                    onChange={(e) => setGrantForm({ ...grantForm, expiryDate: e.target.value })}
                                    disabled={!overrideAccess || (plans.find(p => p.id === grantForm.planId)?.subscriptionType === "lifetime")}
                                />
                                {plans.find(p => p.id === grantForm.planId)?.subscriptionType === "lifetime" && (
                                    <p className="text-xs text-green-600 font-semibold mt-1">✓ Lifetime Plan (No expiry needed)</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes/Remarks</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="E.g. Received cash payment"
                                    value={grantForm.notes}
                                    onChange={(e) => setGrantForm({ ...grantForm, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="submit" disabled={granting} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                                {granting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />} Grant Subscription
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
