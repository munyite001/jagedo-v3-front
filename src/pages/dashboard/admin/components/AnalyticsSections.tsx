/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
//@ts-ignore

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { MapPin, Users, Briefcase, ShoppingCart, Globe, DollarSign } from 'lucide-react';
import useAxiosWithAuth from "@/utils/axiosInterceptor";
import { getSalesActivities, getSalesAnalytics, getSalesAnalyticsBuilders, getSalesAnalyticsCustomers, getSalesDataAnalytics, getSalesRequests } from '@/api/sales.api';
import { filterDataByTimePeriod } from '@/utils/dateFilter';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const TimePeriodSelector: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select period" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="24h">24h</SelectItem>
      <SelectItem value="1w">1w</SelectItem>
      <SelectItem value="1m">1m</SelectItem>
      <SelectItem value="1y">1y</SelectItem>
      <SelectItem value="5y">5y</SelectItem>
      <SelectItem value="todate">To Date</SelectItem>
    </SelectContent>
  </Select>
);

export const CustomersSection: React.FC<{ timePeriod: string }> = ({ timePeriod }) => {
  const axiosInstance = useAxiosWithAuth(import.meta.env.VITE_SERVER_URL);
  const [customersData, setCustomersData] = useState<any | null>(null);
  const [rawCustomersData, setRawCustomersData] = useState<any | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);
  const [errorAnalytics, setErrorAnalytics] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesAnalytics = async () => {
      try {
        setLoadingAnalytics(true);
        setErrorAnalytics(null);
        const response = await getSalesAnalyticsCustomers(axiosInstance, timePeriod);
        console.log(response);
        setRawCustomersData(response.data);
        setCustomersData(response.data);
      } catch (error: any) {
        setErrorAnalytics(error.message || 'Failed to load sales analytics');
        console.error('Error fetching sales analytics:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchSalesAnalytics();
  }, [timePeriod]);

  // Filter data when timePeriod changes
  useEffect(() => {
    if (rawCustomersData) {
      const filtered = filterDataByTimePeriod(rawCustomersData, timePeriod);
      setCustomersData(filtered);
    }
  }, [timePeriod, rawCustomersData]);

  // Transform customer type data from API response
  const customerTypeData = customersData?.customerTypeDistribution?.map((item: any) => ({
    name: item.name.charAt(0) + item.name.slice(1).toLowerCase(),
    value: Math.round(item.value), // Round to whole number for display
    count: item.count
  })) || [];

  // Transform region data from API response
  const regionData = customersData?.regionalDistribution ? 
    Object.entries(customersData.regionalDistribution).map(([name, value]) => ({
      name,
      value
    })) : [];

  // Transform customer stats from API response
  const customerStats = customersData?.activityStatistics ? [
    { item: 'No. of Customers with Draft Requests', count: customersData.activityStatistics.customersWithDraftRequests },
    { item: 'No. of Customers with Requests', count: customersData.activityStatistics.customersWithRequests },
    { item: 'No. of Customers with Active Jobs', count: customersData.activityStatistics.customersWithActiveJobs },
    { item: 'No. of Customers with Completed Jobs', count: customersData.activityStatistics.customersWithCompletedJobs },
    { item: 'No. of Customers with Reviewed', count: customersData.activityStatistics.customersWithReviewed }
  ] : [];

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loadingAnalytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading customer data...</div>
      </div>
    );
  }

  if (errorAnalytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-lg">Error: {errorAnalytics}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customers - All Customers</h2>
        <TimePeriodSelector value={timePeriod} onChange={() => { }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Customers Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Total Customers
            </CardTitle>
            <div className="text-3xl font-bold">{customersData?.totalCustomers || '0'}</div>
            <div className="text-green-600 text-sm">↑ {customersData?.percentageChange || '0'}%</div>
          </CardHeader>
        </Card>

        {/* Customer Type Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={customerTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerTypeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={regionData} 
                layout="vertical"
                margin={{ left: 30, right: 20 }}
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
                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Customer Activity Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Activity Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{stat.item}</span>
                <span className="text-2xl font-bold text-blue-600">{stat.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const BuildersSection: React.FC<{ timePeriod: string }> = ({ timePeriod }) => {
  const axiosInstance = useAxiosWithAuth(import.meta.env.VITE_SERVER_URL);
  const [buildersData, setBuildersData] = useState<any | null>(null);
  const [rawBuildersData, setRawBuildersData] = useState<any | null>(null);
  const [loadingBuilders, setLoadingBuilders] = useState<boolean>(true);
  const [errorAnalytics, setErrorAnalytics] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesAnalytics = async () => {
      try {
        setLoadingBuilders(true);
        setErrorAnalytics(null);
        const response = await getSalesAnalyticsBuilders(axiosInstance, timePeriod);
        console.log(response);
        setRawBuildersData(response.data);
        setBuildersData(response.data);
      } catch (error: any) {
        setErrorAnalytics(error.message || 'Failed to load sales analytics');
        console.error('Error fetching sales analytics:', error);
      } finally {
        setLoadingBuilders(false);
      }
    };

    fetchSalesAnalytics();
  }, [timePeriod]);

  // Filter data when timePeriod changes
  useEffect(() => {
    if (rawBuildersData) {
      const filtered = filterDataByTimePeriod(rawBuildersData, timePeriod);
      setBuildersData(filtered);
    }
  }, [timePeriod, rawBuildersData]);

  // Transform builder type data from API response
  const builderTypeData = buildersData?.buildingTypeDistribution ? 
    Object.entries(buildersData.buildingTypeDistribution).map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value: Math.round(value as number), // Round to whole number for display
      color: getBuilderTypeColor(name)
    })) : [];

  // Helper function to assign colors based on builder type
  function getBuilderTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'PROFESSIONAL': '#0088FE',
      'FUNDI': '#00C49F',
      'CONTRACTOR': '#FFBB28',
      'HARDWARE': '#FF8042'
    };
    return colors[type] || '#8884D8';
  }

  // Transform builder stats from API response
  const builderStats = buildersData?.activityStatistics ? [
    { item: 'No. of Builders with Draft Requests', count: buildersData.activityStatistics.buildersWithDraftRequests },
    { item: 'No. of Builders with Requests', count: buildersData.activityStatistics.buildersWithRequests },
    { item: 'No. of Builders with Active Jobs', count: buildersData.activityStatistics.buildersWithActiveJobs },
    { item: 'No. of Builders with Completed Jobs', count: buildersData.activityStatistics.buildersWithCompletedJobs },
    { item: 'No. of Builders with Reviewed', count: buildersData.activityStatistics.buildersWithReviewed }
  ] : [];

  if (loadingBuilders) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading builders data...</div>
      </div>
    );
  }

  if (errorAnalytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-lg">Error: {errorAnalytics}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Builders - All Builders</h2>
        <TimePeriodSelector value={timePeriod} onChange={() => { }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Builders Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Total Builders
            </CardTitle>
            <div className="text-3xl font-bold">{buildersData?.totalBuilders || '0'}</div>
            <div className="text-green-600 text-sm">↑ {buildersData?.percentageChange || '0'}%</div>
          </CardHeader>
        </Card>

        {/* Builder Type Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle>Builder Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={builderTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {builderTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Builder Activity Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Builder Activity Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {builderStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{stat.item}</span>
                <span className="text-2xl font-bold text-green-600">{stat.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Requests Section
export const RequestsSection: React.FC<{ timePeriod: string }> = ({ timePeriod }) => {
  const axiosInstance = useAxiosWithAuth(import.meta.env.VITE_SERVER_URL);
  const [adminActivityData, setActivityAdminData] = useState<any | null>(null);
  const [rawActivityData, setRawActivityData] = useState<any | null>(null);
  const [loadingBuilders, setLoadingBuilders] = useState<boolean>(true);
  const [errorAnalytics, setErrorAnalytics] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesAnalytics = async () => {
      try {
        setLoadingBuilders(true);
        setErrorAnalytics(null);
        const response = await getSalesRequests(axiosInstance, timePeriod);
        console.log(response);
        const data = response.data?.data || response.data;
        setRawActivityData(data);
        setActivityAdminData(data);
      } catch (error: any) {
        setErrorAnalytics(error.message || 'Failed to load sales analytics');
        console.error('Error fetching sales analytics:', error);
      } finally {
        setLoadingBuilders(false);
      }
    };

    fetchSalesAnalytics();
  }, [timePeriod]);

  // Filter data when timePeriod changes
  useEffect(() => {
    if (rawActivityData) {
      const filtered = filterDataByTimePeriod(rawActivityData, timePeriod);
      setActivityAdminData(filtered);
    }
  }, [timePeriod, rawActivityData]);

  // Transform request type data from API response
  const requestTypeData = adminActivityData ? [
    { name: 'Managed by Self', value: adminActivityData.managedBySelfPercentage },
    { name: 'Managed by JaGedo', value: adminActivityData.managedByJaGedoPercentage }
  ] : [];

  // Transform job order data from API response
  const jobOrderData = adminActivityData ? [
    { name: 'Jobs', value: adminActivityData.jobsPercentage },
    { name: 'Orders', value: adminActivityData.ordersPercentage }
  ] : [];

  // Transform request stats from API response
  const requestStats = adminActivityData ? [
    { status: 'Draft All', number: adminActivityData.draftAll },
    { status: 'New All', number: adminActivityData.newAll },
    { status: 'All under Quotation', number: adminActivityData.allUnderQuotation },
    { status: 'Active All', number: adminActivityData.activeAll },
    { status: 'Completed All', number: adminActivityData.completedAll },
    { status: 'Reviewed All', number: adminActivityData.reviewedAll }
  ] : [];

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loadingBuilders) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading requests data...</div>
      </div>
    );
  }

  if (errorAnalytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-lg">Error: {errorAnalytics}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics - All Requests</h2>
        <TimePeriodSelector value={timePeriod} onChange={() => { }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Requests Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Total Requests
            </CardTitle>
            <div className="text-3xl font-bold">{adminActivityData?.totalJobsAndOrders || '0'}</div>
            <div className="text-green-600 text-sm">
              ↑ {((adminActivityData?.totalJobsAndOrders || 0) > 0 ? Math.round((adminActivityData?.totalJobsAndOrders || 0) / 100) : 0)}%
            </div>
          </CardHeader>
        </Card>

        {/* Management Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle>Management Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={requestTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {requestTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Jobs vs Orders Card */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs vs Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
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
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Request Status Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle>Request Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={requestStats}
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
              <Bar dataKey="number" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// Web Section
export const WebSection: React.FC<{ timePeriod: string }> = ({ timePeriod }) => {
  const countryData = [
    { name: 'United States', value: 40 },
    { name: 'Canada', value: 20 },
    { name: 'Germany', value: 15 },
    { name: 'South Africa', value: 5 },
    { name: 'United Kingdom', value: 5 },
    { name: 'Australia', value: 5 }
  ];

  const deviceData = [
    { name: 'Mobile', value: 40 },
    { name: 'Desktop', value: 45 },
    { name: 'Tablet', value: 10 },
    { name: 'Other', value: 5 }
  ];

  const specificDevices = [
    { name: 'iPhones', value: 80 },
    { name: 'Samsung', value: 160 },
    { name: 'Oppo', value: 120 },
    { name: 'Nokia', value: 90 },
    { name: 'Tecno', value: 200 },
    { name: 'Infinix', value: 180 },
    { name: 'Huawei', value: 110 },
    { name: 'Xiaomi', value: 150 },
    { name: 'Realme', value: 130 },
    { name: 'Vivo', value: 140 }
  ];

  const trafficSources = ['Facebook', 'Instagram', 'Tiktok', 'X', 'Google', 'LinkedIn', 'YouTube'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics - Web</h2>
        <TimePeriodSelector value={timePeriod} onChange={() => { }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Visitors</CardTitle>
            <div className="text-2xl font-bold">3,000</div>
            <div className="text-green-600 text-sm">↑ 10%</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <div className="text-2xl font-bold">1,500</div>
            <div className="text-green-600 text-sm">↑ 20%</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <div className="text-2xl font-bold">23.20%</div>
            <div className="text-green-600 text-sm">↑ 10%</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bounce Rate</CardTitle>
            <div className="text-2xl font-bold">12.89%</div>
            <div className="text-red-600 text-sm">↑ 30%</div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{source}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.random() * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specific Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={specificDevices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Sales Section
// Sales Section
export const SalesSection: React.FC<{ timePeriod: string }> = ({ timePeriod }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  const axiosInstance = useAxiosWithAuth(import.meta.env.VITE_SERVER_URL);
  const [adminSalesData, setAdminSalesData] = useState<any | null>(null);
  const [rawSalesData, setRawSalesData] = useState<any | null>(null);
  const [loadingBuilders, setLoadingBuilders] = useState<boolean>(true);
  const [errorAnalytics, setErrorAnalytics] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesAnalytics = async () => {
      try {
        setLoadingBuilders(true);
        setErrorAnalytics(null);
        const response = await getSalesDataAnalytics(axiosInstance, timePeriod);
        console.log('Sales analytics response:', response);
        setRawSalesData(response.data);
        setAdminSalesData(response.data);
      } catch (error: any) {
        setErrorAnalytics(error.message || 'Failed to load sales analytics');
        console.error('Error fetching sales analytics:', error);
      } finally {
        setLoadingBuilders(false);
      }
    };

    fetchSalesAnalytics();
  }, [timePeriod]);

  // Filter data when timePeriod changes
  useEffect(() => {
    if (rawSalesData) {
      const filtered = filterDataByTimePeriod(rawSalesData, timePeriod);
      setAdminSalesData(filtered);
    }
  }, [timePeriod, rawSalesData]);

  // Fallback data in case API returns null
  const fallbackSalesData = [
    { year: '2021', jaGedo: 25, self: 15 },
    { year: '2022', jaGedo: 50, self: 30 },
    { year: '2023', jaGedo: 75, self: 45 },
    { year: '2024', jaGedo: 100, self: 60 },
    { year: '2025', jaGedo: 85, self: 70 }
  ];

  const fallbackBuilderRevenueData = [
    { name: 'Hardware', value: 52 },
    { name: 'Fundis', value: 26 },
    { name: 'Professionals', value: 12 },
    { name: 'Contractors', value: 11 }
  ];

  const fallbackManagementData = [
    { name: 'Managed by Self', value: 82 },
    { name: 'Managed by JaGedo', value: 18 }
  ];

  // Safe data extraction with null checks
  const summary = adminSalesData?.summary || {};
  // const salesPerformance = adminSalesData?.salesPerformance || fallbackSalesData;
  // const revenueByBuilderType = adminSalesData?.revenueByBuilderType || fallbackBuilderRevenueData;
  // const managementDistribution = adminSalesData?.managementDistribution || fallbackManagementData;
  const salesPerformance = adminSalesData?.salesPerformance;
  const revenueByBuilderType = adminSalesData?.revenueByBuilderType;
  const managementDistribution = adminSalesData?.managementDistribution;

  // Extract metric values with fallbacks
  // const totalTransactionValue = summary?.totalTransactionValue || { value: 'Ksh 330,000', growth: '↑ 50%' };
  // const totalRevenue = summary?.totalRevenue || { value: 'Ksh 1,300,000', growth: '↑ 20%' };
  // const commissionRate = summary?.commissionRate || { value: '23.20%', growth: '↑ 5.49%' };
  // const revenueGrowth = summary?.revenueGrowth || { value: '12.89%', growth: '↑ 30.22%' };
  // const arr = summary?.arr || { value: 'Ksh 600,000', growth: '↑ 5.21%' };
  // const arpu = summary?.arpu || { value: 'Ksh 18,000', growth: '↑ 11.27%' };
  // const retentionRate = summary?.retentionRate || { value: '63.20%', growth: '↑ 33.48%' };
  // const clv = summary?.clv || { value: 'Ksh 60,000', growth: '↑ 5.98%' };

  const totalTransactionValue = summary?.totalTransactionValue;
  const totalRevenue = summary?.totalRevenue;
  const commissionRate = summary?.commissionRate;
  const revenueGrowth = summary?.revenueGrowth;
  const arr = summary?.arr;
  const arpu = summary?.arpu;
  const retentionRate = summary?.retentionRate;
  const clv = summary?.clv;

  if (loadingBuilders) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Analytics - Sales</h2>
          <TimePeriodSelector value={timePeriod} onChange={() => { }} />
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading sales analytics...</div>
        </div>
      </div>
    );
  }

  if (errorAnalytics) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Analytics - Sales</h2>
          <TimePeriodSelector value={timePeriod} onChange={() => { }} />
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 text-lg">Error: {errorAnalytics}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics - Sales</h2>
        <TimePeriodSelector value={timePeriod} onChange={() => { }} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Transaction Value</CardTitle>
            <div className="text-2xl font-bold">{totalTransactionValue.value}</div>
            <div className="text-green-600 text-sm">{totalTransactionValue.growth}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <div className="text-2xl font-bold">{totalRevenue.value}</div>
            <div className="text-green-600 text-sm">{totalRevenue.growth}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Commission Rate</CardTitle>
            <div className="text-2xl font-bold">{commissionRate.value}</div>
            <div className="text-green-600 text-sm">{commissionRate.growth}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <div className="text-2xl font-bold">{revenueGrowth.value}</div>
            <div className="text-green-600 text-sm">{revenueGrowth.growth}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Sales Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={salesPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="jaGedo" stroke="#8884d8" name="Managed by JaGedo" />
              <Line type="monotone" dataKey="self" stroke="#82ca9d" name="Managed by Self" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Builder Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByBuilderType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueByBuilderType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Management Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={managementDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {managementDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index + 2]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>ARR</CardTitle>
            <div className="text-2xl font-bold">{arr.value}</div>
            <div className="text-green-600 text-sm">{arr.growth}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ARPU</CardTitle>
            <div className="text-2xl font-bold">{arpu.value}</div>
            <div className="text-green-600 text-sm">{arpu.growth}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Retention Rate</CardTitle>
            <div className="text-2xl font-bold">{retentionRate.value}</div>
            <div className="text-green-600 text-sm">{retentionRate.growth}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>CLV</CardTitle>
            <div className="text-2xl font-bold">{clv.value}</div>
            <div className="text-green-600 text-sm">{clv.growth}</div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};