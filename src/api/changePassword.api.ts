import { getAuthHeaders } from "@/utils/auth";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Change current user's password
 */
export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/roles/change-password`,
      {
        oldPassword,
        newPassword,
      },
      {
        headers: { Authorization: getAuthHeaders() },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to change password"
    );
  }
};

/**
 * Reset another admin user's password (admin only)
 */
export const resetAdminUserPassword = async (
  userId: number
): Promise<ChangePasswordResponse> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/roles/admin-users/${userId}/reset-password`,
      {},
      {
        headers: { Authorization: getAuthHeaders() },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Reset password error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to reset password"
    );
  }
};
