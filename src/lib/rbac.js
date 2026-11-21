// Role-Based Access Control (RBAC) definitions for GreenLens Municipal Command Center

export const ROLE_PERMISSIONS = {
  'Super Administrator': {
    label: 'Super Administrator',
    badge: 'Super Admin',
    description: 'Root-level platform governance, admin provisioning, user management, and full system control.',
    allowedViews: [
      'dashboard',
      'incidents',
      'ai-priority',
      'dispatch',
      'field-teams',
      'digital-twin',
      'drainage-network',
      'flood-risk',
      'waste-intelligence',
      'ai-insights',
      'analytics',
      'alerts',
      'administration'
    ],
    canDispatch: true,
    canManageUsers: true,
    canSwitchMunicipality: true,
    canConfigureThresholds: true,
    canBroadcastAlerts: true,
    canExportReports: true,
    canLogDefects: true,
  },
  'System Administrator': {
    label: 'System Administrator',
    badge: 'Admin Access',
    description: 'Full unrestricted governance, user management, and system configuration.',
    allowedViews: [
      'dashboard',
      'incidents',
      'ai-priority',
      'dispatch',
      'field-teams',
      'digital-twin',
      'drainage-network',
      'flood-risk',
      'waste-intelligence',
      'ai-insights',
      'analytics',
      'alerts',
      'administration'
    ],
    canDispatch: true,
    canManageUsers: true,
    canSwitchMunicipality: false,
    canConfigureThresholds: true,
    canBroadcastAlerts: true,
    canExportReports: true,
    canLogDefects: true,
  },
  'Municipal Officer': {
    label: 'Municipal Officer',
    badge: 'Executive Command',
    description: 'Municipal leadership, predictive intelligence, and operational dispatching.',
    allowedViews: [
      'dashboard',
      'incidents',
      'ai-priority',
      'dispatch',
      'field-teams',
      'digital-twin',
      'drainage-network',
      'flood-risk',
      'waste-intelligence',
      'ai-insights',
      'analytics',
      'alerts'
    ],
    canDispatch: true,
    canManageUsers: false,
    canConfigureThresholds: false,
    canBroadcastAlerts: true,
    canExportReports: true,
    canLogDefects: true,
  },
  'Field Supervisor': {
    label: 'Field Supervisor',
    badge: 'Operations Lead',
    description: 'Tactical field squad coordination, incident verification, and asset maintenance.',
    allowedViews: [
      'dashboard',
      'incidents',
      'dispatch',
      'field-teams',
      'digital-twin',
      'drainage-network',
      'alerts'
    ],
    canDispatch: true,
    canManageUsers: false,
    canConfigureThresholds: false,
    canBroadcastAlerts: false,
    canExportReports: false,
    canLogDefects: true,
  },
  'Field Worker Lead': {
    label: 'Field Worker Lead',
    badge: 'Field Crew',
    description: 'Field tasks execution, incident verification, and on-site defect reporting.',
    allowedViews: [
      'incidents',
      'dispatch',
      'field-teams',
      'drainage-network'
    ],
    canDispatch: false,
    canManageUsers: false,
    canConfigureThresholds: false,
    canBroadcastAlerts: false,
    canExportReports: false,
    canLogDefects: true,
  }
};

export const getPermissionsForRole = (roleName) => {
  if (!roleName) return ROLE_PERMISSIONS['Municipal Officer'];
  const normalized = roleName.trim().toLowerCase();
  if (normalized === 'super_admin' || normalized === 'superadmin' || normalized === 'super admin') {
    return ROLE_PERMISSIONS['Super Administrator'];
  }
  if (normalized === 'municipal_admin' || normalized === 'administrator') {
    return ROLE_PERMISSIONS['System Administrator'];
  }
  // Normalize match
  const match = Object.keys(ROLE_PERMISSIONS).find(
    (key) => key.toLowerCase() === normalized
  );
  return ROLE_PERMISSIONS[match] || ROLE_PERMISSIONS['Municipal Officer'];
};

export const isViewAllowed = (roleName, viewId) => {
  const permissions = getPermissionsForRole(roleName);
  return permissions.allowedViews.includes(viewId);
};
