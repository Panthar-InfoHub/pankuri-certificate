import { CategoryPlansTable } from "@/components/plan/category-plans-table"
import { CreatePlanDialog } from "@/components/plan/create-plan-dialog"
import { Button } from "@/components/ui/button"
import { TableSkeleton } from "@/components/ui/skeleton-loader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllActivePlans } from "@/lib/backend_actions/plans"
import { BookOpen, Plus, ShoppingCart, Tag } from "lucide-react"
import { Suspense } from "react"

export default async function CategoryPlansPage() {
    // Fetch both plan types in parallel
    const [categoryPlansPromise, coursePlansPromise, wholeAppPlansPromise] = [
        getAllActivePlans({ plan_type: "CATEGORY" }),
        getAllActivePlans({ plan_type: "COURSE" }),
        getAllActivePlans({ plan_type: "WHOLE_APP" }),
    ]

    return (
        <div className="container mx-auto px-6 py-24">
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold">
                    Plans{" "}
                    <span className="text-gradient-brand">Management</span>
                </h1>
                <p className="text-muted-foreground mt-1">Manage category and course subscription plans</p>
            </div>

            <Tabs defaultValue="category" className="w-full">
                <TabsList variant="line" className="w-full justify-start border-b rounded-none bg-transparent px-0 gap-4">
                    <TabsTrigger
                        value="category"
                        className="text-base px-1 pb-3 gap-2 data-[state=active]:font-semibold"
                    >
                        <Tag className="w-4 h-4" />
                        Category Plans
                    </TabsTrigger>
                    <TabsTrigger
                        value="course"
                        className="text-base px-1 pb-3 gap-2 data-[state=active]:font-semibold"
                    >
                        <BookOpen className="w-4 h-4" />
                        Course Plans
                    </TabsTrigger>
                    <TabsTrigger
                        value="whole-app"
                        className="text-base px-1 pb-3 gap-2 data-[state=active]:font-semibold"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Whole App Plans
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="category" className="mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <p className="text-sm font-medium text-foreground">Category Plans</p>
                            <p className="text-xs text-muted-foreground">Plans that grant access to specific categories</p>
                        </div>
                        <CreatePlanDialog initialPlanType="CATEGORY">
                            <Button variant="gradient" className="shrink-0">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Plan
                            </Button>
                        </CreatePlanDialog>
                    </div>
                    <Suspense fallback={<TableSkeleton rows={4} columns={6} />}>
                        <PlansTableWrapper promise={categoryPlansPromise} label="category" />
                    </Suspense>
                </TabsContent>

                <TabsContent value="course" className="mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <p className="text-sm font-medium text-foreground">Course Plans</p>
                            <p className="text-xs text-muted-foreground">Plans for individual courses</p>
                        </div>
                        <CreatePlanDialog initialPlanType="COURSE">
                            <Button variant="gradient" className="shrink-0">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Plan
                            </Button>
                        </CreatePlanDialog>
                    </div>
                    <Suspense fallback={<TableSkeleton rows={4} columns={6} />}>
                        <PlansTableWrapper promise={coursePlansPromise} label="course" />
                    </Suspense>
                </TabsContent>

                <TabsContent value="whole-app" className="mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <p className="text-sm font-medium text-foreground">Whole App Plans</p>
                            <p className="text-xs text-muted-foreground">Plans that grant access to the entire application</p>
                        </div>
                        <CreatePlanDialog>
                            <Button variant="gradient" className="shrink-0">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Plan
                            </Button>
                        </CreatePlanDialog>
                    </div>
                    <Suspense fallback={<TableSkeleton rows={4} columns={6} />}>
                        <PlansTableWrapper promise={wholeAppPlansPromise} label="whole-app" />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}

async function PlansTableWrapper({ promise, label }: { promise: Promise<any>; label: string }) {
    // "use cache"
    const result = await promise
    const plans = result.success ? result.data : []

    return <CategoryPlansTable plans={plans} />
}
