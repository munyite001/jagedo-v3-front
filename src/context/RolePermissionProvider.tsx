import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import { MenuItem, Role } from "@/types/permissions";
import { getCurrentUserMenuPermissions, getAllRoles } from "@/api/rolePermissions.api";
import { useGlobalContext } from "./GlobalProvider";

interface RolePermissionContextType {
  userMenuPermissions: MenuItem[];
  allRoles: Role[];
  isLoadingPermissions: boolean;
  isLoadingRoles: boolean;
  permissionsError: string | null;
  rolesError: string | null;
  refreshPermissions: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  canAccessMenuItem: (menuItemId: string) => boolean;
  hasAnyPermission: (menuItemIds: string[]) => boolean;
}

const RolePermissionContext = createContext<RolePermissionContextType | undefined>(undefined);

// Default admin menu items - shown when user is not logged in or permissions fail to load
const DEFAULT_ADMIN_MENU_ITEMS: MenuItem[] = [
  { id: "home", title: "Home", category: "Overview" },
  { id: "user-management", title: "User Management", category: "Management" },
  { id: "bulk-sms", title: "Bulk SMS", category: "Management" },
  { id: "jobs", title: "Jobs", category: "Management" },
  { id: "orders", title: "Orders", category: "Management" },
  { id: "shop-products", title: "Products", category: "Management - Shop App" },
  { id: "shop-customer-view", title: "Customer View", category: "Management - Shop App" },
  { id: "shop-categories", title: "Categories", category: "Management - Shop App" },
  { id: "shop-attributes", title: "Attributes", category: "Management - Shop App" },
  { id: "shop-regions", title: "Regions", category: "Management - Shop App" },
  { id: "shop-prices", title: "Prices", category: "Management - Shop App" },
  { id: "registers-customers", title: "Customers", category: "Management - Registers" },
  { id: "registers-builders", title: "Builders", category: "Management - Registers" },
  { id: "analytics", title: "Analytics", category: "Management" },
  { id: "configuration", title: "Configuration", category: "Configurations" },
];

export const RolePermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoggedIn, user } = useGlobalContext();
  const [permissionsState, setPermissionsState] = useState<MenuItem[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [cachedUserId, setCachedUserId] = useState<string | null>(null);

  // Derive final permissions synchronously during render to prevent race conditions during login/navigation
  const userMenuPermissions = useMemo(() => {
    if (permissionsState.length > 0) return permissionsState;

    // If no explicit permissions set yet, but user is an admin type, return defaults
    const userType = String(user?.userType || "").toUpperCase();
    const isAdmin = userType === "ADMIN" || userType === "SUPER_ADMIN";

    if (isAdmin) {
      return DEFAULT_ADMIN_MENU_ITEMS;
    }

    return [];
  }, [permissionsState, user?.userType]);

  // Load user's menu permissions with localStorage caching
  const refreshPermissions = async () => {
    const hasToken = localStorage.getItem("token");
    const userType = String(user?.userType || "").toUpperCase();
    const isAdmin = userType === "ADMIN" || userType === "SUPER_ADMIN";

    if (!isLoggedIn && !hasToken) {
      setPermissionsState([]);
      setIsLoadingPermissions(false);
      return;
    }

    setIsLoadingPermissions(true);
    setPermissionsError(null);
    try {
      const permissions = await getCurrentUserMenuPermissions();

      // If the API returns empty list for an admin, we fall back to defaults
      if (isAdmin && (!permissions || permissions.length === 0)) {
        setPermissionsState(DEFAULT_ADMIN_MENU_ITEMS);
      } else {
        setPermissionsState(permissions || []);
      }

      // Persist to localStorage
      if (permissions && permissions.length > 0) {
        localStorage.setItem("cachedPermissions", JSON.stringify(permissions));
        if (user?.id) {
          localStorage.setItem("cachedPermissionsUserId", String(user.id));
          setCachedUserId(String(user.id));
        }
      }
    } catch (error: any) {
      console.error("Failed to load user menu permissions:", error);
      setPermissionsError(error.message);

      const cached = localStorage.getItem("cachedPermissions");
      const cachedId = localStorage.getItem("cachedPermissionsUserId");
      if (cached && cachedId === String(user?.id)) {
        try {
          const cachedPermissions = JSON.parse(cached);
          setPermissionsState(cachedPermissions);
        } catch (e) {
          if (isAdmin) setPermissionsState(DEFAULT_ADMIN_MENU_ITEMS);
        }
      } else {
        if (isAdmin) setPermissionsState(DEFAULT_ADMIN_MENU_ITEMS);
      }
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const refreshRoles = async () => {
    if (!isLoggedIn) {
      setAllRoles([]);
      return;
    }

    setIsLoadingRoles(true);
    try {
      const roles = await getAllRoles();
      setAllRoles(roles);
    } catch (error: any) {
      setRolesError(error.message);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    const hasToken = localStorage.getItem("token");
    if (!hasToken) {
      setPermissionsState([]);
      setIsLoadingPermissions(false);
      return;
    }

    const cached = localStorage.getItem("cachedPermissions");
    const cachedId = localStorage.getItem("cachedPermissionsUserId");
    const currentUserId = user?.id ? String(user.id) : null;

    if (cached && cachedId && cachedId === currentUserId) {
      try {
        setPermissionsState(JSON.parse(cached));
        setCachedUserId(cachedId);
      } catch (e) {
        setPermissionsState([]);
      }
    }

    refreshPermissions();
    refreshRoles();
  }, [user?.id]);

  useEffect(() => {
    if (!isLoggedIn) {
      setPermissionsState([]);
      setAllRoles([]);
      setCachedUserId(null);
      localStorage.removeItem("cachedPermissions");
      localStorage.removeItem("cachedPermissionsUserId");
    }
  }, [isLoggedIn]);

  const canAccessMenuItem = (menuItemId: string): boolean => {
    return userMenuPermissions.some((item) => item.id === menuItemId);
  };

  const hasAnyPermission = (menuItemIds: string[]): boolean => {
    return menuItemIds.some((id) => canAccessMenuItem(id));
  };

  const value = {
    userMenuPermissions,
    allRoles,
    isLoadingPermissions,
    isLoadingRoles,
    permissionsError,
    rolesError,
    refreshPermissions,
    refreshRoles,
    canAccessMenuItem,
    hasAnyPermission,
  };

  return (
    <RolePermissionContext.Provider value={value}>
      {children}
    </RolePermissionContext.Provider>
  );
};

export const useRolePermissions = () => {
  const context = useContext(RolePermissionContext);
  if (context === undefined) {
    return {
      userMenuPermissions: [],
      allRoles: [],
      isLoadingPermissions: false,
      isLoadingRoles: false,
      permissionsError: null,
      rolesError: null,
      refreshPermissions: async () => { },
      refreshRoles: async () => { },
      canAccessMenuItem: () => false,
      hasAnyPermission: () => false,
    };
  }
  return context;
};
