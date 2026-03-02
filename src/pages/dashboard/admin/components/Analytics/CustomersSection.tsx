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
 
} from 'recharts';
import { 
  MapPin, 
  Users, 
  ShoppingCart, 

  TrendingUp,
  TrendingDown,
  Activity,
  Building,
  UserCheck,
  Star,
  Clock
} from 'lucide-react';
import useAxiosWithAuth from "@/utils/axiosInterceptor";
import { 
  getCustomersDashboard, 
 
} from '@/api/analytics.api';


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

export const CustomersSection: React.FC<{ timePeriod: string }> = ({ timePeriod }) => {
  const axiosInstance = useAxiosWithAuth(import.meta.env.VITE_SERVER_URL);
  const [customersData, setCustomersData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Record<string, any>>({});

  useEffect(() => {
    const fetchCustomersData = async () => {
      const periodKey = timePeriod || 'All';
      if (cacheRef.current[periodKey]) {
        setCustomersData(cacheRef.current[periodKey]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const period = timePeriod !== 'All' ? timePeriod : undefined;
        const response = await getCustomersDashboard(axiosInstance, period);
        const data = response.data;
        cacheRef.current[periodKey] = data;
        setCustomersData(data);
      } catch (error: any) {
        setError(error.message || 'Failed to load customers data');
        console.error('Error fetching customers data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomersData();
  }, [timePeriod, axiosInstance]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading customer data...</div>
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

  // Transform customer type data
  const customerTypeData = customersData?.customerTypeDistribution?.map((item: any) => ({
    name: item.type === 'INDIVIDUAL' ? 'Individual' : 'Organization',
    value: item.percentage,
    count: item.count
  })) || [];

  // Transform region data
  const regionData = customersData?.regionalDistribution ? 
    Object.entries(customersData.regionalDistribution)
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort((a, b) => (b.value as number) - (a.value as number))
      .slice(0, 10) : [];

  // Transform activity statistics
  const activityStats = customersData?.activityStatistics ? [
    { 
      label: 'Customers with Draft Requests', 
      value: customersData.activityStatistics.customersWithDraftRequests,
      icon: <Clock className="h-4 w-4 text-orange-500" />,
      color: 'text-orange-600'
    },
    { 
      label: 'Customers with Requests', 
      value: customersData.activityStatistics.customersWithRequests,
      icon: <ShoppingCart className="h-4 w-4 text-blue-500" />,
      color: 'text-blue-600'
    },
    { 
      label: 'Customers with Active Jobs', 
      value: customersData.activityStatistics.customersWithActiveJobs,
      icon: <Activity className="h-4 w-4 text-green-500" />,
      color: 'text-green-600'
    },
    { 
      label: 'Customers with Completed Jobs', 
      value: customersData.activityStatistics.customersWithCompletedJobs,
      icon: <Star className="h-4 w-4 text-purple-500" />,
      color: 'text-purple-600'
    },
    { 
      label: 'Customers with Reviewed', 
      value: customersData.activityStatistics.customersWithReviewed,
      icon: <UserCheck className="h-4 w-4 text-indigo-500" />,
      color: 'text-indigo-600'
    }
  ] : [];

  const trend = customersData?.percentageChange > 0 ? 'up' : 'down';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customers Analytics</h2>
        <TimePeriodSelector value={timePeriod} onChange={() => {}} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Customers"
          value={customersData?.totalCustomers || 0}
          change={`${trend === 'up' ? '↑' : '↓'} ${Math.abs(customersData?.percentageChange || 0)}%`}
          trend={trend}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          subtitle="Total registered customers"
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Building className="h-4 w-4" />
              Customer Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {customerTypeData.map((item: any, index: number) => (
                <div key={item.name} className="flex justify-between items-center">
                  <span className="text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{item.count}</span>
                    <span className="text-sm text-muted-foreground">({item.value.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              Top Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {regionData.slice(0, 5).map((item: any) => (
                <div key={item.name} className="flex justify-between items-center">
                  <span className="text-sm">{item.name}</span>
                  <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Distribution Chart */}
      {regionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
            <CardDescription>Customers by country/region</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={regionData} 
                layout="vertical"
                margin={{ left: 80, right: 20, top: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Activity Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Activity Statistics</CardTitle>
          <CardDescription>Breakdown of customer engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activityStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {stat.icon}
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};