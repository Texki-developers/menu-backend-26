export const USER_ROLES = {
  ORG_ADMIN: 'ORG_ADMIN',
  BRANCH_ADMIN: 'BRANCH_ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
