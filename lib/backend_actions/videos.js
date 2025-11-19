"use server"
import axios from "axios"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
// import { auth } from "../auth" // adjust if needed

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

// Resolve Bearer token (next-auth session → cookie fallback)
async function getAuthHeaders() {
    const jar = cookies()
    const session = await auth().catch(() => null)
    const token = session?.accessToken || jar.get("accessToken")?.value || jar.get("token")?.value

    return token ? { Authorization: `Bearer ${token}` } : {}
}

// ───────────────────────────────────────────────────────────────────────────────
// Create Video  (POST /videos)
export async function createVideo(payload) {
    try {
        // const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/videos`, payload,)
        console.log("Create video response", res.data)
        revalidatePath("/admin/videos")
        return { success: true, data: res.data }
    } catch (error) {
        console.error("createVideo error", error)
        return { success: false, error: error.response?.data?.message || "createVideo failed" }
    }
}
