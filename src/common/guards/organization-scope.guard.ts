import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class OrganizationScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.organizationId) {
      throw new ForbiddenException('User organization context missing');
    }

    const orgId = request.body.organization_id || request.query.organization_id || request.params.organization_id;

    if (orgId && user.organizationId !== orgId) {
      throw new ForbiddenException('Access denied: Organization mismatch');
    }

    // Automatically inject organizationId into body if not present for creating records
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      if (!request.body.organization_id) {
        request.body.organization_id = user.organizationId;
      }
    }

    return true;
  }
}
