/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { getAuthHeaders } from "@/utils/auth";

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api/admin/logs`;

export interface LogFilterOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    identifier?: string;
    attemptType?: string;
    action?: string;
    entityType?: string;
}

export interface PaginatedLogResponse<T> {
    success: boolean;
    data: {
        logs: T[];
        page: number;
        limit: number;
        totalPages: number;
        totalResults: number;
    };
}

/**
 * Fetch Authentication Logs (Login/Logout/Failures)
 */
export const getAuthLogs = async (params: LogFilterOptions = {}): Promise<PaginatedLogResponse<any>> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/auth`, {
            headers: { Authorization: getAuthHeaders() },
            params,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch authentication logs");
    }
};

/**
 * Fetch OTP Logs (Generation and Verification)
 */
export const getOtpLogs = async (params: LogFilterOptions = {}): Promise<PaginatedLogResponse<any>> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/otp`, {
            headers: { Authorization: getAuthHeaders() },
            params,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch OTP logs");
    }
};

/**
 * Fetch Audit Logs (Admin Actions)
 */
export const getAuditLogs = async (params: LogFilterOptions = {}): Promise<PaginatedLogResponse<any>> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/audit`, {
            headers: { Authorization: getAuthHeaders() },
            params,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch audit logs");
    }
};
