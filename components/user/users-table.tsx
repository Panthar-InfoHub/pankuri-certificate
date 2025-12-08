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
import { MoreHorizontal, Shield, Mail, Calendar } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import PaginationNumberless from "../customized/pagination/pagination-12"
import { PaginationInfo } from "@/lib/types"

interface UserTableProps {
    users: any,
    pagination?: PaginationInfo,
}

export function UsersTable({ users, pagination }: UserTableProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

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
                                        {user.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
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
                                            // disabled={user.role === "admin"}
                                            >
                                                <Shield className="mr-2 h-4 w-4" />
                                                {user.role === "admin" ? "Remove Admin" : "Make Admin"}
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
        </div>
    )
}
