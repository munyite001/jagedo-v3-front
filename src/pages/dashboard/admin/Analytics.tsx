import React, { useState, useEffect } from "react";
import ReactGA from "react-ga4";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FF6B6B",
  "#4ECDC4",
];

import useAxiosWithAuth from "@/utils/axiosInterceptor";
import { SummarySection } from "@/pages/dashboard/admin/components/Analytics/SummarySection";
import {
  getSalesRequests,
  getSalesAnalytics,
  exportAnalyticsReport,
  logFeatureUsage,
} from "@/api/analytics.api";
import { filterDataByTimePeriod } from "@/utils/dateFilter";
import { CustomersSection } from "./components/Analytics/CustomersSection";
import { BuildersSection } from "./components/Analytics/BuildersSection";
import { RequestsSection } from "./components/Analytics/RequestsSection";
import { SalesSection } from "./components/Analytics/SalesSection";
import { UserSection } from "./components/Analytics/UserSection";
import { ProductSection } from "./components/Analytics/ProductSection";
import { EngagementSection } from "./components/Analytics/EngagementSection";
import {
  handleExportResponse,
  getExportFilename,
} from "@/utils/exportUtils";

// Initialize Google Analytics
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

if (GA_MEASUREMENT_ID) {
  ReactGA.initialize(GA_MEASUREMENT_ID);
}

const TimePeriodSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-45">
      <SelectValue placeholder="Select period" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="All">To Date</SelectItem>

      <SelectItem value="1day">24h</SelectItem>
      <SelectItem value="1week">1w</SelectItem>
      <SelectItem value="1month">1m</SelectItem>
      <SelectItem value="1year">1y</SelectItem>
      <SelectItem value="5years">5y</SelectItem>
    </SelectContent>
  </Select>
);

export default function Analytics() {
  const axiosInstance = useAxiosWithAuth(import.meta.env.VITE_SERVER_URL);
  const [timePeriod, setTimePeriod] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "xlsx">(
    "csv",
  );
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState("summary");

  // cached data to avoid refetching when tabs unmount/mount
  const [cachedRequestsData, setCachedRequestsData] = useState<any | null>(
    null,
  );
  const [cachedAnalyticsData, setCachedAnalyticsData] = useState<any | null>(
    null,
  );

  useEffect(() => {
    // Track page view
    if (GA_MEASUREMENT_ID) {
      ReactGA.send({ hitType: "pageview", page: "/admin/analytics" });
    }
  }, []);

  // log feature usage whenever the tab changes
  useEffect(() => {
    if (activeTab) {
      logFeatureUsage(axiosInstance, `analytics_tab_${activeTab}`).catch(
        () => {},
      );
    }
  }, [activeTab]);

  // fetch requests & analytics once on mount
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const reqResp = await getSalesRequests(axiosInstance);
        setCachedRequestsData(reqResp.data?.data || reqResp.data);
      } catch (err) {
        console.error("Error fetching cached requests data", err);
      }

      try {
        const analyticsResp = await getSalesAnalytics(axiosInstance);
        setCachedAnalyticsData(analyticsResp.data?.data || analyticsResp.data);
      } catch (err) {
        console.error("Error fetching cached analytics data", err);
      }
    };
    fetchSalesData();
  }, [axiosInstance]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleExportReport = async (
    type: "builders" | "customers" | "sales",
    format: "csv" | "json" | "xlsx" = "csv",
  ) => {
    try {
      setExporting(true);
      const period = timePeriod !== "All" ? timePeriod : undefined;
      const data = await exportAnalyticsReport(
        axiosInstance,
        type,
        format,
        period,
      );

      // Use the export utility to handle the response
      handleExportResponse(data, type, format);

      setNotification({
        type: "success",
        message: `Successfully exported ${type} report as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      setNotification({
        type: "error",
        message: `Failed to export ${type} report: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Notification Banner */}
      {notification && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg mb-4 ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <p
            className={`text-sm font-medium ${
              notification.type === "success"
                ? "text-green-800"
                : "text-red-800"
            }`}
          >
            {notification.message}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex items-center gap-4">
          <TimePeriodSelector value={timePeriod} onChange={setTimePeriod} />
          <Select
            value={exportFormat}
            onValueChange={(value: any) => setExportFormat(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportReport("builders", exportFormat)}
              disabled={exporting}
              title="Export builders dashboard data"
            >
              <Download className="h-4 w-4 mr-2" />
              Builders
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportReport("customers", exportFormat)}
              disabled={exporting}
              title="Export customers dashboard data"
            >
              <Download className="h-4 w-4 mr-2" />
              Customers
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportReport("sales", exportFormat)}
              disabled={exporting}
              title="Export sales analytics data"
            >
              <Download className="h-4 w-4 mr-2" />
              Sales
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="builders">Builders</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          {/* <TabsTrigger value="web">Web</TabsTrigger> */}
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <SummarySection
            timePeriod={timePeriod}
            initialRequestsData={cachedRequestsData}
            initialAnalyticsData={cachedAnalyticsData}
          />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomersSection timePeriod={timePeriod} />
        </TabsContent>

        <TabsContent value="builders" className="space-y-6">
          <BuildersSection timePeriod={timePeriod} />
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <RequestsSection
            timePeriod={timePeriod}
            initialData={cachedRequestsData}
          />
        </TabsContent>
        {/* <TabsContent value="web" className="space-y-6">
          <WebSection timePeriod={timePeriod} />
        </TabsContent> */}

        <TabsContent value="sales" className="space-y-6">
          <SalesSection
            timePeriod={timePeriod}
            initialData={cachedAnalyticsData}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserSection timePeriod={timePeriod} />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductSection timePeriod={timePeriod} />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <EngagementSection timePeriod={timePeriod} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
