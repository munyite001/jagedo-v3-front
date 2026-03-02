import React, { useState, useEffect } from "react";
import {
    getAuthLogs,
    getOtpLogs,
    getAuditLogs,
    LogFilterOptions
} from "@/api/systemlogs.api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    RefreshCw,
    ShieldCheck,
    Key,
    History,
    AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

const SystemLogs = () => {
    const [activeTab, setActiveTab] = useState("auth");
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 0
    });
    const [filters, setFilters] = useState<LogFilterOptions>({
        status: "",
        identifier: "",
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let response;
            const options = {
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            };

            if (activeTab === "auth") {
                response = await getAuthLogs(options);
            } else if (activeTab === "otp") {
                response = await getOtpLogs(options);
            } else if (activeTab === "audit") {
                response = await getAuditLogs(options);
            }

            if (response?.success) {
                setLogs(response.data.logs);
                setPagination({
                    page: response.data.page,
                    limit: response.data.limit,
                    totalPages: response.data.totalPages,
                    totalResults: response.data.totalResults
                });
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [activeTab, pagination.page, filters.status]);

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchLogs();
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case "SUCCESS":
                return <Badge className="bg-green-100 text-green-800 border-green-200">Success</Badge>;
            case "FAILED":
                return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
                    <p className="text-gray-500">Monitor system activities, authentication events, and audit trails.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchLogs}
                    disabled={loading}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Tabs
                defaultValue="auth"
                className="w-full"
                onValueChange={(val) => {
                    setActiveTab(val);
                    setPagination(prev => ({ ...prev, page: 1 }));
                }}
            >
                <TabsList className="bg-white border p-1 h-12 shadow-sm rounded-xl mb-6">
                    <TabsTrigger value="auth" className="flex items-center gap-2 px-6 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                        <ShieldCheck className="w-4 h-4" />
                        Auth Logs
                    </TabsTrigger>
                    <TabsTrigger value="otp" className="flex items-center gap-2 px-6 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                        <Key className="w-4 h-4" />
                        OTP Logs
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="flex items-center gap-2 px-6 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                        <History className="w-4 h-4" />
                        Audit Trails
                    </TabsTrigger>
                </TabsList>

                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50/30 flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search identifier (email/phone)..."
                                className="pl-10 bg-white"
                                value={filters.identifier}
                                onChange={(e) => setFilters(prev => ({ ...prev, identifier: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Select
                            value={filters.status}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                        >
                            <SelectTrigger className="w-[180px] bg-white">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="SUCCESS">Success</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSearch} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 font-medium">
                            Filter
                        </Button>
                    </div>

                    <TabsContent value="auth" className="m-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-semibold">Time</TableHead>
                                        <TableHead className="font-semibold">Identifier</TableHead>
                                        <TableHead className="font-semibold">Type</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">IP Address</TableHead>
                                        <TableHead className="font-semibold">Reason/Device</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-10">Loading auth logs...</TableCell></TableRow>
                                    ) : logs.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-10">No authentication logs found.</TableCell></TableRow>
                                    ) : logs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="whitespace-nowrap font-medium text-gray-600">
                                                {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                                            </TableCell>
                                            <TableCell>{log.identifier}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{log.attemptType?.toLowerCase()}</Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(log.status)}</TableCell>
                                            <TableCell className="text-gray-500 font-mono text-xs">{log.ipAddress}</TableCell>
                                            <TableCell>
                                                {log.status === "FAILED" ? (
                                                    <span className="text-red-500 flex items-center gap-1 text-xs">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        {log.failureReason}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs truncate max-w-[200px] block" title={log.userAgent}>
                                                        {log.userAgent}
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="otp" className="m-0">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Identifier</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>IP Address</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-10">Loading...</TableCell></TableRow>
                                ) : logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="whitespace-nowrap font-medium text-gray-600">
                                            {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                                        </TableCell>
                                        <TableCell>{log.identifier}</TableCell>
                                        <TableCell><Badge variant="outline">{log.otpMethod}</Badge></TableCell>
                                        <TableCell><span className="font-medium text-xs">{log.action}</span></TableCell>
                                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                                        <TableCell className="text-gray-500 text-xs font-mono">{log.ipAddress}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    <TabsContent value="audit" className="m-0">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Admin</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Entity ID</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-10">Loading...</TableCell></TableRow>
                                ) : logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="whitespace-nowrap font-medium text-gray-600">
                                            {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{log.admin?.firstName} {log.admin?.lastName}</span>
                                                <span className="text-xs text-gray-400">{log.admin?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="capitalize">{log.entityType}</TableCell>
                                        <TableCell className="text-xs font-mono">{log.entityId}</TableCell>
                                        <TableCell>
                                            <div className="max-w-[300px] overflow-hidden">
                                                <pre className="text-[10px] bg-gray-50 p-2 rounded border overflow-x-auto">
                                                    {JSON.stringify(log.newValue, null, 2)}
                                                </pre>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    <div className="p-4 border-t flex items-center justify-between bg-gray-50/30">
                        <div className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900">{logs.length}</span> of <span className="text-gray-900">{pagination.totalResults}</span> records
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                disabled={pagination.page === 1 || loading}
                                className="bg-white rounded-lg px-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                                disabled={pagination.page === pagination.totalPages || loading}
                                className="bg-white rounded-lg px-4"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Tabs>
        </div>
    );
};

export default SystemLogs;
