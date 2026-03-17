"use server"
import axios from "axios"
import { auth } from "../auth"

const BASE_URL = process.env.API_URL || "http://localhost:8080/api"

async function getAuthHeaders() {
    const session = await auth().catch(() => null)
    const token = session?.user?.accessToken
    return token ? { Authorization: `Bearer ${token}` } : {}
}

// ───────────────────────────────────────────────────────────────────────────────
// Admin: Get All Orders
export async function getAllOrders({
    page = 1,
    limit = 20,
    status = null,
    paymentType = null,
    paymentGateway = null,
    planType = null,
    search = null,
    dateFrom = null,
    dateTo = null,
    sort = "newest"
} = {}) {
    try {
        const headers = await getAuthHeaders()
        const params = {
            page,
            limit,
            sort
        }

        if (status && status !== "all") params.status = status
        if (paymentType && paymentType !== "all") params.paymentType = paymentType
        if (paymentGateway && paymentGateway !== "all") params.paymentGateway = paymentGateway
        if (planType && planType !== "all") params.planType = planType
        if (search) params.search = search
        if (dateFrom) params.dateFrom = dateFrom
        if (dateTo) params.dateTo = dateTo

        const res = await axios.get(`${BASE_URL}/admin/orders`, { headers, params })

        return { success: true, data: res.data }
    } catch (error) {
        console.error("getAllOrders error:", error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || "getAllOrders failed" }
    }
}
