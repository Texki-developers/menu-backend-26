import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class OrganizationScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.organizationId) {
      throw new ForbiddenException('User organization context missing');
    }

    const orgId = request.body?.organization_id || request.query?.organization_id || request.params?.organization_id;

    // If organization_id is provided in the request, it MUST match the user's organizationId
    if (orgId && user.organizationId !== orgId) {
      throw new ForbiddenException('Access denied: Organization mismatch');
    }

    // Automatically inject organizationId into body if not present for creating/updating records
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      if (request.body && !request.body.organization_id) {
        request.body.organization_id = user.organizationId;
      }
    }

    // Automatically inject organizationId into query if not present for GET requests
    if (request.method === 'GET') {
      if (request.query && !request.query.organization_id) {
        request.query.organization_id = user.organizationId;
      }
    }

    return true;
  }
}
