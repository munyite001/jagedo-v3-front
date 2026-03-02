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
import { Button } from "@/components/ui/button";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Briefcase,
  UserPlus,
  Download,
  DollarSign,
  Activity,
  UserCheck,
  Star,
} from "lucide-react";
import { filterDataByTimePeriod } from "@/utils/dateFilter";
import useAxiosWithAuth from "@/utils/axiosInterceptor";
import { getSalesAnalytics } from "@/api/analytics.api";

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
const TimePeriodSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select period" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="1day">24h</SelectItem>
      <SelectItem value="1week">1w</SelectItem>
      <SelectItem value="1month">1m</SelectItem>
      <SelectItem value="1year">1y</SelectItem>
      <SelectItem value="5years">5y</SelectItem>
      <SelectItem value="All">To Date</SelectItem>
    </SelectContent>
  </Select>
);
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = "neutral",
  icon,
  subtitle,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <p
          className={`text-xs flex items-center ${
            trend === "up"
              ? "text-green-600"
              : trend === "down"
                ? "text-red-600"
                : "text-gray-600"
          }`}
        >
          {trend === "up" && <TrendingUp className="h-4 w-4 mr-1" />}
          {trend === "down" && <TrendingDown className="h-4 w-4 mr-1" />}
          {change}
        </p>
      )}
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </CardContent>
  </Card>
);

interface RequestsSectionProps {
  timePeriod: string;
  initialData: any | null;
}

export const RequestsSection: React.FC<RequestsSectionProps> = ({
  timePeriod,
  initialData,
}) => {
  const [requestsData, setRequestsData] = useState<any | null>(initialData);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  // Update when parent provides or updates data
  useEffect(() => {
    if (initialData) {
      setRequestsData(initialData);
      setLoading(false);
    }
  }, [initialData]);

  // filter client-side when timePeriod changes
  useEffect(() => {
    if (!initialData) return;
    const period = timePeriod !== "All" ? timePeriod : undefined;
    const filtered = filterDataByTimePeriod(initialData, period);
    setRequestsData(filtered);
  }, [timePeriod, initialData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading requests data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );
  }

  // Transform data for charts
  const managementData = requestsData
    ? [
        {
          name: "Managed by Self",
          value: requestsData.managedBySelfPercentage || 0,
        },
        {
          name: "Managed by JaGedo",
          value: requestsData.managedByJaGedoPercentage || 0,
        },
      ]
    : [];

  const jobOrderData = requestsData
    ? [
        { name: "Jobs", value: requestsData.jobsPercentage || 0 },
        { name: "Orders", value: requestsData.ordersPercentage || 0 },
      ]
    : [];

  const statusData = requestsData
    ? [
        { status: "Draft", count: requestsData.draftAll || 0 },
        { status: "New", count: requestsData.newAll || 0 },
        {
          status: "Under Quotation",
          count: requestsData.allUnderQuotation || 0,
        },
        { status: "Active", count: requestsData.activeAll || 0 },
        { status: "Completed", count: requestsData.completedAll || 0 },
        { status: "Reviewed", count: requestsData.reviewedAll || 0 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Requests Analytics</h2>
        <TimePeriodSelector value={timePeriod} onChange={() => {}} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Requests"
          value={requestsData?.totalJobsAndOrders || 0}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          subtitle="Jobs + Orders"
        />
        <MetricCard
          title="Total Jobs"
          value={requestsData?.totalJobs || 0}
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Total Orders"
          value={requestsData?.totalOrders || 0}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Active Requests"
          value={requestsData?.activeAll || 0}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Management Distribution</CardTitle>
            <CardDescription>
              Jobs managed by JaGedo vs Self-managed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={managementData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {managementData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jobs vs Orders</CardTitle>
            <CardDescription>Distribution of request types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={jobOrderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {jobOrderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index + 2]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Request Status Breakdown</CardTitle>
          <CardDescription>All requests by current status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={statusData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="status"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
