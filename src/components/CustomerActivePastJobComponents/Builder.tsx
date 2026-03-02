//@ts-nocheck
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getJobRequestById } from "@/api/jobRequests.api";
import useAxiosWithAuth from "@/utils/axiosInterceptor";
import { Loader } from "lucide-react";

interface ServiceProvider {
    id: number;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    profileImage?: string;
}

export default function Builder() {
    const [providerData, setProviderData] = useState<ServiceProvider | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { id } = useParams<{ id: string }>();
    const axiosInstance = useAxiosWithAuth(import.meta.env.VITE_SERVER_URL);

    useEffect(() => {
        if (!id) {
            setError("Job ID not found in URL.");
            setIsLoading(false);
            return;
        }

        const fetchBuilderDetails = async () => {
            try {
                const response = await getJobRequestById(axiosInstance, id);
                if (response.success && response.data.assignedServiceProvider) {
                    setProviderData(response.data.assignedServiceProvider);
                } else {
                    throw new Error("Service provider details not found for this job.");
                }
            } catch (err) {
                console.error("Failed to fetch builder details:", err);
                setError("Could not load the service provider's details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBuilderDetails();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-white">
                <Loader className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-white p-4 text-center">
                <p className="text-xl text-red-500">{error}</p>
            </div>
        );
    }

    if (!providerData) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-white p-4 text-center">
                <p className="text-xl text-gray-600">No service provider information available.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white shadow-xl rounded-lg p-6 md:p-10 flex flex-col items-center text-center border border-gray-200">
                <img
                    src={providerData?.profileImage || "/logo.png"}
                    alt={`${providerData.firstName} ${providerData.lastName}`}
                    className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-lg border-4 border-green-500 mb-6"
                />

                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                    {providerData.firstName} {providerData.lastName}
                </h2>
                {providerData.organizationName && (
                    <p className="text-lg md:text-xl text-gray-600">{providerData.organizationName}</p>
                )}
                <p className="text-base text-gray-500 mb-8 mt-1">
                    Assigned Service Provider
                </p>

                <div className="w-full space-y-4 text-left border-t border-gray-200 pt-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center md:text-left">
                        Contact Information
                    </h2>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500">Full Name</h3>
                        <p className="text-base md:text-lg text-gray-800">
                            {providerData.firstName} {providerData.lastName}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500">Phone</h3>
                        <p className="text-base md:text-lg text-gray-800">{providerData.phoneNumber}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500">Email</h3>
                        <p className="text-base md:text-lg text-gray-800 break-words">{providerData.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}