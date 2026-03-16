"use server"
import axios from "axios"
import { revalidatePath } from "next/cache"
import { auth } from "../auth"

const BASE_URL = process.env.API_URL || "http://localhost:8080/api"

async function getAuthHeaders() {
    const session = await auth().catch(() => null)
    const token = session?.user?.accessToken
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getAdminFaqs({ type = "global", courseId = null } = {}) {
    try {
        const headers = await getAuthHeaders()
        const params = { type }
        if (courseId) params.courseId = courseId
        const res = await axios.get(`${BASE_URL}/faqs/admin`, { headers, params })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getAdminFaqs failed" }
    }
}

export async function createGlobalFaq(payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/faqs/admin/global`, payload, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "createGlobalFaq failed" }
    }
}

export async function updateGlobalFaq(faqId, payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/faqs/admin/global/${faqId}`, payload, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateGlobalFaq failed" }
    }
}

export async function reorderFaqs(items) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/faqs/admin/reorder`, { items }, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "reorderFaqs failed" }
    }
}

export async function deleteFaq(faqId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.delete(`${BASE_URL}/faqs/admin/${faqId}`, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "deleteFaq failed" }
    }
}
