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

export function CategoryFilter({ initialSearchTerm, initialStatusFilter }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
    const [statusFilter, setStatusFilter] = useState(initialStatusFilter)

    const debouncedSearchTerm = useDebounce(searchTerm)

    // Combine all filters into a single useEffect to prevent multiple API calls
    useEffect(() => {
        const params = new URLSearchParams()

        // Add search param
        if (debouncedSearchTerm) {
            params.set("search", debouncedSearchTerm)
        }

        // Add category param
        if (statusFilter && statusFilter !== "all") {
            params.set("status", statusFilter)
        }

        // Preserve other existing params (like page, limit)
        const currentPage = searchParams.get("page")
        const currentLimit = searchParams.get("limit")
        // if (currentPage) params.set("page", currentPage)
        currentPage ? params.set("page", currentPage) : params.set("page", "1")
        if (currentLimit) params.set("limit", currentLimit)

        // params.set("page", "1")

        const query = params.toString()
        router.push(`/category${query ? `?${query}` : ""}`)
    }, [debouncedSearchTerm, statusFilter, router])


    return (
        <div
            className="flex flex-col sm:flex-row gap-4 rounded-lg my-8">
            <div className="flex-1">
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10" />
                </div>
            </div>

            <Select value={statusFilter || "all"} onValueChange={setStatusFilter}>
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