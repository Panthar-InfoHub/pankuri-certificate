"use server"
import axios from "axios"
import { getAuthHeaders } from "./lesson"

const BASE_URL = process.env.API_URL || "http://localhost:8080/api"

export async function getAllActivePlans({ plan_type = "", subscription_type = "" }) {
    try {
        const params = {};
        if (plan_type) params.plan_type = plan_type;
        if (subscription_type) params.subscription_type = subscription_type;

        const res = await axios.get(`${BASE_URL}/plans`, { params });
        console.debug("Get all active plans response data:", res.data);
        return { success: true, data: res.data.data }
    } catch (error) {
        console.error("Error getting all active plans:", error.response?.data);
        return { success: false, error: error.response?.data?.message || "get all active plans failed" }
    }
}


export async function getPlanBySlug(slug) {
    try {
        const res = await axios.get(`${BASE_URL}/plans/slug/${slug}`)
        console.debug("Get plan by slug ==> ", res.data);
        return { success: true, data: res.data.data }
    } catch (error) {
        console.error("Error getting plan by slug:", error.response?.data);
        return { success: false, error: error.response?.data?.message || "get plan by slug failed" }
    }
}


export async function getPlanById(id) {
    try {
        const res = await axios.get(`${BASE_URL}/plans/${id}`)
        console.debug("Get plan by id ==> ", res.data);
        return { success: true, data: res.data.data }
    } catch (error) {
        console.error("Error getting plan by id:", error.response?.data);
        return { success: false, error: error.response?.data?.message || "get plan by id failed" }
    }
}


// ===== ADMIN ACTIONS =====

export async function createPlan(data) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/plans`, data, { headers })
        console.debug("Create plan response ==> ", res.data);
        return { success: true, data: res.data.data }
    } catch (error) {
        console.error("Error creating plan:", error.response?.data);
        return { success: false, error: error.response?.data?.message || "create plan failed" }
    }
}



export async function deletePlan(id) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.delete(`${BASE_URL}/plans/${id}`, { headers })
        console.debug("Delete plan response ==> ", res.data);
        return { success: true, data: res.data.data }
    } catch (error) {
        console.error("Error deleting plan:", error.response?.data);
        return { success: false, error: error.response?.data?.message || "delete plan failed" }
    }
}