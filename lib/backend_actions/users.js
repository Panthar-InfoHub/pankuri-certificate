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
// Admin: Get All Users (GET /users/admin/users)
export async function getAllUsers({ page = 1, limit = 50, status = "active", search = "", role = null } = {}) {
    try {
        const headers = await getAuthHeaders()
        const params = { page, limit, status, search }
        if (role) params.role = role
        const res = await axios.get(`${BASE_URL}/users/admin/users`, { headers, params })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getAllUsers failed" }
    }
}

// Admin: Get User by ID (GET /users/admin/users/:userId)
export async function getUserById(userId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/users/admin/users/${userId}`, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getUserById failed" }
    }
}

// Admin: Create User (POST /users/admin/users)
export async function createUser(payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/users/admin/users`, payload, { headers })
        revalidatePath("/admin/users")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "createUser failed" }
    }
}

// Admin: Update User (PUT /users/admin/users/:userId)
export async function updateUser(userId, payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.put(`${BASE_URL}/users/admin/users/${userId}`, payload, { headers })
        revalidatePath("/admin/users")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateUser failed" }
    }
}

// Admin: Delete User (DELETE /users/admin/users/:userId)
export async function deleteUser(userId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.delete(`${BASE_URL}/users/admin/users/${userId}`, { headers })
        revalidatePath("/admin/users")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "deleteUser failed" }
    }
}

// Admin: Update User Status (PATCH /users/admin/users/:userId/status)
export async function updateUserStatus(userId, status) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/users/admin/users/${userId}/status`, { status }, { headers })
        revalidatePath("/admin/users")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateUserStatus failed" }
    }
}

// Admin: Update User Role (PATCH /users/admin/users/:userId/role)
export async function updateUserRole(userId, role) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/users/admin/users/${userId}/role`, { role }, { headers })
        revalidatePath("/admin/users")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateUserRole failed" }
    }
}
