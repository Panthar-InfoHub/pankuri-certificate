"use client"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export function DataTable({ columns, data, pagination, onPageChange }) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const { currentPage, totalPages } = pagination

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    No results found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        // onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        title="First page"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        // onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        title="Previous page"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        // onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        title="Next page"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        // onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        title="Last page"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
