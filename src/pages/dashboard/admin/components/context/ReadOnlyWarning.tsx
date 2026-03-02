import { useRolePermissions } from "@/context/RolePermissionProvider";
import { canPerformOperation } from "@/utils/adminPermissions";

export const ReadOnlyWarning = () => {
  const { userMenuPermissions } = useRolePermissions();
  const canCreate = canPerformOperation(userMenuPermissions, 'bulk-sms', 'CREATE');

  if (canCreate) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <p className="text-yellow-800">
        You have read-only access to this section. Contact an administrator to request Sending SMS permissions.
      </p>
    </div>
  );
};