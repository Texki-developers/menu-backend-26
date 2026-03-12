import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BranchId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Return branchId (present for staff/customers). 
    // Admins only have branchIds[], so this will return undefined for them.
    return request.user?.branchId;
  },
);
