"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Loader2 } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import useDebounce from "@/lib/hooks/use-debounce"

const STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
]

const PLAN_TYPE_OPTIONS = [
    { value: "WHOLE_APP", label: "Full App" },
    { value: "CATEGORY", label: "Category" },
    { value: "COURSE", label: "Course" },
]

const PAYMENT_TYPE_OPTIONS = [
    { value: "trial", label: "Trial" },
    { value: "recurring", label: "Recurring" },
    { value: "one_time", label: "One-Time" },
]

const SORTS_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "amount_high", label: "Amount: High to Low" },
    { value: "amount_low", label: "Amount: Low to High" },
]

const GATEWAY_OPTIONS = [
    { value: "razorpay", label: "Razorpay" },
    { value: "google_play", label: "Google Play" },
    { value: "manual", label: "Manual" },
]

export function OrdersFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
    const [planTypeFilter, setPlanTypeFilter] = useState(searchParams.get("planType") || "all")
    const [paymentTypeFilter, setPaymentTypeFilter] = useState(searchParams.get("paymentType") || "all")
    const [gatewayFilter, setGatewayFilter] = useState(searchParams.get("paymentGateway") || "all")
    const [sortFilter, setSortFilter] = useState(searchParams.get("sort") || "newest")
    
    // Dates
    const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "")
    const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "")

    const debouncedSearch = useDebounce(searchTerm, 500)
    const isFirstRender = useRef(true)

    const buildUrl = (overrides: any = {}) => {
        const params = new URLSearchParams()

        const search = overrides.search !== undefined ? overrides.search : searchTerm
        const status = overrides.status !== undefined ? overrides.status : statusFilter
        const planType = overrides.planType !== undefined ? overrides.planType : planTypeFilter
        const paymentType = overrides.paymentType !== undefined ? overrides.paymentType : paymentTypeFilter
        const paymentGateway = overrides.paymentGateway !== undefined ? overrides.paymentGateway : gatewayFilter
        const sort = overrides.sort !== undefined ? overrides.sort : sortFilter
        
        const dFrom = overrides.dateFrom !== undefined ? overrides.dateFrom : dateFrom
        const dTo = overrides.dateTo !== undefined ? overrides.dateTo : dateTo

        if (search) params.set("search", search)
        if (status && status !== "all") params.set("status", status)
        if (planType && planType !== "all") params.set("planType", planType)
        if (paymentType && paymentType !== "all") params.set("paymentType", paymentType)
        if (paymentGateway && paymentGateway !== "all") params.set("paymentGateway", paymentGateway)
        if (sort && sort !== "newest") params.set("sort", sort)
        
        if (dFrom) params.set("dateFrom", dFrom)
        if (dTo) params.set("dateTo", dTo)
        
        params.set("page", "1") // Reset page on filter change

        return `${pathname}?${params.toString()}`
    }

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        
        const currentUrlSearch = searchParams.get("search") || ""
        if (debouncedSearch !== currentUrlSearch) {
            startTransition(() => {
                router.push(buildUrl({ search: debouncedSearch }))
            })
        }
    }, [debouncedSearch])

    const handleFilterChange = (key: string, value: string) => {
        const updates: any = {}
        updates[key] = value
        
        switch(key) {
            case "status": setStatusFilter(value); break;
            case "planType": setPlanTypeFilter(value); break;
            case "paymentType": setPaymentTypeFilter(value); break;
            case "paymentGateway": setGatewayFilter(value); break;
            case "sort": setSortFilter(value); break;
        }

        startTransition(() => {
            router.push(buildUrl(updates))
        })
    }

    const handleDateChange = (type: "from" | "to", value: string) => {
        if (type === "from") {
            setDateFrom(value)
            startTransition(() => {
                router.push(buildUrl({ dateFrom: value }))
            })
        } else {
            setDateTo(value)
            startTransition(() => {
                router.push(buildUrl({ dateTo: value }))
            })
        }
    }

    const clearDates = () => {
        setDateFrom("")
        setDateTo("")
        startTransition(() => {
            router.push(buildUrl({ dateFrom: "", dateTo: "" }))
        })
    }

    return (
        <div className="flex flex-col gap-4 my-8 bg-card/40 p-4 rounded-xl border relative">
            {isPending && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-20">
                    <div className="flex items-center gap-2 bg-background/90 px-4 py-2 rounded-lg border shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                        <span className="text-sm font-medium">Fetching Data...</span>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="w-full relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search orders, plans, users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-x-6 gap-y-4 items-center">
                {/* Sort */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Sort:</span>
                    <Select value={sortFilter} onValueChange={(v) => handleFilterChange("sort", v)}>
                        <SelectTrigger className="w-[140px] h-9 text-sm">
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            {SORTS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Status:</span>
                    <Select value={statusFilter} onValueChange={(v) => handleFilterChange("status", v)}>
                        <SelectTrigger className="w-[140px] h-9 text-sm">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Plan Type */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Plan:</span>
                    <Select value={planTypeFilter} onValueChange={(v) => handleFilterChange("planType", v)}>
                        <SelectTrigger className="w-[140px] h-9 text-sm">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {PLAN_TYPE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Gateway */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Gateway:</span>
                    <Select value={gatewayFilter} onValueChange={(v) => handleFilterChange("paymentGateway", v)}>
                        <SelectTrigger className="w-[140px] h-9 text-sm">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Gateways</SelectItem>
                            {GATEWAY_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Payment Type */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Type:</span>
                    <Select value={paymentTypeFilter} onValueChange={(v) => handleFilterChange("paymentType", v)}>
                        <SelectTrigger className="w-[140px] h-9 text-sm">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            {PAYMENT_TYPE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Date Range Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t mt-1">
                <span className="text-xs font-medium text-muted-foreground">Date Range:</span>
                
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">From:</span>
                    <Input 
                        type="date" 
                        value={dateFrom} 
                        onChange={(e) => handleDateChange("from", e.target.value)} 
                        className="h-8 text-xs w-[140px] cursor-pointer" 
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">To:</span>
                    <Input 
                        type="date" 
                        value={dateTo} 
                        onChange={(e) => handleDateChange("to", e.target.value)} 
                        className="h-8 text-xs w-[140px] cursor-pointer" 
                    />
                </div>

                {(dateFrom || dateTo) && (
                    <button 
                        onClick={clearDates} 
                        className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors ml-2"
                    >
                        <X className="h-3 w-3" /> Clear Dates
                    </button>
                )}
            </div>
        </div>
    )
}
