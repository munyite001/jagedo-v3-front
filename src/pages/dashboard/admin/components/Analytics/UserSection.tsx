import React, { useState, useEffect } from "react";
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
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  UserPlus,
} from "lucide-react";
import useAxiosWithAuth from "@/utils/axiosInterceptor";
import { getActiveInactiveUsers, getProfileCompletionRates, getRoleBasedActivity, getUserAcquisitionSources, getUserGrowthTrends } from "@/api/analytics.api";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];
// user analytics tab
export const UserSection: React.FC<{ timePeriod: string }> = ({ timePeriod }) => {
  const axiosInstance = useAxiosWithAuth(import.meta.env.VITE_SERVER_URL);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [acquisitionData, setAcquisitionData] = useState<any[]>([]);
  const [activeInactive, setActiveInactive] = useState<{ active: number; inactive: number }>({ active: 0, inactive: 0 });
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [roleActivity, setRoleActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [regionFilter, setRegionFilter] = useState<string>("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const period = timePeriod !== 'All' ? timePeriod : undefined;
        const filters = {
          role: roleFilter && roleFilter !== 'all' ? roleFilter : undefined,
          region: regionFilter && regionFilter !== 'all' ? regionFilter : undefined
        };

        const [g, a, ai, pc, ra] = await Promise.all([
          getUserGrowthTrends(axiosInstance, period, filters),
          getUserAcquisitionSources(axiosInstance, period, filters),
          getActiveInactiveUsers(axiosInstance, period, filters),
          getProfileCompletionRates(axiosInstance, period, filters),
          getRoleBasedActivity(axiosInstance, period, filters)
        ]);
        setGrowthData(g.data.trends || []);
        setAcquisitionData(a.data.sources || []);
        setActiveInactive({ active: ai.data.active, inactive: ai.data.inactive });
        setProfileCompletion(pc.data.completionRate);
        setRoleActivity(ra.data.roles || []);
      } catch (err: any) {
        console.error('Error loading user analytics', err);
        setError(err.message || 'Failed to load user analytics');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [timePeriod, roleFilter, regionFilter, axiosInstance]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading user analytics...</div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">User Analytics</h2>
        <div className="flex gap-3 ml-auto">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
              <SelectItem value="PROFESSIONAL">Professional</SelectItem>
              <SelectItem value="CONTRACTOR">Contractor</SelectItem>
              <SelectItem value="HARDWARE">Hardware</SelectItem>
              <SelectItem value="FUNDI">Fundi</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="Kenya">Kenya</SelectItem>
              <SelectItem value="Uganda">Uganda</SelectItem>
              <SelectItem value="Tanzania">Tanzania</SelectItem>
              <SelectItem value="Rwanda">Rwanda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* growth chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Number of registrations over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={growthData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* acquisition pie */}
      <Card>
        <CardHeader>
          <CardTitle>Acquisition Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={acquisitionData} dataKey="count" nameKey="source" outerRadius={80} fill="#8884d8">
                {acquisitionData.map((entry, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* active/inactive bar */}
      <Card>
        <CardHeader>
          <CardTitle>Active vs Inactive Users</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[activeInactive]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="active" fill="#10b981" />
              <Bar dataKey="inactive" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* profile completion metric */}
      <MetricCard
        title="Profile Completion (%)"
        value={`${profileCompletion}%`}
        icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
      />

      {/* role activity pie */}
      <Card>
        <CardHeader>
          <CardTitle>Role Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={roleActivity} dataKey="activityCount" nameKey="role" outerRadius={80}>
                {roleActivity.map((entry, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
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