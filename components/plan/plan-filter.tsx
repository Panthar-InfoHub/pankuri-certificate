"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useDebounce from "@/lib/hooks/use-debounce"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
]

export function PlanFilter({ initialSearchTerm, initialStatusFilter }: { initialSearchTerm?: string, initialStatusFilter?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "")
    const [statusFilter, setStatusFilter] = useState(initialStatusFilter || "all")

    const debouncedSearchTerm = useDebounce(searchTerm)

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        if (debouncedSearchTerm) {
            params.set("search", debouncedSearchTerm)
        } else {
            params.delete("search")
        }

        if (statusFilter && statusFilter !== "all") {
            params.set("status", statusFilter)
        } else {
            params.delete("status")
        }

        // Reset page when filters change
        params.set("page", "1")

        const query = params.toString()
        router.push(`?${query}`)
    }, [debouncedSearchTerm, statusFilter, router, searchParams])


    return (
        <div className="flex flex-col sm:flex-row gap-4 rounded-lg my-8">
            <div className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search plans..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10" />
                </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                            {status.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
