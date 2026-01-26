import { useState, useEffect } from "react"; // Step 1: Import useEffect
import ProfileSide from "@/components/profile/ProfileSideBar";
import AccountInfo from "@/components/profile/Account";
import Address from "@/components/profile/Address";
import AccountUploads from "@/components/profile/AccountUploads";
import FundiExperience from "@/components/profile/FundiExperience";
import { useGlobalContext } from "@/context/GlobalProvider";
import Activity from "@/components/profile/Activity";
import ProffExperience from "@/components/profile/ProffExperience";
import ShopAppPage from "@/components/profile/FundiShopApp";
import ContractorExperience from "@/components/profile/ContractorExperience";
import { AlertCircle } from "lucide-react";

function ProfilePage() {
    const [activeComponent, setActiveComponent] = useState("Account Info");
    const { user, logout } = useGlobalContext();

    useEffect(() => {
        if (!user) {
            return;
        }
        const userType = user?.userType?.toUpperCase();
        const serviceProviderTypes = ["FUNDI", "CONTRACTOR", "PROFESSIONAL", "HARDWARE"];

        if (
            serviceProviderTypes.includes(userType) &&
            !user?.userProfile?.complete
        ) {
            setActiveComponent("Account Info");
        }
    }, [user]);


    const renderContent = () => {
        const userType = (user?.userType || '').toLowerCase();

        switch (activeComponent) {
            case "Account Info":
                return <AccountInfo />;
            case "Address":
                return <Address />;
            case "Account Uploads":
                return <AccountUploads />;
            case "Experience":
                if (userType === 'fundi') {
                    return <FundiExperience />;
                }
                if (userType === 'professional') {
                    return <ProffExperience />;
                }
                if (userType === 'contractor') {
                    return <ContractorExperience />;
                }
                return <AccountInfo />;
            case "Products":
                if (userType === 'customer') {
                    return <AccountInfo />;
                }
                return <ShopAppPage />;
            case "Activities":
                return <Activity />;
            default:
                return <AccountInfo />;
        }
    };

    const isServiceProvider =
        user?.userType === "FUNDI" ||
        user?.userType === "CONTRACTOR" ||
        user?.userType === "PROFESSIONAL" ||
        user?.userType === "HARDWARE";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Account Requires Approval Header */}
            {isServiceProvider && user.adminApproved === false && (
                <div className="fixed top-12 w-full px-4 sm:px-6 pointer-events-none z-50">
                    <div className="w-[70%] sm:max-w-md mx-auto flex items-start gap-2 bg-yellow-100 rounded-md p-2 sm:p-4 shadow-md">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 sm:mt-1 text-yellow-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-yellow-700 leading-tight sm:leading-snug">
                            {user?.userProfile?.complete
                                ? "Your profile is complete and awaiting admin approval."
                                : "Please complete your profile for your account to be approved."
                            }
                        </span>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="w-full bg-white py-4 shadow-sm pl-16 sm:pl-70 lg:pl-180">
                <div className="container mx-auto flex items-center justify-between">
                    {/* Welcome Message */}
                    <h1 className="text-xl font-bold text-gray-800 sm:text-2xl md:text-3xl">
                        Welcome, {user?.firstName}!
                    </h1>

                    {/* Styled Logout Button */}
                    <button
                        onClick={logout}
                        className="
                            rounded-md bg-indigo-600 mr-2 px-4 py-2 
                            text-sm font-semibold text-white 
                            shadow-sm transition-colors duration-200 
                            hover:bg-indigo-500 
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                        "
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Layout Container */}
            <div className="flex">
                {/* Sidebar - Fixed position with responsive width */}
                <ProfileSide
                    activeComponent={activeComponent}
                    setActiveComponent={setActiveComponent}
                    user={user}
                />

                {/* Main Content - Responsive margin to account for sidebar */}
                <main className="flex-1 ml-16 sm:ml-64 lg:ml-80 p-3 sm:p-4 lg:p-6 min-h-screen transition-all duration-500">
                    <div className="max-w-6xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default ProfilePage;