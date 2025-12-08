import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { UsersTable } from "@/components/user/users-table"
import { getAllUsers } from "@/lib/backend_actions/users"
import { PaginationInfo } from "@/lib/types"
import { Search } from "lucide-react"
import { Suspense } from "react"

interface SearchParamsProps {
    searchParams: Promise<{
        status?: string,
        page?: string,
    }>
}

async function UsersContent({ searchParams }: SearchParamsProps) {

    const page = (await searchParams).page ? parseInt((await searchParams).page as string, 10) : 1

    const result = await getAllUsers({ limit: 50, status: "active", page })
    const users = result.success ? result.data.data : []
    const pagination: PaginationInfo = result.success ? result.data.pagination : null

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gradient-brand">Users</h1>
                    <p className="text-muted-foreground mt-2">Manage user accounts and roles</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users by name or email..."
                        className="pl-10"
                    />
                </div>
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <UsersTable users={users} pagination={pagination} />
        </>
    )
}

export default async function UsersPage({ searchParams }: SearchParamsProps) {
    return (
        <div className="container mx-auto px-6 py-24">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <UsersContent searchParams={searchParams} />
            </Suspense>
        </div>
    )
}
