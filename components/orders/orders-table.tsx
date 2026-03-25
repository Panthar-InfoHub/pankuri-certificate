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
    AlertCircle,
    Eye,
    Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import PaginationNumberless from "../customized/pagination/pagination-12"
import { useState } from "react"
import { getOrderById } from "@/lib/backend_actions/orders"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
    
    // Details Modal State
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [orderDetail, setOrderDetail] = useState<any>(null)

    const handleViewDetails = async (id: string) => {
        setIsOpen(true)
        setLoading(true)
        
        const result = await getOrderById(id)
        if (result.success) {
            setOrderDetail(result.data)
        }
        setLoading(false)
    }

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
                            <TableHead>Actions</TableHead>
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

                                {/* Actions */}
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetails(order.id)}>
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    </Button>
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

            {/* details Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
                    </DialogHeader>

                    {loading ? (
                        <div className="p-8 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                        </div>
                    ) : orderDetail ? (
                        <div className="grid gap-6">
                            {/* status row */}
                            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                                <div>
                                    <p className="text-xs text-muted-foreground">Order Status</p>
                                    <Badge variant={STATUS_VARIANT[orderDetail.status] || "outline"} className="mt-1 text-sm capitalize">
                                        {orderDetail.status}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Amount</p>
                                    <p className="text-lg font-bold text-gray-900 mt-1">
                                        {orderDetail.amount ? formatPrice(orderDetail.amount, orderDetail.currency) : "—"}
                                    </p>
                                </div>
                            </div>

                            {/* User & Plan info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border rounded-lg p-3">
                                    <p className="text-xs font-semibold text-muted-foreground mb-2">User Information</p>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={orderDetail.user?.profileImage} />
                                            <AvatarFallback className="text-[10px]">{orderDetail.user?.displayName ? getInitials(orderDetail.user.displayName) : "?"}</AvatarFallback>
                                        </Avatar>
                                        <p className="text-sm font-medium">{orderDetail.user?.displayName || "—"}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Email: {orderDetail.user?.email || "—"}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Phone: {orderDetail.user?.phone || "—"}</p>
                                </div>

                                <div className="border rounded-lg p-3">
                                    <p className="text-xs font-semibold text-muted-foreground mb-2">Plan Information</p>
                                    <p className="text-sm font-medium">{orderDetail.plan?.name || "—"}</p>
                                    <Badge variant="outline" className="text-[10px] mt-1">
                                        Type: {orderDetail.plan?.planType || "—"}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground mt-1">Provider: {orderDetail.plan?.provider || "—"}</p>
                                </div>
                            </div>

                            {/* Payment Data */}
                            <div className="border rounded-lg p-3">
                                <p className="text-sm font-semibold mb-2">Payment Details</p>
                                <div className="grid grid-cols-2 gap-y-2 text-xs">
                                    <p className="text-muted-foreground">Gateway:</p>
                                    <p className="font-medium">{orderDetail.paymentGateway || "—"}</p>

                                    <p className="text-muted-foreground">Method:</p>
                                    <p className="font-medium">{orderDetail.paymentMethod || "—"}</p>

                                    <p className="text-muted-foreground">Type:</p>
                                    <p className="font-medium capitalize">{orderDetail.paymentType || "—"}</p>

                                    <p className="text-muted-foreground">Gateway Order ID:</p>
                                    <p className="font-medium font-mono">{orderDetail.orderId || "—"}</p>

                                    <p className="text-muted-foreground">Gateway Payment ID:</p>
                                    <p className="font-medium font-mono">{orderDetail.paymentId || "—"}</p>

                                    <p className="text-muted-foreground">Created At:</p>
                                    <p className="font-medium">{formatDate(orderDetail.createdAt)}</p>
                                </div>
                            </div>

                            {/* Expandable Technical Details */}
                            <Accordion type="single" collapsible className="w-full">
                                {orderDetail.metadata && Object.keys(orderDetail.metadata).length > 0 && (
                                    <AccordionItem value="metadata" className="border rounded-lg px-3 mb-2">
                                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                                            Metadata & Gateway Response
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <pre className="text-xs bg-muted p-2 rounded max-h-[250px] overflow-auto font-mono mt-2">
                                                {JSON.stringify(orderDetail.metadata, null, 2)}
                                            </pre>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {orderDetail.userSubscription && (
                                    <AccordionItem value="subscription" className="border rounded-lg px-3 mb-2">
                                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                                            Active Entitlement & Subscription
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="grid grid-cols-2 gap-2 text-xs mb-3 mt-2 bg-muted/30 p-2 rounded">
                                                <p className="text-muted-foreground">Subscription ID:</p>
                                                <p className="font-mono">{orderDetail.userSubscription.id}</p>
                                                
                                                <p className="text-muted-foreground">Status:</p>
                                                <p className="font-semibold capitalize">{orderDetail.userSubscription.status}</p>

                                                <p className="text-muted-foreground">Current Period Start:</p>
                                                <p>{formatDate(orderDetail.userSubscription.currentPeriodStart)}</p>

                                                <p className="text-muted-foreground">Current Period End:</p>
                                                <p>{formatDate(orderDetail.userSubscription.currentPeriodEnd)}</p>
                                            </div>
                                            <p className="text-xs font-semibold mb-1">Raw Subscription Object:</p>
                                            <pre className="text-xs bg-muted p-2 rounded max-h-[200px] overflow-auto font-mono">
                                                {JSON.stringify(orderDetail.userSubscription, null, 2)}
                                            </pre>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                            </Accordion>
                        </div>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground">Failed to load details.</p>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
