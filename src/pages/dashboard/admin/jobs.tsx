/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
//@ts-nocheck
import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import useAxiosWithAuth from "@/utils/axiosInterceptor";
import { useNavigate } from "react-router-dom";
import { getAdminJobRequests } from "@/api/jobRequests.api";
import { counties } from "@/pages/data/counties";

function Jobs() {
    const axiosInstance = useAxiosWithAuth(import.meta.env.VITE_SERVER_URL);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("New");
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [jobRequests, setJobRequests] = useState([]);
    const [filterValues, setFilterValues] = useState({
        date: "",
        category: "",
        managedBy: "",
        county: ""
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleNavigateToJobPage = (item) => {
        if (item.status.toLowerCase() === "active") {
            if (
                item?.jobType?.toLowerCase() === "professional" ||
                item?.jobType?.toLowerCase() === "contractor"
            ) {
                navigate(`/dashboard/admin/professional/active/${item.id}`);
            } else {
                navigate(`/dashboard/admin/jobs/active/${item.id}`);
            }
        } else if (
            (item.status.toLowerCase() === "bid" &&
                item?.jobType?.toLowerCase() === "professional") ||
            (item?.jobType?.toLowerCase() === "contractor" &&
                item.status.toLowerCase() === "bid")
        ) {
            navigate(`/dashboard/admin/jobs/bid/${item.id}`);
        } else if (item.status.toLowerCase() === "complete" || item.status.toLowerCase() === "past") {
            if (
                item?.jobType?.toLowerCase() === "professional" ||
                item?.jobType?.toLowerCase() === "contractor"
            ) {
                navigate(`/dashboard/admin/jobs/bid/complete/${item.id}`);
            } else {
                navigate(`/dashboard/admin/jobs/fundi/complete/${item.id}`);
            }
        } else {
            navigate(`/dashboard/admin/jobs/${item.id}`);
        }
    };

    const statusConfig = {
        New: {
            count: jobRequests.filter(
                (item) => item.status.toLowerCase() === "new"
            ).length
        },
        Draft: {
            count: jobRequests.filter(
                (item) => item.status.toLowerCase() === "draft"
            ).length
        },
        Bid: {
            count: jobRequests.filter(
                (item) => item.status.toLowerCase() === "bid"
            ).length
        },
        Active: {
            count: jobRequests.filter(
                (item) => item.status.toLowerCase() === "active"
            ).length
        },
        Past: {
            count: jobRequests.filter(
                (item) =>
                    item.status.toLowerCase() === "complete" ||
                    item.stage.toLowerCase() === "complete" || item.status.toLowerCase() === "past"
            ).length
        }
    };

    useEffect(() => {
        const fetchAllJobRequests = async () => {
            try {
                const response = await getAdminJobRequests(axiosInstance);
                if (response.success) {
                    setJobRequests(response.hashSet || response.data || []);
                } else {
                    setJobRequests([]);
                }
            } catch (error: any) {
                console.error("Failed to fetch job requests:", error);
                // Silently fail - don't show alert to user
                setJobRequests([]);
            }
        };
        fetchAllJobRequests();
    }, []);

    const filteredData = useMemo(() => {
        let filtered = jobRequests.filter((item) => {
            if (activeTab === "New") return item.status.toLowerCase() === "new";
            if (activeTab === "Draft")
                return item.status.toLowerCase() === "draft";
            if (activeTab === "Bid") return item.status.toLowerCase() === "bid";
            if (activeTab === "Active")
                return item.status.toLowerCase() === "active";
            if (activeTab === "Past")
                return item.status.toLowerCase() === "complete" || item.status.toLowerCase() === "past";
            return true;
        });

        if (searchQuery) {
            filtered = filtered.filter(
                (item) =>
                    (item.jobId || "")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    (item.category || "")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    (item.jobType || "")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    (item.location || "")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    (item.managedBy || "")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    (item.type || "")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    (item.status || "")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    (item.stage || "")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : "")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
            );
        }

        if (filterValues.category)
            filtered = filtered.filter((item) =>
                (item.jobType || "")
                    .toLowerCase()
                    .includes(filterValues.category.toLowerCase())
            );
        if (filterValues.managedBy)
            filtered = filtered.filter((item) =>
                (item.managedBy || "")
                    .toLowerCase()
                    .includes(filterValues.managedBy.toLowerCase())
            );
        if (filterValues.county)
            filtered = filtered.filter((item) =>
                (item.location || "")
                    .toLowerCase()
                    .includes(filterValues.county.toLowerCase())
            );
        if (filterValues.startDate)
            filtered = filtered.filter(
                (item) =>
                    item.startDate &&
                    new Date(item.startDate) >= new Date(filterValues.startDate)
            );
        if (filterValues.endDate)
            filtered = filtered.filter(
                (item) =>
                    item.endDate &&
                    new Date(item.endDate) <= new Date(filterValues.endDate)
            );

        return filtered;
    }, [activeTab, searchQuery, jobRequests, filterValues]);

    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    const paginatedData = useMemo(() => {
        const startIdx = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(startIdx, startIdx + rowsPerPage);
    }, [filteredData, currentPage, rowsPerPage]);

    const tabs = [
        { key: "New", label: "New", count: statusConfig.New.count },
        { key: "Draft", label: "Drafts", count: statusConfig.Draft.count },
        { key: "Bid", label: "Bids", count: statusConfig.Bid.count },
        { key: "Active", label: "Active", count: statusConfig.Active.count },
        { key: "Past", label: "Past", count: statusConfig.Past.count }
    ];

    return (
        <div>
            <div className="mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 rounded-lg p-2 sm:p-4 shadow-sm border">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex justify-center items-center w-full px-2 py-2 sm:py-1 rounded-md font-medium transition-all duration-200 space-x-2 text-sm sm:text-base ${
                                activeTab === tab.key
                                    ? "bg-blue-900 text-white shadow-md"
                                    : "bg-blue-100 text-blue-900 hover:bg-blue-200"
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className="font-semibold">({tab.count})</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by ID, Category, Location..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full md:w-auto px-4 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-md"
                    >
                        <Filter className="w-5 h-5" />
                        <span>Filters</span>
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                                showFilters ? "rotate-180" : ""
                            }`}
                        />
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="fixed inset-0 z-40 overflow-hidden">
                    <div
                        className="fixed inset-0 bg-gray-200/30 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowFilters(false)}
                    />
                    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform">
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center p-6 border-b">
                                <h2 className="text-xl font-semibold">
                                    Filter Jobs
                                </h2>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowFilters(false)}
                                    aria-label="Close filters"
                                >
                                    <span className="text-3xl">&times;</span>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setShowFilters(false);
                                        setCurrentPage(1);
                                    }}
                                    className="space-y-5"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                            value={filterValues.category}
                                            onChange={(e) =>
                                                setFilterValues((v) => ({
                                                    ...v,
                                                    category: e.target.value
                                                }))
                                            }
                                        >
                                            <option value="">
                                                All Categories
                                            </option>
                                            <option value="fundi">Fundi</option>
                                            <option value="machinery">
                                                Machinery
                                            </option>
                                            <option value="contractor">
                                                Contractor
                                            </option>
                                            <option value="custom product">
                                                Custom Product
                                            </option>
                                            <option value="professional">
                                                Professional
                                            </option>
                                            <option value="design">
                                                Design
                                            </option>
                                            <option value="hardware">
                                                Hardware
                                            </option>
                                            <option value="electrician">
                                                Electrician
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Managed By
                                        </label>
                                        <select
                                            className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                            value={filterValues.managedBy}
                                            onChange={(e) =>
                                                setFilterValues((v) => ({
                                                    ...v,
                                                    managedBy: e.target.value
                                                }))
                                            }
                                        >
                                            <option value="">All</option>
                                            <option value="self">Self</option>
                                            <option value="jagedo">
                                                Jagedo
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            County
                                        </label>
                                        <select
                                            className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                            value={filterValues.county}
                                            onChange={(e) =>
                                                setFilterValues((v) => ({
                                                    ...v,
                                                    county: e.target.value
                                                }))
                                            }
                                        >
                                            <option value="">
                                                All Counties
                                            </option>
                                            {Object.keys(counties).map(
                                                (county) => (
                                                    <option
                                                        key={county}
                                                        value={county}
                                                    >
                                                        {county}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                                value={filterValues.startDate}
                                                onChange={(e) =>
                                                    setFilterValues((v) => ({
                                                        ...v,
                                                        startDate:
                                                            e.target.value
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                                value={filterValues.endDate}
                                                onChange={(e) =>
                                                    setFilterValues((v) => ({
                                                        ...v,
                                                        endDate: e.target.value
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="p-6 border-t">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 bg-gray-100 rounded-md py-2.5 font-medium hover:bg-gray-200 transition-colors"
                                        onClick={() => {
                                            setFilterValues({
                                                category: "",
                                                managedBy: "",
                                                county: "",
                                                startDate: "",
                                                endDate: ""
                                            });
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Reset All
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-900 text-white rounded-md py-2.5 font-medium hover:bg-blue-700 transition-colors"
                                        onClick={() => {
                                            setShowFilters(false);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] md:min-w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-3 md:px-6 py-3 text-left text-sm font-semibold whitespace-nowrap">
                                    #
                                </th>
                                <th className="px-3 md:px-6 py-3 text-left text-sm font-semibold whitespace-nowrap">
                                    Requests
                                </th>
                                <th className="hidden md:table-cell px-3 md:px-6 py-3 text-left text-sm font-semibold whitespace-nowrap">
                                    Creation Date
                                </th>
                                <th className="px-3 md:px-6 py-3 text-left text-sm font-semibold whitespace-nowrap">
                                    Category
                                </th>
                                <th className="hidden lg:table-cell px-3 md:px-6 py-3 text-left text-sm font-semibold whitespace-nowrap">
                                    Type
                                </th>
                                <th className="hidden lg:table-cell px-3 md:px-6 py-3 text-left text-sm font-semibold whitespace-nowrap">
                                    Managed by
                                </th>
                                <th className="hidden md:table-cell px-3 md:px-6 py-3 text-left text-sm font-semibold whitespace-nowrap">
                                    Location
                                </th>
                                <th className="px-3 md:px-6 py-3 text-left text-sm font-semibold whitespace-nowrap">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {paginatedData.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() =>
                                        handleNavigateToJobPage(item)
                                    }
                                >
                                    <td className="px-3 md:px-6 py-4 text-sm whitespace-nowrap">
                                        {(currentPage - 1) * rowsPerPage +
                                            index +
                                            1}
                                    </td>
                                    <td className="px-3 md:px-6 py-4 text-sm whitespace-nowrap">
                                        <span className="text-blue-600 hover:text-blue-800 font-medium">
                                            {item.jobId}
                                        </span>
                                    </td>
                                    <td className="hidden md:table-cell px-3 md:px-6 py-4 text-sm whitespace-nowrap">
                                        {new Date(
                                            item.createdAt
                                        ).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-3 md:px-6 py-4 text-sm whitespace-nowrap">
                                        {item.jobType}
                                    </td>
                                    <td className="hidden lg:table-cell px-3 md:px-6 py-4 text-sm whitespace-nowrap">
                                        {item.type || "Job"}
                                    </td>
                                    <td className="hidden lg:table-cell px-3 md:px-6 py-4 text-sm whitespace-nowrap">
                                        {item.managedBy}
                                    </td>
                                    <td className="hidden md:table-cell px-3 md:px-6 py-4 text-sm whitespace-nowrap">
                                        {item.location}
                                    </td>
                                    <td className="px-3 md:px-6 py-4 text-sm whitespace-nowrap">
                                        {item.stage}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredData.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            No requests found
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                            Try adjusting your search or filters
                        </p>
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="rowsPerPage"
                        className="text-sm text-gray-700"
                    >
                        Rows:
                    </label>
                    <select
                        id="rowsPerPage"
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        {[5, 10, 20, 50, 100].map((num) => (
                            <option key={num} value={num}>
                                {num}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="text-sm text-gray-600 text-center md:text-left">
                    Showing{" "}
                    {totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-
                    {Math.min(currentPage * rowsPerPage, totalRows)} of{" "}
                    {totalRows} requests
                </div>
                <div className="flex items-center justify-center flex-wrap gap-2">
                    <button
                        disabled={currentPage === 1}
                        onClick={() =>
                            setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        className={`px-3 py-1 rounded text-sm ${
                            currentPage === 1
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                        Prev
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page =
                            currentPage > 3 ? currentPage - 2 + i : i + 1;
                        if (page > totalPages) return null;
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded text-sm ${
                                    currentPage === page
                                        ? "bg-blue-700 text-white font-bold"
                                        : "bg-gray-100 hover:bg-blue-100"
                                }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() =>
                            setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                        className={`px-3 py-1 rounded text-sm ${
                            currentPage === totalPages
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Jobs;