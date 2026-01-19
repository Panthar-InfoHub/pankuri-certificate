"use server"
import axios from "axios"
import { revalidatePath } from "next/cache"
import { auth } from "../auth"

const BASE_URL = process.env.API_URL || "http://localhost:8080/api"

// Resolve Bearer token
async function getAuthHeaders() {
    const session = await auth().catch(() => null)
    const token = session?.user?.accessToken
    return token ? { Authorization: `Bearer ${token}` } : {}
}

// ──────────────────────────────────────────
// Get Category Tree (GET /categories?status=active)
export async function getCategoryTree() {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/categories?status=active`, { headers })
        console.log("Category tree res  ==> ", res.data.data)
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getCategoryTree failed" }
    }
}

// Get Flat Categories (GET /categories/flat)
export async function getFlatCategories({ page = 1, limit = 20, status = "active", search = "" } = {}) {
    try {
        const headers = await getAuthHeaders()
        const params = { page, limit, status, search }
        const res = await axios.get(`${BASE_URL}/categories/flat`, { headers, params })
        console.log("Flat category res  ==> ", res.data)
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getFlatCategories failed" }
    }
}

// Get Category by ID (GET /categories/:categoryId)
export async function getCategoryById(categoryId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/categories/${categoryId}`, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getCategoryById failed" }
    }
}

// Create Category (POST /categories)
export async function createCategory(payload) {
    console.log("Creating category with payload:", payload)
    try {
        const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/categories`, payload, { headers })
        revalidatePath("/admin/category")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "createCategory failed" }
    }
}

// Update Category (PUT /categories/:categoryId)
export async function updateCategory(categoryId, payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.put(`${BASE_URL}/categories/${categoryId}`, payload, { headers })
        revalidatePath("/admin/category")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateCategory failed" }
    }
}

// Delete Category (DELETE /categories/:categoryId)
export async function deleteCategory(categoryId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.delete(`${BASE_URL}/categories/${categoryId}`, { headers })
        revalidatePath("/admin/category")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "deleteCategory failed" }
    }
}

// Update Category Sequence (PATCH /categories/:categoryId/sequence)
export async function updateCategorySequence(categoryId, sequence) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/categories/${categoryId}/sequence`, { sequence }, { headers })
        revalidatePath("/admin/category")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateCategorySequence failed" }
    }
}

// Toggle Category Status (PATCH /categories/:categoryId/status)
export async function updateCategoryStatus(categoryId, status) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/categories/${categoryId}/status`, { status }, { headers })
        revalidatePath("/admin/category")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "updateCategoryStatus failed" }
    }
}
