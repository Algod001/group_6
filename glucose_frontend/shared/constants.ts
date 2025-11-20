// Centralized role-to-dashboard mapping
export const ROLE_DASHBOARDS: Record<string, string> = {
  patient: '/patient/dashboard',
  specialist: '/specialist/dashboard',
  staff: '/staff/dashboard',
  administrator: '/admin/dashboard',
};

export const VALID_ROLES = ['patient', 'specialist', 'staff', 'administrator'] as const;
export type UserRole = typeof VALID_ROLES[number];
