export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organization_id: string;
  branch_id?: string;
  branch_ids?: string[];
}
