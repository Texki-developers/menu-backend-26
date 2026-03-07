import { UserRole } from "src/constants/user-roles.constant";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  organizationId: string;
  branchId?: string;
  branchIds?: string[];
}
