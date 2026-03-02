/**
 * Frontend Export Utility
 * Handles downloading exported analytics data
 */

/**
 * Download file from blob or data
 * @param {Blob|string} data - File data to download
 * @param {string} filename - Name of the file
 * @param {string} mimeType - MIME type of the file
 */
export const downloadFile = (data, filename, mimeType = "text/plain") => {
  try {
    let blob;

    if (data instanceof Blob) {
      blob = data;
    } else {
      blob = new Blob([data], { type: mimeType });
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw new Error("Failed to download file");
  }
};

/**
 * Get filename with timestamp
 * @param {string} type - Report type
 * @param {string} format - Export format
 * @returns {string} Filename
 */
export const getExportFilename = (type, format) => {
  const timestamp = new Date().toISOString().split("T")[0];
  const ext = format === "xlsx" ? "xlsx" : format === "csv" ? "csv" : "json";
  return `${type}-report-${timestamp}.${ext}`;
};

/**
 * Handle export response and trigger download
 * @param {any} response - Response from export API
 * @param {string} type - Report type
 * @param {string} format - Export format
 */
export const handleExportResponse = (response, type, format) => {
  const filename = getExportFilename(type, format);

  if (response instanceof Blob) {
    // Binary data (CSV or XLSX)
    const mimeType =
      format === "xlsx"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "text/csv";
    downloadFile(response, filename, mimeType);
  } else if (typeof response === "string") {
    // String data (CSV or JSON)
    const mimeType = format === "csv" ? "text/csv" : "application/json";
    downloadFile(response, filename, mimeType);
  } else {
    // JSON object - convert to string
    const jsonStr = JSON.stringify(response, null, 2);
    downloadFile(jsonStr, filename, "application/json");
  }
};

/**
 * Export analytics report
 * @param {any} axiosInstance - Axios instance
 * @param {string} type - Report type (builders, customers, sales, etc.)
 * @param {string} format - Export format (csv, xlsx, json)
 * @param {string} period - Time period filter
 * @returns {Promise} Export promise
 */
export const exportAnalyticsData = async (
  axiosInstance,
  type,
  format = "csv",
  period = null
) => {
  try {
    let url = `${import.meta.env.VITE_SERVER_URL}/api/dashboard/export?type=${type}&format=${format}`;

    if (period) {
      url += `&period=${period}`;
    }

    const response = await axiosInstance.get(url, {
      responseType: format === "json" ? "json" : "blob",
    });

    return response.data;
  } catch (error) {
    console.error(`Error exporting ${type} report:`, error);
    throw new Error(
      error.response?.data?.message || `Failed to export ${type} report`
    );
  }
};

/**
 * Batch export multiple reports
 * @param {any} axiosInstance - Axios instance
 * @param {Array} types - Array of report types to export
 * @param {string} format - Export format
 * @param {string} period - Time period filter
 * @returns {Promise} Array of export responses
 */
export const batchExportReports = async (
  axiosInstance,
  types,
  format = "csv",
  period = null
) => {
  try {
    const promises = types.map((type) =>
      exportAnalyticsData(axiosInstance, type, format, period).catch((error) => ({
        type,
        error: error.message,
      }))
    );

    return Promise.all(promises);
  } catch (error) {
    console.error("Error in batch export:", error);
    throw new Error("Failed to batch export reports");
  }
};

/**
 * Export with error handling and user feedback
 * @param {any} axiosInstance - Axios instance
 * @param {string} type - Report type
 * @param {string} format - Export format
 * @param {string} period - Time period filter
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const exportWithFeedback = async (
  axiosInstance,
  type,
  format = "csv",
  period = null,
  onSuccess = null,
  onError = null
) => {
  try {
    const data = await exportAnalyticsData(axiosInstance, type, format, period);
    handleExportResponse(data, type, format);

    if (onSuccess) {
      onSuccess(`Successfully exported ${type} report as ${format.toUpperCase()}`);
    }

    return data;
  } catch (error) {
    console.error("Export error:", error);
    const errorMessage =
      error.message || `Failed to export ${type} report`;

    if (onError) {
      onError(errorMessage);
    }

    throw error;
  }
};

export default {
  downloadFile,
  getExportFilename,
  handleExportResponse,
  exportAnalyticsData,
  batchExportReports,
  exportWithFeedback,
};
