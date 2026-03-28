import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { USER_ROLES } from 'src/constants/user-roles.constant';

export const BranchId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // ORG_ADMIN has access to all branches — return null so services don't scope by branch
    if (!user || user.role === USER_ROLES.ORG_ADMIN) {
      return null;
    }

    // Staff/customer users are scoped to a specific branch
    return user.branchId ?? null;
  },
);
