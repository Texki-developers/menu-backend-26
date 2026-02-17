export const STAFF_ROLES = {
  WAITER: 'WAITER',
  CHEF: 'CHEF',
  CASHIER: 'CASHIER',
  MANAGER: 'MANAGER',
} as const;

export type StaffRole = (typeof STAFF_ROLES)[keyof typeof STAFF_ROLES];
