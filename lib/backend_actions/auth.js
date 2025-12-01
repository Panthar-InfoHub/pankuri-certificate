"use server";

import axios from "axios";


const BASE_URL = process.env.API_URL || "http://localhost:8080/api"


export const loginUser = async (admin_mail) => {
    try {
        const resp = await axios.post(`${BASE_URL}/auth/google-verify-admin`, {
            "admin_mail": admin_mail,
        });

        if (!resp.data.success) throw new Error("Invalid credentials");
        console.log("backend login response : ", resp.data)
        const data = resp.data.data;
        return { success: true, data: data }; // contains user + accessToken
    } catch (error) {
        console.error("Error logging in:", error.response?.data || error.message);
        return { success: false, message: "Login failed" };
    }
};