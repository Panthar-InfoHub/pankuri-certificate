import { CategoryPlansTable } from "@/components/plan/category-plans-table"
import { TableSkeleton } from "@/components/ui/skeleton-loader"
import { getAllActivePlans } from "@/lib/backend_actions/plans"
import { Suspense } from "react"

interface searchParamsProps {
    searchParams: Promise<{
        temple_color: string | string[]
    }>
}

export default async function CategoryPlansPage({ searchParams }: searchParamsProps) {
    const searchP = await searchParams;

    const plansPromise = getAllActivePlans({
        plan_type: "CATEGORY", // Assuming this is correct for "Category Plan"
    })

    return (
        <div className="container mx-auto px-6 py-24">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gradient-brand">Category Plans</h1>
                    <p className="text-muted-foreground mt-2">Manage plans for categories</p>
                </div>

            </div>


            <Suspense fallback={<TableSkeleton rows={4} columns={6} />}>
                <PlansTableWrapper promise={plansPromise} />
            </Suspense>
        </div>
    )
}

async function PlansTableWrapper({ promise }: { promise: Promise<any> }) {
    const result = await promise
    const plans = result.success ? result.data : []

    return <CategoryPlansTable plans={plans} />
}
