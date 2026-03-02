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
  UserCheck,
  Star,
} from "lucide-react";


const COLORS = [
  "#0284c7",  // bright blue
  "#10b981",  // emerald green
  "#06b6d4",  // cyan
  "#059669",  // darker green
  "#3b82f6",  // blue
  "#34d399",  // light green
  "#06b6d4",  // cyan-light
  "#047857",  // deep green
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
  <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-transparent hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-blue-900">{title}</CardTitle>
      <div className="text-blue-500">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-blue-700">{value}</div>
      {change && (
        <p
          className={`text-xs flex items-center font-semibold ${
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

export const WebSection: React.FC<{ timePeriod: string }> = ({ timePeriod }) => {
  // This would typically come from an analytics API like Google Analytics
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

  const trafficSources = [
    { name: 'Facebook', value: 25 },
    { name: 'Instagram', value: 20 },
    { name: 'Tiktok', value: 15 },
    { name: 'X', value: 10 },
    { name: 'Google', value: 18 },
    { name: 'LinkedIn', value: 7 },
    { name: 'YouTube', value: 5 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b-2 border-blue-200">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Web Analytics</h2>
        <TimePeriodSelector value={timePeriod} onChange={() => {}} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Visitors"
          value="3,000"
          change="↑ 10%"
          trend="up"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Active Users"
          value="1,500"
          change="↑ 20%"
          trend="up"
          icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Conversion Rate"
          value="23.20%"
          change="↑ 10%"
          trend="up"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Bounce Rate"
          value="12.89%"
          change="↑ 30%"
          trend="down"
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-blue-500 shadow-md">
          <CardHeader>
            <CardTitle className="text-blue-700">Top Countries</CardTitle>
            <CardDescription>User distribution by location</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "#f0f9ff", border: "1px solid #0284c7" }} />
                <Bar dataKey="value" fill="#0284c7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500 shadow-md">
          <CardHeader>
            <CardTitle className="text-green-700">Device Usage</CardTitle>
            <CardDescription>Users by device type</CardDescription>
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

      <Card className="border-t-4 border-t-blue-500 shadow-md">
        <CardHeader>
          <CardTitle className="text-blue-700">Traffic Sources</CardTitle>
          <CardDescription>Where your users are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trafficSources.map((source, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{source.name}</span>
                  <span className="text-sm font-semibold text-blue-600">{source.value}%</span>
                </div>
                <div className="w-full bg-gradient-to-r from-blue-100 to-green-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      index % 2 === 0 
                        ? "bg-gradient-to-r from-blue-500 to-blue-600" 
                        : "bg-gradient-to-r from-green-500 to-green-600"
                    }`}
                    style={{ width: `${source.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};