"use client"

import { useState } from "react"

export function useDataTable({ initialPage = 1, itemsPerPage = 10 }) {
    const [page, setPage] = useState(initialPage)
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])

    const handlePageChange = (newPage) => {
        setPage(newPage)
    }

    const handleSortingChange = (newSorting) => {
        setSorting(newSorting)
    }

    const handleFilterChange = (id, value) => {
        setColumnFilters((prev) => {
            const existing = prev.find((f) => f.id === id)
            if (existing) {
                return prev.map((f) => (f.id === id ? { ...f, value } : f))
            }
            return [...prev, { id, value }]
        })
    }

    return {
        page,
        sorting,
        columnFilters,
        itemsPerPage,
        handlePageChange,
        handleSortingChange,
        handleFilterChange,
    }
}
