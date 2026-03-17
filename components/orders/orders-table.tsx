"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HandleCopyBtn } from "@/lib/client.utils"
import {
    CalendarDays,
    CreditCard,
    Crown,
    IndianRupee,
    MoreHorizontal,
    Repeat,
    ShoppingBag,
    XCircle,
    BookOpen,
    Layers,
    CheckCircle2,
    AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import PaginationNumberless from "../customized/pagination/pagination-12"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    paid: "default",
    pending: "secondary",
    failed: "destructive",
    refunded: "outline",
}

const PLAN_TYPE_LABELS: Record<string, string> = {
    WHOLE_APP: "Full App",
    CATEGORY: "Category",
    COURSE: "Course"
}

function formatPrice(amount: number, currency = "INR") {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(amount / 100)
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

export function OrdersTable({
    orders,
    pagination,
}: {
    orders: any[]
    pagination?: any
}) {
    const router = useRouter()

    if (!orders || orders.length === 0) {
        return (
            <div className="border rounded-lg p-12 text-center">
                <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">No orders found.</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Orders will appear here once users make a purchase attempt.
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40">
                            <TableHead>User</TableHead>
                            <TableHead>Plan / Item</TableHead>
                            <TableHead>Plan Type</TableHead>
                            <TableHead>Payment Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Gateway</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Order ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow
                                key={order.id}
                                className="hover:bg-accent/50 cursor-pointer transition-colors"
                            >
                                {/* User */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={order.user?.profileImage} alt={order.user?.displayName} />
                                            <AvatarFallback className="text-xs">
                                                {order.user?.displayName ? getInitials(order.user.displayName) : "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{order.user?.displayName || "Unknown"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{order.user?.email}</p>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Plan Name */}
                                <TableCell>
                                    <div className="max-w-[200px]">
                                        <p className="font-medium text-sm truncate">{order.plan?.name || "—"}</p>
                                    </div>
                                </TableCell>

                                {/* Plan Type */}
                                <TableCell>
                                    <Badge variant="outline" className="text-xs gap-1">
                                        {order.plan?.planType === "WHOLE_APP" && <Crown className="h-3 w-3 text-amber-500" />}
                                        {order.plan?.planType === "CATEGORY" && <Layers className="h-3 w-3 text-pink-500" />}
                                        {order.plan?.planType === "COURSE" && <BookOpen className="h-3 w-3 text-indigo-500" />}
                                        {PLAN_TYPE_LABELS[order.plan?.planType] || order.plan?.planType || "—"}
                                    </Badge>
                                </TableCell>

                                {/* Payment Type */}
                                <TableCell>
                                    <Badge variant="secondary" className="text-xs capitalize">
                                        {order.paymentType || "—"}
                                    </Badge>
                                </TableCell>

                                {/* Amount */}
                                <TableCell>
                                    <span className="font-semibold text-sm">
                                        {order.amount ? formatPrice(order.amount, order.currency) : "—"}
                                    </span>
                                </TableCell>

                                {/* Gateway */}
                                <TableCell>
                                    <Badge className="text-xs" variant="outline">
                                        {order.paymentGateway || "—"}
                                    </Badge>
                                    {order.paymentMethod && (
                                        <div className="text-[10px] text-muted-foreground mt-0.5">
                                            ({order.paymentMethod})
                                        </div>
                                    )}
                                </TableCell>

                                {/* Status */}
                                <TableCell>
                                    <Badge variant={STATUS_VARIANT[order.status] || "outline"} className="text-xs capitalize gap-1 flex items-center w-fit">
                                        {order.status === "paid" && <CheckCircle2 className="h-3 w-3" />}
                                        {order.status === "failed" && <XCircle className="h-3 w-3" />}
                                        {order.status === "pending" && <AlertCircle className="h-3 w-3" />}
                                        {order.status}
                                    </Badge>
                                </TableCell>

                                {/* Date */}
                                <TableCell>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDate(order.createdAt)}
                                    </span>
                                </TableCell>

                                {/* Order ID */}
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <HandleCopyBtn id={order.orderId || order.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {pagination && (
                <div className="mt-4">
                    <PaginationNumberless pagination={pagination} redirectTo="orders" />
                </div>
            )}
        </>
    )
}
