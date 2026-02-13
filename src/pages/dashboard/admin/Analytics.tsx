import React, { useState, useEffect } from "react";
import ReactGA from "react-ga4";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Briefcase,
} from "lucide-react";
import {
  CustomersSection,
  BuildersSection,
  RequestsSection,
  SalesSection,
} from "./components/AnalyticsSections";
import useAxiosWithAuth from "@/utils/axiosInterceptor";
import { getSalesRequests, getSalesAnalytics } from "@/api/sales.api";
import { filterDataByTimePeriod } from "@/utils/dateFilter";

// Initialize Google Analytics
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

if (GA_MEASUREMENT_ID) {
  ReactGA.initialize(GA_MEASUREMENT_ID);
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p
        className={`text-xs flex items-center ${trend === "up" ? "text-green-600" : "text-red-600"
          }`}
      >
        {trend === "up" ? (
          <TrendingUp className="h-4 w-4 mr-1" />
        ) : (
          <TrendingDown className="h-4 w-4 mr-1" />
        )}
        {change}
      </p>
    </CardContent>
  </Card>
);

const TimePeriodSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-[180px]">
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

// Summary Section
const SummarySection: React.FC<{ timePeriod: string }> = ({ timePeriod }) => {
  const axiosInstance = useAxiosWithAuth(import.meta.env.VITE_SERVER_URL);
  const [salesActivities, setSalesActivities] = useState<any | null>(null);
  const [requestsData, setRequestsData] = useState<any | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [rawRequestsData, setRawRequestsData] = useState<any | null>(null);
  const [rawAnalyticsData, setRawAnalyticsData] = useState<any | null>(null);

  // Loading states for each API call
  const [loadingRequests, setLoadingRequests] = useState<boolean>(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);

  // Error states for each API call
  const [errorRequests, setErrorRequests] = useState<string | null>(null);
  const [errorAnalytics, setErrorAnalytics] = useState<string | null>(null);

  // const [timePeriod, setTimePeriod] = useState("");


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch requests data (has job status info)
        setLoadingRequests(true);
        setErrorRequests(null);
        const requestsResponse = await getSalesRequests(axiosInstance, timePeriod);
        const requestsAnalytics =
          requestsResponse.data?.data || requestsResponse.data;
        setRawRequestsData(requestsAnalytics);
        setRequestsData(requestsAnalytics);

        // Fetch analytics data (has user/customer/builder info)
        setLoadingAnalytics(true);
        setErrorAnalytics(null);
        const analyticsResponse = await getSalesAnalytics(axiosInstance, timePeriod);
        const analytics =
          analyticsResponse.data?.data || analyticsResponse.data;
        setRawAnalyticsData(analytics);
        setAnalyticsData(analytics);
      } catch (error: any) {
        setErrorRequests(error.message || "Failed to load data");
        setErrorAnalytics(error.message || "Failed to load data");
      } finally {
        setLoadingRequests(false);
        setLoadingAnalytics(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter data when timePeriod changes
  useEffect(() => {
    if (!rawRequestsData && !rawAnalyticsData) return;

    // Filter requests data
    if (rawRequestsData) {
      const filtered = filterDataByTimePeriod(rawRequestsData, timePeriod);
      setRequestsData(filtered);
    }

    // Filter analytics data
    if (rawAnalyticsData) {
      const filtered = filterDataByTimePeriod(rawAnalyticsData, timePeriod);
      setAnalyticsData(filtered);
    }
  }, [timePeriod, rawRequestsData, rawAnalyticsData]);

  // Transform job status data for visualization
  const jobStatusData = [
    { name: "Active", value: requestsData?.activeAll || 0, color: "#10b981" },
    { name: "New", value: requestsData?.newAll || 0, color: "#3b82f6" },
    { name: "Draft", value: requestsData?.draftAll || 0, color: "#f59e0b" },
    {
      name: "Completed",
      value: requestsData?.completedAll || 0,
      color: "#8b5cf6",
    },
    {
      name: "Under Quotation",
      value: requestsData?.allUnderQuotation || 0,
      color: "#ef4444",
    },
    {
      name: "Reviewed",
      value: requestsData?.reviewedAll || 0,
      color: "#06b6d4",
    },
  ].filter((item) => item.value > 0);

  // Job management distribution
  const managementData = [
    {
      name: "Managed by JaGedo",
      value: requestsData?.managedByJaGedo || 0,
      percentage: requestsData?.managedByJaGedoPercentage || 0,
    },
    {
      name: "Managed by Self",
      value: requestsData?.managedBySelf || 0,
      percentage: requestsData?.managedBySelfPercentage || 0,
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Users"
          value={analyticsData?.totalUsers || "0"}
          change="10%"
          trend="up"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Total Customers"
          value={analyticsData?.totalCustomers || "0"}
          change="20%"
          trend="up"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Total Builders"
          value={analyticsData?.totalBuilders || "0"}
          change="10%"
          trend="up"
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Requests"
          value={requestsData?.totalRequests || "0"}
          change="30%"
          trend="up"
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Total Jobs"
          value={requestsData?.totalJobs || "0"}
          change="5%"
          trend="up"
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Total Orders"
          value={requestsData?.totalOrders || "0"}
          change="10%"
          trend="up"
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Job Management</CardTitle>
            <CardDescription>
              Jobs managed by JaGedo vs Self-managed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={managementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overview Statistics</CardTitle>
            <CardDescription>Key metrics summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>Total Jobs & Orders</span>
              <span className="font-bold text-lg">
                {(requestsData?.totalJobs || 0) +
                  (requestsData?.totalOrders || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>Total Jobs</span>
              <span className="font-bold text-lg">
                {requestsData?.totalJobs || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>Total Orders</span>
              <span className="font-bold text-lg">
                {requestsData?.totalOrders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span>Jobs %</span>
              <span className="font-bold text-lg text-blue-600">
                {requestsData?.jobsPercentage || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>Orders %</span>
              <span className="font-bold text-lg">
                {requestsData?.ordersPercentage || 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Job Status Distribution</CardTitle>
          <CardDescription>Breakdown of all jobs by status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={jobStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {jobStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};


export default function Analytics() {
  const [timePeriod, setTimePeriod] = useState("");
  console.log(timePeriod)

  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    // Track page view
    if (GA_MEASUREMENT_ID) {
      ReactGA.send({ hitType: "pageview", page: "/admin/analytics" });
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <TimePeriodSelector value={timePeriod} onChange={setTimePeriod} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="builders">Builders</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          {/* <TabsTrigger value="web">Web</TabsTrigger> */}
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <SummarySection timePeriod={timePeriod} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomersSection timePeriod={timePeriod} />
        </TabsContent>

        <TabsContent value="builders" className="space-y-6">
          <BuildersSection timePeriod={timePeriod} />
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <RequestsSection timePeriod={timePeriod} />
        </TabsContent>

        {/* <TabsContent value="web" className="space-y-6">
          <WebSection timePeriod={timePeriod} />
        </TabsContent> */}

        <TabsContent value="sales" className="space-y-6">
          <SalesSection timePeriod={timePeriod} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
