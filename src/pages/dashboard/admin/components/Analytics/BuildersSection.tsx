/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
//@ts-ignore

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  Legend 
} from 'recharts';
import { 
  MapPin, 
  Users, 
  Briefcase, 
  ShoppingCart, 
  Globe, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Building,
  UserCheck,
  UserPlus,
  Star,
  Clock
} from 'lucide-react';
import useAxiosWithAuth from "@/utils/axiosInterceptor";
import { 
  getBuildersDashboard, 
  getCustomersDashboard, 
  getSalesAnalytics,
  getRevenueByBuilderType,
  getSalesPerformance,
  getManagementDistribution,
  getSalesRequests
} from '@/api/analytics.api';
import { getSales,getSalesActivities,
  // getSalesRequests
 } from '@/api/sales.api';
import { filterDataByTimePeriod } from '@/utils/dateFilter';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend = 'neutral', icon, subtitle }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <p className={`text-xs flex items-center ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {trend === 'up' && <TrendingUp className="h-4 w-4 mr-1" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4 mr-1" />}
          {change}
        </p>
      )}
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </CardContent>
  </Card>
);

const TimePeriodSelector: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => (
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
export const BuildersSection: React.FC<{ timePeriod: string }> = ({ timePeriod }) => {
  const axiosInstance = useAxiosWithAuth(import.meta.env.VITE_SERVER_URL);
  const [buildersData, setBuildersData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Record<string, any>>({});

  useEffect(() => {
    const fetchBuildersData = async () => {
      const periodKey = timePeriod || 'All';
      if (cacheRef.current[periodKey]) {
        setBuildersData(cacheRef.current[periodKey]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const period = timePeriod !== 'All' ? timePeriod : undefined;
        const response = await getBuildersDashboard(axiosInstance, period);
        const data = response.data;
        cacheRef.current[periodKey] = data;
        setBuildersData(data);
      } catch (error: any) {
        setError(error.message || 'Failed to load builders data');
        console.error('Error fetching builders data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildersData();
  }, [timePeriod, axiosInstance]);

  const getBuilderTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'PROFESSIONAL': '#0088FE',
      'FUNDI': '#00C49F',
      'CONTRACTOR': '#FFBB28',
      'HARDWARE': '#FF8042'
    };
    return colors[type] || '#8884D8';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading builders data...</div>
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

  // Transform builder type data
  const builderTypeData = buildersData?.buildingTypeDistribution ? 
    Object.entries(buildersData.buildingTypeDistribution).map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value: value as number,
      color: getBuilderTypeColor(name)
    })) : [];

  // Transform activity statistics
  const activityStats = buildersData?.activityStatistics ? [
    { 
      label: 'Builders with Draft Requests', 
      value: buildersData.activityStatistics.buildersWithDraftRequests,
      icon: <Clock className="h-4 w-4 text-orange-500" />
    },
    { 
      label: 'Builders with Requests', 
      value: buildersData.activityStatistics.buildersWithRequests,
      icon: <ShoppingCart className="h-4 w-4 text-blue-500" />
    },
    { 
      label: 'Builders with Active Jobs', 
      value: buildersData.activityStatistics.buildersWithActiveJobs,
      icon: <Activity className="h-4 w-4 text-green-500" />
    },
    { 
      label: 'Builders with Completed Jobs', 
      value: buildersData.activityStatistics.buildersWithCompletedJobs,
      icon: <Star className="h-4 w-4 text-purple-500" />
    },
    { 
      label: 'Builders with Reviewed', 
      value: buildersData.activityStatistics.buildersWithReviewed,
      icon: <UserCheck className="h-4 w-4 text-indigo-500" />
    }
  ] : [];

  const trend = buildersData?.percentageChange > 0 ? 'up' : 'down';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Builders Analytics</h2>
        <TimePeriodSelector value={timePeriod} onChange={() => {}} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricCard
          title="Total Builders"
          value={buildersData?.totalBuilders || 0}
          change={`${trend === 'up' ? '↑' : '↓'} ${Math.abs(buildersData?.percentageChange || 0)}%`}
          trend={trend}
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
          subtitle="Total registered builders"
        />

        <Card>
          <CardHeader>
            <CardTitle>Builder Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={builderTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {builderTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Builder Type Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Builder Type Distribution</CardTitle>
          <CardDescription>Breakdown by builder category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={builderTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6">
                {builderTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Builder Activity Statistics</CardTitle>
          <CardDescription>Breakdown of builder engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activityStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {stat.icon}
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <span className="text-xl font-bold text-green-600">{stat.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};