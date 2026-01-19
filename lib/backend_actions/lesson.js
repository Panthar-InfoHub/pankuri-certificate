"use server"
import axios from "axios"
import { revalidatePath } from "next/cache"
import { auth } from "../auth"

const BASE_URL = process.env.API_URL || "http://localhost:8080/api"

export async function getAuthHeaders() {
    const session = await auth().catch(() => null)
    const token = session?.user?.accessToken
    return token ? { Authorization: `Bearer ${token}` } : {}
}

// Get Lessons by Course (GET /lessons/course/:courseId)
// Optional query param moduleId to filter further
export async function getLessonsByCourse(courseId, { moduleId = null, status = null } = {}) {
    try {
        const headers = await getAuthHeaders()
        const params = {}
        if (moduleId !== null) params.moduleId = moduleId
        if (status !== null) params.status = status
        const res = await axios.get(`${BASE_URL}/lessons/course/${courseId}`, { headers, params })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getLessonsByCourse failed" }
    }
}

// Get Lessons by Module (GET /lessons/module/:moduleId)
export async function getLessonsByModule(moduleId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/lessons/module/${moduleId}`, { headers })
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
        console.debug("getLessonById error:", error.response?.data);
        return { success: false, error: error.response?.data?.message || "getLessonById failed" }
    }
}

// Get Lesson by Slug within course (GET /lessons/course/:courseId/slug/:slug)
export async function getLessonBySlug(courseId, slug) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/lessons/course/${courseId}/slug/${slug}`, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getLessonBySlug failed" }
    }
}

// Create Lesson (POST /lessons)
export async function createLesson(payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/lessons`, payload, { headers })
        revalidatePath("/lessons")
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
        revalidatePath("/lessons")
        return { success: true, data: res.data }
    } catch (error) {
        console.error("updateLesson error:", error.response?.data);
        return { success: false, error: error.response?.data?.message || "updateLesson failed" }
    }
}

// Delete Lesson (DELETE /lessons/:lessonId)
export async function deleteLesson(lessonId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.delete(`${BASE_URL}/lessons/${lessonId}`, { headers })
        revalidatePath("/lessons")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "deleteLesson failed" }
    }
}

// Bulk Update Lesson Sequences (PATCH /lessons/sequences)
export async function updateLessonsSequence(updates) {
    // updates = [{id: lessonId, sequence: newSequence}, ...]
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/lessons/sequences`, updates, { headers })
        revalidatePath("/lessons")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateLessonsSequence failed" }
    }
}

// Update Lesson Status (PATCH /lessons/:lessonId/status)
export async function updateLessonStatus(lessonId, status) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/lessons/${lessonId}/status`, { status }, { headers })
        revalidatePath("/lessons")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateLessonStatus failed" }
    }
}


// ## LESSOn DESCIRPTION

// Get Lesson Description (GET /lessons/:lessonId/description)
export async function getLessonDescription(lessonId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/lessons/${lessonId}/description`, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getLessonDescription failed" }
    }
}

// Update Lesson Description (PUT /lessons/:lessonId/description)
export async function upsertLessonDescription(lessonId, payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.put(`${BASE_URL}/lessons/${lessonId}/description`, payload, { headers })
        revalidatePath(`/lesson/${lessonId}`)
        revalidatePath("/lessons")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateLessonDescription failed" }
    }
}

// ## LESSON ATTACHMENTS
// Upload Lesson Attachment (POST /lessons/:lessonId/attachments)
// Note: Typically payload is FormData with file(s)
export async function uploadLessonAttachment(lessonId, formData) {
    try {
        const headers = await getAuthHeaders()
        // Set content-type to multipart/form-data automatically by Axios when sending FormData
        const res = await axios.post(`${BASE_URL}/lessons/${lessonId}/attachments`, formData, { headers })
        revalidatePath("/lesson")
        revalidatePath(`/lesson/${lessonId}`)
        return { success: true, data: res.data }
    } catch (error) {
        console.error("uploadLessonAttachment error:", error.response?.data);
        return { success: false, error: error.response?.data?.message || "uploadLessonAttachment failed" }
    }
}

// Delete Lesson Attachment (DELETE /lessons/attachments/:attachmentId)
export async function deleteLessonAttachment(attachmentId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.delete(`${BASE_URL}/lessons/attachments/${attachmentId}`, { headers })
        revalidatePath("/lesson")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "deleteLessonAttachment failed" }
    }
}
