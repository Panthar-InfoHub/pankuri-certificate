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

const LEVEL_OPTIONS = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "expert", label: "Expert" },
]

export function CourseFilter({ initialSearchTerm, initialStatusFilter, categories }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
    const [statusFilter, setStatusFilter] = useState(initialStatusFilter)
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [levelFilter, setLevelFilter] = useState("all")
    const [paidFilter, setPaidFilter] = useState("all")

    const debouncedSearchTerm = useDebounce(searchTerm)

    // Combine all filters into a single useEffect to prevent multiple API calls
    useEffect(() => {
        const params = new URLSearchParams()

        // Add search param
        if (debouncedSearchTerm) {
            params.set("search", debouncedSearchTerm)
        }

        // Add category param
        if (categoryFilter && categoryFilter !== "all") {
            params.set("category", categoryFilter)
        }
        // Add level param
        if (levelFilter && levelFilter !== "all") {
            params.set("level", levelFilter)
        }
        // Add status param
        if (statusFilter && statusFilter !== "all") {
            params.set("status", statusFilter)
        }

        // Preserve other existing params (like page, limit)
        const currentPage = searchParams.get("page")
        const currentLimit = searchParams.get("limit")
        currentPage ? params.set("page", currentPage) : params.set("page", "1")
        if (currentLimit) params.set("limit", currentLimit)


        const query = params.toString()
        router.push(`/course${query ? `?${query}` : ""}`)
    }, [debouncedSearchTerm, categoryFilter, levelFilter, paidFilter, statusFilter, router])


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

            {/* Category Filter */}
            <Select value={categoryFilter || "all"} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All category</SelectItem>
                    {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Level Filter */}
            <Select value={levelFilter || "all"} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Level</SelectItem>
                    {LEVEL_OPTIONS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                            {level.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Status Filter */}
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