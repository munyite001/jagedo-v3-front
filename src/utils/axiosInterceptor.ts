/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import { useMemo } from "react";

import { useNavigate } from "react-router-dom";

//@ts-ignore
import { useGlobalContext } from "@/context/GlobalProvider";

const useAxiosWithAuth = (url: any) => {
    const { logout } = useGlobalContext();
    const navigate = useNavigate();

    // memoize instance so hooks using this hook can call it safely
    const axiosInstance = useMemo(() => {
        const instance = axios.create({
            baseURL: url
        });
        // Add request interceptor to include token
        instance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor to handle token expiration
        instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                const status = error.response?.status;
                
                console.log('[Interceptor] API Error:', {
                    status,
                    url: originalRequest?.url,
                    message: error.response?.data?.message || error.message
                });
                
                if ((status === 401 || status === 403) && !originalRequest._retry) {
                    originalRequest._retry = true;
                    const refreshToken = localStorage.getItem("refreshToken");
                    const token = localStorage.getItem("token");

                    if (refreshToken && status === 401) {
                        try {
                            console.log('[Interceptor] Attempting to refresh token...');
                            const response = await axios.post(
                                `${
                                    import.meta.env.VITE_STAGING_API
                                }/auth/refresh/token`,
                                {
                                    refreshToken: refreshToken,
                                    token: token
                                }
                            );
                            const res = await response.data;
                            const newAccessToken = res.token;
                            const newRefreshToken = res.refreshToken;
                            localStorage.setItem("token", newAccessToken);
                            localStorage.setItem("refreshToken", newRefreshToken);
                            console.log('[Interceptor] Token refreshed successfully');
                            return instance(originalRequest);
                        } catch (error) {
                            console.error("[Interceptor] Error refreshing token:", error);
                            console.log('[Interceptor] Redirecting to login (token refresh failed)');
                            logout();
                            navigate("/login");
                            return Promise.reject(error);
                        }
                    } else {
                        console.log('[Interceptor] Token expired/invalid - redirecting to login');
                        logout();
                        navigate("/login");
                        return Promise.reject(new Error('Session expired. Please login again.'));
                    }
                }
                return Promise.reject(error);
            }
        );
        return instance;
    }, [url, logout, navigate]);

    return axiosInstance;
};

export default useAxiosWithAuth;
