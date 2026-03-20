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

export async function getBrandSettings() {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/brand-settings`, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getBrandSettings failed" }
    }
}

export async function updateBrandSettings(payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/brand-settings`, payload, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateBrandSettings failed" }
    }
}
