import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No es necesario verificar roles, permitir el acceso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new Error(' ⚠️ Usuario no autenticado ');

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole)
      throw new ForbiddenException(
        ' ⚠️ Acceso denegado: No tienes los permisos necesarios ',
      );

    return true; // El usuario tiene uno de los roles requeridos
  }
}
