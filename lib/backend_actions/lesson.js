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

// Get Lessons by Module ID (GET /lessons?moduleId=)
export async function getLessonsByModule(moduleId, { page = 1, limit = 20, status = "active" } = {}) {
    try {
        const headers = await getAuthHeaders()
        const params = { moduleId, page, limit, status }
        const res = await axios.get(`${BASE_URL}/lessons`, { headers, params })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getLessonsByModule failed" }
    }
}

// Get Lesson by ID (GET /lessons/:lessonId)
export async function getLessonById(lessonId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/lessons/${lessonId}`, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getLessonById failed" }
    }
}

// Create Lesson (POST /lessons)
export async function createLesson(payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/lessons`, payload, { headers })
        revalidatePath("/admin/lessons")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "createLesson failed" }
    }
}

// Update Lesson (PUT /lessons/:lessonId)
export async function updateLesson(lessonId, payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.put(`${BASE_URL}/lessons/${lessonId}`, payload, { headers })
        revalidatePath("/admin/lessons")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateLesson failed" }
    }
}

// Delete Lesson (DELETE /lessons/:lessonId)
export async function deleteLesson(lessonId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.delete(`${BASE_URL}/lessons/${lessonId}`, { headers })
        revalidatePath("/admin/lessons")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "deleteLesson failed" }
    }
}

// Bulk Update Lessons Sequence (PATCH /lessons/sequence)
export async function updateLessonsSequence(sequencePayload) {
    // sequencePayload should be array of {lessonId, sequence}
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/lessons/sequence`, sequencePayload, { headers })
        revalidatePath("/admin/lessons")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateLessonsSequence failed" }
    }
}

// Toggle Lesson Status (PATCH /lessons/:lessonId/status)
export async function updateLessonStatus(lessonId, status) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/lessons/${lessonId}/status`, { status }, { headers })
        revalidatePath("/admin/lessons")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateLessonStatus failed" }
    }
}
