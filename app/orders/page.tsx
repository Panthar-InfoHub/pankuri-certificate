import { OrdersFilter } from "@/components/orders/orders-filter"
import { OrdersTable } from "@/components/orders/orders-table"
import { PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { getAllOrders } from "@/lib/backend_actions/orders"
import { BadgeIndianRupee, ShoppingBag, CheckCircle, AlertCircle, XCircle, RotateCcw } from "lucide-react"
import { Suspense } from "react"

function formatPrice(amount: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
    }).format(amount)
}

async function OrdersContent({ searchP }: { searchP: any }) {
    const page = Number(searchP?.page) || 1
    const limit = Number(searchP?.limit) || 20
    const search = searchP?.search || null
    const status = searchP?.status || null
    const planType = searchP?.planType || null
    const paymentType = searchP?.paymentType || null
    const sort = searchP?.sort || "newest"

    const dateFrom = searchP?.dateFrom || null
    const dateTo = searchP?.dateTo || null
    const paymentGateway = searchP?.paymentGateway || null

    const result = await getAllOrders({ limit, page, search, status, planType, paymentType, sort, dateFrom, dateTo, paymentGateway })
    const orders = result.success ? result.data.data : []
    const summary = result.success ? result.data.summary : null
    const pagination = result.success ? result.data.pagination : null

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    Orders &{" "}
                    <span className="bg-linear-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                        Payments
                    </span>
                </h1>
                <p className="text-muted-foreground mt-2">
                    Track and manage all user orders and payments activity
                </p>
            </div>

            {/* Metrics */}
            {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* 1. Total Revenue */}
                    <div className="rounded-xl border p-5 flex items-start gap-3 bg-emerald-50/10">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                            <BadgeIndianRupee className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{formatPrice(summary.totalRevenueInRupees)}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">From {summary.paidOrders} paid orders</p>
                        </div>
                    </div>

                    {/* 2. Paid Orders */}
                    <div className="rounded-xl border bg-card p-5 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Paid Orders</p>
                            <p className="text-2xl font-bold mt-0.5">{summary.statusBreakdown.paid}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Successful transactions</p>
                        </div>
                    </div>

                    {/* 3. Pending */}
                    <div className="rounded-xl border bg-card p-5 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Pending</p>
                            <p className="text-2xl font-bold mt-0.5">{summary.statusBreakdown.pending}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Awaiting completion</p>
                        </div>
                    </div>

                    {/* 4. Failed */}
                    <div className="rounded-xl border bg-card p-5 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Failed</p>
                            <p className="text-2xl font-bold mt-0.5">{summary.statusBreakdown.failed}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Unsuccessful attempts</p>
                        </div>
                    </div>
                </div>
            )}

            <OrdersFilter />

            <OrdersTable orders={orders} pagination={pagination} />
        </>
    )
}

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<any>
}) {
    const searchP = await searchParams

    return (
        <div className="container mx-auto px-6 py-24">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <OrdersContent searchP={searchP} />
            </Suspense>
        </div>
    )
}
