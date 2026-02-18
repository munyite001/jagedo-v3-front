import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Mail,
  Trash2,
  Edit,
  Shield,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  LockOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAllRoles,
  getAllMenuItems,
  createRole,
  updateRole,
  deleteRole,
  createAdminUser,
  getAllAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  suspendAdminUser,
} from "@/api/rolePermissions.api";
import { resetAdminUserPassword } from "@/api/changePassword.api";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // User creation states
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserfirstName, setNewUserfirstName] = useState("");
  const [newUserlastName, setNewUserlastName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  // Pagination states
  const [usersPage, setUsersPage] = useState(0);
  const [rolesPage, setRolesPage] = useState(0);
  const itemsPerPage = 10;

  // Role dialog states
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);

  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
    isLoading: boolean;
    buttonLabel?: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: async () => {},
    isLoading: false,
    buttonLabel: "Delete",
  });

  // Load data from backend on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [rolesData, menuItemsData, usersData] = await Promise.all([
        getAllRoles(),
        getAllMenuItems(),
        getAllAdminUsers(),
      ]);
      setRoles(rolesData || []);
      setMenuItems(menuItemsData || []);
      setUsers(usersData || []);
    } catch (error: any) {
      console.error("Failed to load initial data:", error);
      toast.error("Failed to load roles and menu items");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.roles && Array.isArray(user.roles) && user.roles.some((role: any) => {
        const roleName = typeof role === 'string' ? role : role.name;
        return roleName?.toLowerCase().includes(searchQuery.toLowerCase());
      }))
  );

  // Handle create/edit admin user
  const handleCreateAdminUser = async () => {
    if (
      !newUserEmail.trim() ||
      !newUserfirstName.trim() ||
      selectedRoleIds.length === 0
    ) {
      toast.error("Email, first name, and role are required");
      return;
    }

    setIsCreatingUser(true);
    try {
      if (editingUser) {
        // Update existing user - call update endpoint
        const payload = {
          email: newUserEmail,
          firstName: newUserfirstName,
          lastName: newUserlastName,
          phoneNumber: newUserPhone,
          roleIds: selectedRoleIds,
        };
        
        await updateAdminUser(editingUser.id, payload);
        toast.success("Admin user updated successfully!");
      } else {
        // Create new user
        await createAdminUser({
          email: newUserEmail,
          firstName: newUserfirstName,
          lastName: newUserlastName,
          phoneNumber: newUserPhone,
          roleIds: selectedRoleIds,
        });
        toast.success("Admin user created! Credentials sent to email");
      }

      setIsCreateUserDialogOpen(false);
      resetUserForm();
      // Refresh users list
      const usersData = await getAllAdminUsers();
      setUsers(usersData || []);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to save admin user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setNewUserEmail(user.email);
    setNewUserfirstName(user.firstName);
    setNewUserlastName(user.lastName);
    setNewUserPhone(user.phoneNumber);
    
    // Extract role IDs from user's roles
    // User roles might be strings (role names) or objects with id property
    const roleIds = user.roles && Array.isArray(user.roles) 
      ? user.roles.map((r: any) => {
          // If r is a string (role name), find the matching role ID
          if (typeof r === 'string') {
            const matchedRole = roles.find((role: any) => 
              role.name.toLowerCase() === r.toLowerCase()
            );
            return matchedRole?.id || null;
          }
          // If r is an object with id property
          return r.id || null;
        }).filter((id: any) => id !== null)
      : [];
    
    console.log("User roles:", user.roles);
    console.log("Extracted role IDs:", roleIds);
    
    setSelectedRoleIds(roleIds);
    setIsCreateUserDialogOpen(true);
  };

  const handleDeleteUser = async (userId: number, user?: any) => {
    // Check if user has SuperAdmin role
    if (user) {
      const hasSuperAdminRole = user.roles && Array.isArray(user.roles) && user.roles.some((r: any) => {
        if (typeof r === 'string') {
          return r.toLowerCase() === 'superadmin';
        }
        return r.name?.toLowerCase() === 'superadmin';
      });

      if (hasSuperAdminRole) {
        toast.error("Cannot delete SuperAdmin user. SuperAdmin role is protected.");
        return;
      }
    }

    setConfirmDialog({
      isOpen: true,
      title: "Delete Admin User",
      description: "Are you sure you want to delete this user? This action cannot be undone.",
      buttonLabel: "Delete",
      action: async () => {
        try {
          await deleteAdminUser(userId);
          toast.success("User deleted successfully");
          const usersData = await getAllAdminUsers();
          setUsers(usersData || []);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (error: any) {
          toast.error(error.message || "Failed to delete user");
        }
      },
      isLoading: false,
    });
  };

  const handleSuspendUser = async (user: any) => {
    // Check if user has SuperAdmin role
    const hasSuperAdminRole = user.roles && Array.isArray(user.roles) && user.roles.some((r: any) => {
      if (typeof r === 'string') {
        return r.toLowerCase() === 'superadmin';
      }
      return r.name?.toLowerCase() === 'superadmin';
    });

    if (hasSuperAdminRole) {
      toast.error("Cannot suspend SuperAdmin user. SuperAdmin role is protected.");
      return;
    }

    const isSuspended = !user.isActive;
    setConfirmDialog({
      isOpen: true,
      title: isSuspended ? "Unsuspend Admin User" : "Suspend Admin User",
      description: isSuspended 
        ? "Are you sure you want to unsuspend this user? They will regain access to the portal."
        : "Are you sure you want to suspend this user? They will lose access to the portal.",
      buttonLabel: isSuspended ? "Unsuspend" : "Suspend",
      action: async () => {
        try {
          const updatedUser = await suspendAdminUser(user.id);
          
          toast.success(updatedUser.isActive ? "User unsuspended successfully" : "User suspended successfully");
          
          // Refetch the complete users list to ensure data is up to date
          const usersData = await getAllAdminUsers();
          setUsers(usersData || []);
          
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (error: any) {
          toast.error(error.message || "Failed to suspend/unsuspend user");
        }
      },
      isLoading: false,
    });
  };

  const handleResetPassword = async (user: any) => {
    setConfirmDialog({
      isOpen: true,
      title: "Reset User Password",
      description: `Are you sure you want to reset the password for ${user.firstName} ${user.lastName}? They will receive new credentials via email.`,
      buttonLabel: "Reset Password",
      action: async () => {
        try {
          await resetAdminUserPassword(user.id);
          toast.success("Password reset successfully. New credentials sent to user's email");
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (error: any) {
          toast.error(error.message || "Failed to reset password");
        }
      },
      isLoading: false,
    });
  };

  const resetUserForm = () => {
    setNewUserEmail("");
    setNewUserfirstName("");
    setNewUserlastName("");
    setNewUserPhone("");
    setSelectedRoleIds([]);
    setEditingUser(null);
  };

  // Role management functions
  const handleCreateRole = async () => {
    if (!newRoleName.trim() || selectedMenuItems.length === 0) {
      toast.error("Role name and at least one menu item are required");
      return;
    }

    setIsLoading(true);
    try {
      await createRole({
        name: newRoleName,
        description: newRoleDescription,
        menuItemIds: selectedMenuItems,
      });
      toast.success("Role created successfully");
      await loadInitialData();
      resetRoleForm();
      setIsRoleDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setNewRoleName(role.name);
    setNewRoleDescription(role.description);
    setSelectedMenuItems(role.menuItemIds || role.menuItems?.map((m: any) => m.id) || []);
    setIsRoleDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !newRoleName.trim() || selectedMenuItems.length === 0) {
      toast.error("Role name and at least one menu item are required");
      return;
    }

    setIsLoading(true);
    try {
      await updateRole(editingRole.id, {
        name: newRoleName,
        description: newRoleDescription,
        menuItemIds: selectedMenuItems,
      });
      toast.success("Role updated successfully");
      await loadInitialData();
      resetRoleForm();
      setIsRoleDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (id: number | string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Role",
      description: "Are you sure you want to delete this role? This action cannot be undone.",
      action: async () => {
        try {
          await deleteRole(id);
          toast.success("Role deleted successfully");
          await loadInitialData();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (error: any) {
          toast.error(error.message || "Failed to delete role");
        }
      },
      isLoading: false,
    });
  };

  const resetRoleForm = () => {
    setNewRoleName("");
    setNewRoleDescription("");
    setSelectedMenuItems([]);
    setEditingRole(null);
  };

  const toggleMenuItem = (menuItemId: string) => {
    setSelectedMenuItems((prev) =>
      prev.includes(menuItemId)
        ? prev.filter((m) => m !== menuItemId)
        : [...prev, menuItemId]
    );
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, any>);

  // Pagination helpers
  const paginateArray = (array: any[], page: number, itemsPerPage: number) => {
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return array.slice(startIndex, endIndex);
  };

  const getTotalPages = (array: any[]) => {
    return Math.ceil(array.length / itemsPerPage);
  };

  const paginatedUsers = paginateArray(filteredUsers, usersPage, itemsPerPage);
  const paginatedRoles = paginateArray(roles, rolesPage, itemsPerPage);
  const totalUserPages = getTotalPages(filteredUsers);
  const totalRolePages = getTotalPages(roles);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">Admin users in system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <LockOpen className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter(u => u.isActive).length}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
                <Lock className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter(u => !u.isActive).length}</div>
                <p className="text-xs text-muted-foreground">Access restricted</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                <Check className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roles.length}</div>
                <p className="text-xs text-muted-foreground">Available roles</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-end">
            <Dialog
              open={isCreateUserDialogOpen}
              onOpenChange={(open) => {
                setIsCreateUserDialogOpen(open);
                if (!open) resetUserForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-900 hover:bg-primary-hover text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Admin User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Edit Admin User" : "Create Admin User"}</DialogTitle>
                  <DialogDescription>
                    {editingUser 
                      ? "Update admin user details and roles."
                      : "Create a new admin user and assign portal roles. Credentials will be sent via email."}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={newUserfirstName}
                      onChange={(e) => setNewUserfirstName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={newUserlastName}
                      onChange={(e) => setNewUserlastName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Email Address *</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="john@example.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      disabled={editingUser !== null}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userPhone">Phone Number</Label>
                    <Input
                      id="userPhone"
                      type="tel"
                      placeholder="0712345678 or 0112345678"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Assign Role *</Label>
                    {editingUser && editingUser.roles && Array.isArray(editingUser.roles) && editingUser.roles.some((r: any) => {
                      if (typeof r === 'string') {
                        return r.toLowerCase() === 'superadmin';
                      }
                      return r.name?.toLowerCase() === 'superadmin';
                    }) ? (
                      <div className="border rounded-md p-3 bg-yellow-50 border-yellow-200">
                        <p className="text-sm text-yellow-800 font-medium">
                          SuperAdmin role is protected and cannot be changed.
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                        {roles.length > 0 ? (
                          roles
                            .filter((role) => !role.isSuperAdmin) // Hide SuperAdmin from role selection
                            .map((role) => {
                            const isSelected = selectedRoleIds.length > 0 && selectedRoleIds[0] === role.id;
                            const isCurrentRole = editingUser?.roles?.some((r: any) => {
                              if (typeof r === 'string') {
                                return r.toLowerCase() === role.name.toLowerCase();
                              }
                              return r.id === role.id || r === role.id;
                            });
                            
                            return (
                              <div
                                key={role.id}
                                className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${isCurrentRole && editingUser ? 'bg-blue-50' : ''}`}
                                onClick={() => setSelectedRoleIds([role.id])}
                              >
                                <input
                                  type="radio"
                                  id={`role-${role.id}`}
                                  name="userRole"
                                  value={role.id}
                                  checked={isSelected}
                                  onChange={() => setSelectedRoleIds([role.id])}
                                  className="cursor-pointer"
                                />
                                <Label
                                  htmlFor={`role-${role.id}`}
                                  className="cursor-pointer flex-1"
                                >
                                  <div className="font-medium">{role.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {role.description}
                                  </div>
                                </Label>
                                {isCurrentRole && editingUser && (
                                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-gray-500">
                            No roles available. Create roles first.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateUserDialogOpen(false);
                      resetUserForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-800 hover:bg-primary-hover text-primary-foreground"
                    onClick={handleCreateAdminUser}
                    disabled={
                      !newUserEmail.trim() ||
                      !newUserfirstName.trim() ||
                      selectedRoleIds.length === 0 ||
                      isCreatingUser
                    }
                  >
                    {isCreatingUser && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingUser ? "Update User" : "Create User"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Admin Users</CardTitle>
                  <CardDescription>
                    Admin users with portal access and role assignments
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow
                      key={`user-${user.id}`}
                      className="hover:bg-accent/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.phoneNumber}
                      </TableCell>
                      <TableCell>
                        {user.roles && Array.isArray(user.roles) && user.roles.length > 0 ? (
                          <Badge variant="outline">
                            {typeof user.roles[0] === 'string' ? user.roles[0] : user.roles[0]?.name}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">No role</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.isActive === true ? "default" : "secondary"
                          }
                          className={
                            user.isActive === true
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }
                        >
                          {user.isActive === true ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleSuspendUser(user)}
                              disabled={user.roles && Array.isArray(user.roles) && user.roles.some((r: any) => {
                                if (typeof r === 'string') {
                                  return r.toLowerCase() === 'superadmin';
                                }
                                return r.name?.toLowerCase() === 'superadmin';
                              })}
                            >
                              {user.isActive ? (
                                <>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <LockOpen className="h-4 w-4 mr-2" />
                                  Unsuspend
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                              <Lock className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id, user)}
                              className="text-destructive"
                              disabled={isDeletingUser || (user.roles && Array.isArray(user.roles) && user.roles.some((r: any) => {
                                if (typeof r === 'string') {
                                  return r.toLowerCase() === 'superadmin';
                                }
                                return r.name?.toLowerCase() === 'superadmin';
                              }))}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {usersPage * itemsPerPage + 1} to {Math.min((usersPage + 1) * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setUsersPage(Math.max(0, usersPage - 1))}
                      disabled={usersPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalUserPages }).map((_, i) => (
                        <Button
                          key={i}
                          variant={usersPage === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUsersPage(i)}
                          className="w-8 h-8 p-0"
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setUsersPage(Math.min(totalUserPages - 1, usersPage + 1))}
                      disabled={usersPage === totalUserPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="flex items-center justify-end">
            <Dialog
              open={isRoleDialogOpen}
              onOpenChange={(open) => {
                setIsRoleDialogOpen(open);
                if (!open) resetRoleForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-900 hover:bg-primary-hover text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRole
                      ? "Edit Role & Menu Permissions"
                      : "Create New Role & Assign Menu Items"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingRole
                      ? "Update role details and select which menu items this role can access"
                      : "Define a new role and select which admin menu items users with this role can access"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      placeholder="e.g., Content Manager"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roleDescription">Description</Label>
                    <Input
                      id="roleDescription"
                      placeholder="Brief description of this role"
                      value={newRoleDescription}
                      onChange={(e) => setNewRoleDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Menu Item Permissions</Label>
                    {Object.entries(groupedMenuItems).map(
                      ([category, items]: [string, any]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            {category}
                          </h4>
                          <div className="grid grid-cols-2 gap-3 pl-6">
                            {items.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`menu-${item.id}`}
                                  checked={selectedMenuItems.includes(item.id)}
                                  onCheckedChange={() =>
                                    toggleMenuItem(item.id)
                                  }
                                />
                                <label
                                  htmlFor={`menu-${item.id}`}
                                  className="text-sm text-foreground cursor-pointer"
                                >
                                  {item.title}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsRoleDialogOpen(false);
                      resetRoleForm();
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-800 hover:bg-primary-hover text-primary-foreground"
                    onClick={editingRole ? handleUpdateRole : handleCreateRole}
                    disabled={
                      !newRoleName.trim() ||
                      selectedMenuItems.length === 0 ||
                      isLoading
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingRole ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>{editingRole ? "Update Role" : "Create Role"}</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>All Roles</CardTitle>
              <CardDescription>
                Manage system roles and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Menu Items</TableHead>
                    {/* <TableHead>Users</TableHead> */}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRoles.map((role) => (
                    <TableRow
                      key={role.id}
                      className="hover:bg-accent/50 transition-colors"
                    >
                      <TableCell className="font-medium flex items-center gap-2">
                        {role.name}
                        {role.isSuperAdmin && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Shield className="h-3 w-3 mr-1" />
                            Super Admin
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {role.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(role.menuItems || [])
                            .slice(0, 3)
                            .map((item: any) => (
                              <Badge
                                key={item.id}
                                variant="outline"
                                className="text-xs"
                              >
                                {item.title}
                              </Badge>
                            ))}
                          {(role.menuItems || []).length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(role.menuItems || []).length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {/* <TableCell>
                        <Badge variant="secondary">
                          {role.userCount} users
                        </Badge>
                      </TableCell> */}
                      <TableCell className="text-right space-x-2">
                        {role.isSuperAdmin ? (
                          <div className="flex items-center gap-2 justify-end">
                            <Shield className="h-4 w-4 text-amber-600" />
                            <span className="text-xs text-amber-600 font-medium">Protected</span>
                          </div>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditRole(role)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRole(role.id)}
                              disabled={isLoading || (role.userCount > 0)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {roles.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {rolesPage * itemsPerPage + 1} to {Math.min((rolesPage + 1) * itemsPerPage, roles.length)} of {roles.length} roles
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setRolesPage(Math.max(0, rolesPage - 1))}
                      disabled={rolesPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalRolePages }).map((_, i) => (
                        <Button
                          key={i}
                          variant={rolesPage === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setRolesPage(i)}
                          className="w-8 h-8 p-0"
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setRolesPage(Math.min(totalRolePages - 1, rolesPage + 1))}
                      disabled={rolesPage === totalRolePages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => {
        if (!confirmDialog.isLoading) {
          setConfirmDialog((prev) => ({ ...prev, isOpen: open }));
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
              disabled={confirmDialog.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
                try {
                  await confirmDialog.action();
                } finally {
                  setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
                }
              }}
              disabled={confirmDialog.isLoading}
            >
              {confirmDialog.isLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {confirmDialog.buttonLabel || "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
