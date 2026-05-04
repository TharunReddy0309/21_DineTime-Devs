import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const role = request.headers.role as string | undefined;

    if (!role) {
      throw new ForbiddenException('Missing role header');
    }

    if (role === Role.SUPER_USER) {
      return true;
    }

    if (!requiredRoles.includes(role as Role)) {
      throw new ForbiddenException('Role is not allowed for this resource');
    }

    return true;
  }
}
