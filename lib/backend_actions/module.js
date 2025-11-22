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

// Get Modules by Course ID (GET /modules?courseId=)
export async function getModulesByCourse(courseId, { page = 1, limit = 20, status = "active" } = {}) {
    try {
        const headers = await getAuthHeaders()
        const params = { courseId, page, limit, status }
        const res = await axios.get(`${BASE_URL}/modules`, { headers, params })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getModulesByCourse failed" }
    }
}

// Get Module by ID (GET /modules/:moduleId)
export async function getModuleById(moduleId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/modules/${moduleId}`, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getModuleById failed" }
    }
}

// Create Module (POST /modules)
export async function createModule(payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/modules`, payload, { headers })
        revalidatePath("/admin/modules")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "createModule failed" }
    }
}

// Update Module (PUT /modules/:moduleId)
export async function updateModule(moduleId, payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.put(`${BASE_URL}/modules/${moduleId}`, payload, { headers })
        revalidatePath("/admin/modules")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateModule failed" }
    }
}

// Delete Module (DELETE /modules/:moduleId)
export async function deleteModule(moduleId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.delete(`${BASE_URL}/modules/${moduleId}`, { headers })
        revalidatePath("/admin/modules")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "deleteModule failed" }
    }
}

// Update Module Sequence (PATCH /modules/:moduleId/sequence)
export async function updateModuleSequence(moduleId, sequence) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/modules/${moduleId}/sequence`, { sequence }, { headers })
        revalidatePath("/admin/modules")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateModuleSequence failed" }
    }
}

// Toggle Module Status (PATCH /modules/:moduleId/status)
export async function updateModuleStatus(moduleId, status) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/modules/${moduleId}/status`, { status }, { headers })
        revalidatePath("/admin/modules")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateModuleStatus failed" }
    }
}
