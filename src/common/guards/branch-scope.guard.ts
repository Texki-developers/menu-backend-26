import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { USER_ROLES } from '../../constants/user-roles.constant';

@Injectable()
export class BranchScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('User context missing');
    }

    // ORG_ADMIN can access all branches in their organization
    if (user.role === USER_ROLES.ORG_ADMIN) {
      return true;
    }

    const branchId = request.body.branch_id || request.query.branch_id || request.params.branch_id;

    if (branchId) {
        if (user.role === USER_ROLES.BRANCH_ADMIN) {
            if (!user.branchIds || !user.branchIds.includes(branchId)) {
                throw new ForbiddenException('Access denied: Branch not assigned to admin');
            }
        } else if (user.role === USER_ROLES.STAFF || user.role === USER_ROLES.CUSTOMER) {
            if (user.branchId !== branchId) {
                throw new ForbiddenException('Access denied: Branch mismatch');
            }
        }
    }

    // Automatically inject branchId for STAFF if creating records
    if (user.role === USER_ROLES.STAFF && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
        if (!request.body.branch_id) {
            request.body.branch_id = user.branchId;
        }
    }

    return true;
  }
}
