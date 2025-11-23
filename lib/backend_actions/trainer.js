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

// ───────────────────────────────────────────────────────────────────────────────
// Admin: Get All Trainers (with filters)
// GET /users/admin/trainers?status=active&search=&page=1&limit=50
export async function getAllTrainersAdmin({ page = 1, limit = 50, status = "active", search = "" } = {}) {
    try {
        const headers = await getAuthHeaders()
        const params = { page, limit, status, search }
        const res = await axios.get(`${BASE_URL}/users/admin/trainers`, { headers, params })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getAllTrainersAdmin failed" }
    }
}

// Public: Get All Trainers (Active only)
// GET /users/trainers
export async function getPublicTrainers({ page = 1, limit = 20, search = "" } = {}) {
    try {
        const params = { page, limit, search }
        // Public endpoint usually doesn't strictly need auth, but sending it is often safe/optional
        const res = await axios.get(`${BASE_URL}/users/trainers`, { params })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getPublicTrainers failed" }
    }
}

// Admin: Get Trainer by ID
// GET /users/admin/trainers/:trainerId
export async function getTrainerById(trainerId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/users/admin/trainers/${trainerId}`, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getTrainerById failed" }
    }
}

// Admin: Create Trainer Profile
// POST /users/admin/trainers
export async function createTrainer(payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/users/admin/trainers`, payload, { headers })
        revalidatePath("/admin/trainers")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "createTrainer failed" }
    }
}

// Admin: Update Trainer Profile
// PUT /users/admin/trainers/:trainerId
export async function updateTrainer(trainerId, payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.put(`${BASE_URL}/users/admin/trainers/${trainerId}`, payload, { headers })
        revalidatePath("/admin/trainers")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateTrainer failed" }
    }
}

// Admin: Delete Trainer Profile
// DELETE /users/admin/trainers/:trainerId
export async function deleteTrainer(trainerId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.delete(`${BASE_URL}/users/admin/trainers/${trainerId}`, { headers })
        revalidatePath("/admin/trainers")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "deleteTrainer failed" }
    }
}
