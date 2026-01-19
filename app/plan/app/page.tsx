import { AppPlansTable } from "@/components/plan/app-plan-table"
import { CreatePlanDialog } from "@/components/plan/create-plan-dialog"
import { Button } from "@/components/ui/button"
import { TableSkeleton } from "@/components/ui/skeleton-loader"
import { getAllActivePlans } from "@/lib/backend_actions/plans"
import { Plus } from "lucide-react"
import { Suspense } from "react"

interface searchParamsProps {
    searchParams: Promise<{
        temple_color: string | string[]
    }>
}

export default async function CategoryPlansPage({ searchParams }: searchParamsProps) {
    const searchP = await searchParams;

    const plansPromise = getAllActivePlans({
        plan_type: "WHOLE_APP",
    })

    return (
        <div className="container mx-auto px-6 py-24">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gradient-brand">Whole App Plans</h1>
                    <p className="text-muted-foreground mt-2">Manage plans for the whole app</p>
                </div>

                <CreatePlanDialog>
                    <Button variant="gradient">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Whole App Plan
                    </Button>
                </CreatePlanDialog>
            </div>

            {/* <PlanFilter /> */}

            <Suspense fallback={<TableSkeleton rows={4} columns={6} />}>
                <PlansTableWrapper promise={plansPromise} />
            </Suspense>
        </div>
    )
}

async function PlansTableWrapper({ promise }: { promise: Promise<any> }) {
    const result = await promise
    const plans = result.success ? result.data : []
    // let plansList = [];
    // let pagination = null;

    // if (Array.p(plans)) {
    //     plansList = plans;
    // } else if (plans && Array.isArray(plans.data)) {
    //     plansList = plans.data;
    //     pagination = plans.pagination;
    // }

    // Client side filtering if backend doesn't support search yet (Since getAllActivePlans only had plan_type)
    // But ideally this should be server side. 
    // For now we just pass data.

    return <AppPlansTable plans={plans} />
}
