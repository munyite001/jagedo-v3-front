/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuthHeaders } from "@/utils/auth";

/**
 * Get builders dashboard data
 * @param axiosInstance - Axios instance for making requests
 * @param period - Optional period filter (1day, 1week, 1month, 1year, 5years)
 * @returns Promise with builders dashboard data
 */
export const getBuildersDashboard = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period 
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/builders?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/builders`;
        
        const response = await axiosInstance.get(url, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get builders dashboard data");
    }
};

/**
 * Get customers dashboard data
 * @param axiosInstance - Axios instance for making requests
 * @param period - Optional period filter (1day, 1week, 1month, 1year, 5years)
 * @returns Promise with customers dashboard data
 */
export const getCustomersDashboard = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period 
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/customers?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/customers`;
        
        const response = await axiosInstance.get(url, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get customers dashboard data");
    }
};

/**
 * Get sales analytics data
 * @param axiosInstance - Axios instance for making requests
 * @returns Promise with sales analytics data
 */
export const getSalesAnalytics = async (axiosInstance: any): Promise<any> => {
    try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_SERVER_URL}/api/dashboard/sales`, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get sales analytics data");
    }
};

/**
 * Get sales requests/admin activity data
 * @param axiosInstance - Axios instance for making requests
 * @param period - Optional period filter (1day, 1week, 1month, 1year, 5years)
 * @returns Promise with sales requests data
 */
export const getSalesRequests = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/sales/requests?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/sales/requests`;
        
        const response = await axiosInstance.get(url, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get sales requests data");
    }
};

/**
 * Get dashboard overview (combines builders and customers data)
 * @param axiosInstance - Axios instance for making requests
 * @param period - Optional period filter (1day, 1week, 1month, 1year, 5years)
 * @returns Promise with dashboard overview data
 */
export const getDashboardOverview = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period 
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/overview?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/overview`;
        
        const response = await axiosInstance.get(url, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get dashboard overview");
    }
};

/**
 * Export dashboard data
 * @param axiosInstance - Axios instance for making requests
 * @param type - Export type (builders, customers, sales)
 * @param format - Export format (csv, json)
 * @param period - Optional period filter (1day, 1week, 1month, 1year, 5years)
 * @returns Promise with exported data
 */
export const exportDashboardData = async (
    axiosInstance: any, 
    type: 'builders' | 'customers' | 'sales',
    format: 'csv' | 'json' = 'csv',
    period?: string
): Promise<any> => {
    try {
        let url = `${import.meta.env.VITE_SERVER_URL}/api/dashboard/export?type=${type}&format=${format}`;
        
        if (period) {
            url += `&period=${period}`;
        }
        
        const response = await axiosInstance.get(url, {
            headers: {
                Authorization: getAuthHeaders()
            },
            responseType: format === 'csv' ? 'blob' : 'json'
        });
        
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to export dashboard data");
    }
};

/**
 * Get admin summary (admin only)
 * @param axiosInstance - Axios instance for making requests
 * @returns Promise with admin summary data
 */
export const getAdminSummary = async (axiosInstance: any): Promise<any> => {
    try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_SERVER_URL}/api/dashboard/admin/summary`, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get admin summary");
    }
};

/**
 * Get builders activity statistics
 * @param axiosInstance - Axios instance for making requests
 * @param period - Optional period filter (1day, 1week, 1month, 1year, 5years)
 * @returns Promise with builders activity data
 */
export const getBuildersActivity = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period 
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/builders/activity?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/builders/activity`;
        
        const response = await axiosInstance.get(url, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get builders activity data");
    }
};

/**
 * Get customers activity statistics
 * @param axiosInstance - Axios instance for making requests
 * @param period - Optional period filter (1day, 1week, 1month, 1year, 5years)
 * @returns Promise with customers activity data
 */
export const getCustomersActivity = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period 
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/customers/activity?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/customers/activity`;
        
        const response = await axiosInstance.get(url, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get customers activity data");
    }
};

/**
 * Get revenue by builder type
 * @param axiosInstance - Axios instance for making requests
 * @param year - Optional year filter
 * @returns Promise with revenue by builder type data
 */
