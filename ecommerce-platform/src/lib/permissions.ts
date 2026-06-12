export type Role = "superadmin" | "admin" | "editor";

interface PermissionMatrix {
  menuAccess: string[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canBatchOperation: boolean;
  canExport: boolean;
  canStatusChange: boolean;
  dataScope: "all" | "own";
}

const rolePermissions: Record<Role, PermissionMatrix> = {
  superadmin: {
    menuAccess: [
      "dashboard", "products", "categories", "content",
      "reviews", "analytics", "inquiries", "favorites",
      "logs", "users", "visitors", "settings"
    ],
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canBatchOperation: true,
    canExport: true,
    canStatusChange: true,
    dataScope: "all",
  },
  admin: {
    menuAccess: [
      "dashboard", "products", "categories", "content",
      "reviews", "analytics", "inquiries", "favorites",
      "logs", "visitors"
    ],
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canBatchOperation: true,
    canExport: true,
    canStatusChange: true,
    dataScope: "all",
  },
  editor: {
    menuAccess: [
      "dashboard", "products", "categories", "content",
      "reviews", "inquiries", "favorites", "logs"
    ],
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canBatchOperation: false,
    canExport: false,
    canStatusChange: false,
    dataScope: "own",
  },
};

export function getPermissions(role: Role): PermissionMatrix {
  return rolePermissions[role] || rolePermissions.editor;
}

export function canAccessMenu(role: Role, menuKey: string): boolean {
  const perms = getPermissions(role);
  return perms.menuAccess.includes(menuKey);
}

export function canPerformAction(role: Role, action: keyof PermissionMatrix): boolean {
  const perms = getPermissions(role);
  return !!perms[action];
}

export function getDataScope(role: Role): "all" | "own" {
  return getPermissions(role).dataScope;
}