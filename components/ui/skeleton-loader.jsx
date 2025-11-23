import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton({ rows = 5, columns = 1 }) {
    return (
        <div className="border rounded-lg">
            <div className="p-4">
                <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex gap-4">
                        {Array.from({ length: columns }).map((_, i) => (
                            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
                        ))}
                    </div>

                    {/* Data Rows */}
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <div key={`row-${rowIndex}`} className="flex gap-4 items-center">
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-8 flex-1" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function PageHeaderSkeleton() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>
            <TableSkeleton rows={5} columns={1} />
        </div>
    )
}
