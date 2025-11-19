"use server";

import axios from "axios";

import { auth, signOut } from "@/lib/auth";
import { API_URL } from "../utils";


export const loginUser = async (idToken) => {
    try {
        const resp = await axios.post(`${API_URL}/auth/google-verify-admin`, {
            "idToken": idToken,
        });

        if (!resp.data.success) throw new Error("Invalid credentials");
        const data = resp.data.data;
        return { success: true, data: data }; // contains user + accessToken
    } catch (error) {
        console.error("Error logging in:", error);
        return { success: false, message: "Login failed" };
    }
};