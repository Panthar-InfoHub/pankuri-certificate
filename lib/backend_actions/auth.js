"use server";

import axios from "axios";

import { API_URL } from "../utils";


export const loginUser = async (admin_mail) => {
    try {
        const resp = await axios.post(`${API_URL}/auth/google-verify-admin`, {
            "admin_mail": admin_mail,
        });

        if (!resp.data.success) throw new Error("Invalid credentials");
        const data = resp.data.data;
        return { success: true, data: data }; // contains user + accessToken
    } catch (error) {
        console.error("Error logging in:", error.response?.data || error.message);
        return { success: false, message: "Login failed" };
    }
};