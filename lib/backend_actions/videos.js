"use server"
import axios from "axios"
import { revalidatePath } from "next/cache"
import { auth } from "../auth"

const BASE_URL = process.env.API_URL || "http://localhost:8080/api"

// Resolve Bearer token (next-auth session → cookie fallback)
async function getAuthHeaders() {
    const session = await auth().catch(() => null)
    const token = session?.user?.accessToken

    return token ? { Authorization: `Bearer ${token}` } : {}
}

// ───────────────────────────────────────────────────────────────────────────────
// Create Video  (POST /videos)
export async function createVideo(payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/videos`, payload, { headers })
        console.log("Create video response", res.data)
        revalidatePath("/admin/video-upload")
        return { success: true, data: res.data }
    } catch (error) {
        console.error("createVideo error", error.response?.data)
        return { success: false, error: error.response?.data?.message || "createVideo failed" }
    }
}

// Get all Video  (Get /videos)
export async function getAllVideos(payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/videos`, {
            headers,
            params: { status: payload?.status || undefined, search: payload?.search || undefined }
        })
        console.log("\nGet all video response", res.data)
        return { success: true, data: res.data.data }
    } catch (error) {
        console.error("getAllVideos error", error)
        return { success: false, error: error.response?.data?.message || "getAllVideos failed" }
    }
}