export const getRevenueByBuilderType = async (axiosInstance: any, year?: number): Promise<any> => {
    try {
        const url = year 
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/revenue/builder-type?year=${year}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/revenue/builder-type`;
        
        const response = await axiosInstance.get(url, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get revenue by builder type");
    }
};

/**
 * Get sales performance data
 * @param axiosInstance - Axios instance for making requests
 * @param years - Number of years to include (default: 5)
 * @returns Promise with sales performance data
 */
export const getSalesPerformance = async (axiosInstance: any, years: number = 5): Promise<any> => {
    try {
        const response = await axiosInstance.get(
            `${import.meta.env.VITE_SERVER_URL}/api/dashboard/sales/performance?years=${years}`, 
            {
                headers: {
                    Authorization: getAuthHeaders()
                }
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get sales performance data");
    }
};

/**
 * Get management distribution data
 * @param axiosInstance - Axios instance for making requests
 * @param year - Optional year filter
 * @returns Promise with management distribution data
 */
export const getManagementDistribution = async (axiosInstance: any, year?: number): Promise<any> => {
    try {
        const url = year 
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/management/distribution?year=${year}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/management/distribution`;
        
        const response = await axiosInstance.get(url, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get management distribution data");
    }
};

/**
 * Get sales activities (customer or service provider activity)
 * @param axiosInstance - Axios instance for making requests
 * @returns Promise with sales activity data
 */
export const getSalesActivities = async (axiosInstance: any): Promise<any> => {
    try {
        const response = await axiosInstance.get(
            `${import.meta.env.VITE_SERVER_URL}/api/dashboard/activity`,
            {
                headers: {
                    Authorization: getAuthHeaders()
                }
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get sales activities");
    }
};

/**
 * Get admin analytics and summary data
 * @param axiosInstance - Axios instance for making requests
 * @param period - Optional period filter (1day, 1week, 1month, 1year, 5years)
 * @returns Promise with analytics data
 */
export const getAnalytics = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics`;
        
        const response = await axiosInstance.get(url, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get analytics");
    }
};

// --------- new analytics API helpers ---------
export const getUserGrowthTrends = async (axiosInstance: any, period?: string, filters: Record<string, any> = {}): Promise<any> => {
    try {
        let url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/users/growth?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/users/growth`;
        // append filter query params if present
        Object.entries(filters).forEach(([k,v]) => {
            if (v != null) {
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
            }
        });
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get user growth trends");
    }
};

export const getUserAcquisitionSources = async (axiosInstance: any, period?: string, filters: Record<string, any> = {}): Promise<any> => {
    try {
        let url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/users/acquisition?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/users/acquisition`;
        Object.entries(filters).forEach(([k,v]) => {
            if (v != null) {
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
            }
        });
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get user acquisition sources");
    }
};

export const getActiveInactiveUsers = async (axiosInstance: any, period?: string, filters: Record<string, any> = {}): Promise<any> => {
    try {
        let url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/users/active-inactive?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/users/active-inactive`;
        Object.entries(filters).forEach(([k,v]) => {
            if (v != null) {
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
            }
        });
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get active/inactive users");
    }
};

export const getProfileCompletionRates = async (axiosInstance: any, period?: string, filters: Record<string, any> = {}): Promise<any> => {
    try {
        let url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/users/profile-completion?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/users/profile-completion`;
        Object.entries(filters).forEach(([k,v]) => {
            if (v != null) {
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
            }
        });
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get profile completion rates");
    }
};

export const getRoleBasedActivity = async (axiosInstance: any, period?: string, filters: Record<string, any> = {}): Promise<any> => {
    try {
        let url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/users/role-activity?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/users/role-activity`;
        Object.entries(filters).forEach(([k,v]) => {
            if (v != null) {
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
            }
        });
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get role-based activity");
    }
};

export const getProductUploadTrends = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/products/upload-trends?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/products/upload-trends`;
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get product upload trends");
    }
};

export const getCategoryPerformance = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/products/category-performance?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/products/category-performance`;
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get category performance");
    }
};

export const getSupplierActivity = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/products/supplier-activity?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/products/supplier-activity`;
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get supplier activity");
    }
};

export const getMostViewedProducts = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/products/most-viewed?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/products/most-viewed`;
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get most viewed products");
    }
};

export const getProductApprovalRejection = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/products/approval?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/products/approval`;
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get product approval stats");
    }
};

export const getLoginFrequency = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/engagement/login-frequency?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/engagement/login-frequency`;
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get login frequency");
    }
};

export const getOtpSuccessFailure = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/engagement/otp?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/engagement/otp`;
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get OTP stats");
    }
};

export const getSessionTracking = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/engagement/sessions?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/engagement/sessions`;
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get session tracking data");
    }
};

export const getFeatureUsage = async (axiosInstance: any, period?: string): Promise<any> => {
    try {
        const url = period
            ? `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/engagement/feature-usage?period=${period}`
            : `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/engagement/feature-usage`;
        const response = await axiosInstance.get(url, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to get feature usage data");
    }
};

// add other helpers similarly if needed (product/shop, engagement) as application evolves

export const logProductView = async (axiosInstance: any, productId: string): Promise<any> => {
    try {
        const url = `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/event/product-view`;
        const response = await axiosInstance.post(url, { productId }, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to log product view');
    }
};

export const logFeatureUsage = async (axiosInstance: any, feature: string): Promise<any> => {
    try {
        const url = `${import.meta.env.VITE_SERVER_URL}/api/dashboard/analytics/event/feature-usage`;
        const response = await axiosInstance.post(url, { feature }, { headers: { Authorization: getAuthHeaders() } });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to log feature usage');
    }
};

export const exportAnalyticsReport = async (
    axiosInstance: any,
    type: 'builders' | 'customers' | 'sales',
    format: 'csv' | 'json' | 'xlsx' = 'csv',
    period?: string
): Promise<any> => {
    try {
        let url = `${import.meta.env.VITE_SERVER_URL}/api/dashboard/export?type=${type}&format=${format}`;
        if (period) {
            url += `&period=${period}`;
        }
        
        const response = await axiosInstance.get(url, {
            headers: {
                Authorization: getAuthHeaders()
            },
            responseType: format === 'json' ? 'json' : 'blob'
        });
        
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to export analytics report');
    }
};

// Export all functions as a single object for convenience
const analyticApi = {
    getBuildersDashboard,
    getCustomersDashboard,
    getSalesAnalytics,
    getSalesRequests,
    getDashboardOverview,
    exportDashboardData,
    exportAnalyticsReport,
    getAdminSummary,
    getBuildersActivity,
    getCustomersActivity,
    getRevenueByBuilderType,
    getSalesPerformance,
    getManagementDistribution,
    getSalesActivities,
    getAnalytics,
    getUserGrowthTrends,
    getUserAcquisitionSources,
    getActiveInactiveUsers,
    getProfileCompletionRates,
    getRoleBasedActivity,
    getProductUploadTrends,
    getProductApprovalRejection,
    getCategoryPerformance,
    getSupplierActivity,
    getMostViewedProducts,
    getLoginFrequency,
    getOtpSuccessFailure,
    getSessionTracking,
    getFeatureUsage,
    logProductView,
    logFeatureUsage
};

export default analyticApi;