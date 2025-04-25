import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth } from 'src/modules/auth/entities/auth.entity';
import { SecurityRoles } from 'src/enums';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as Auth; // this is an user as entity auth user

    try {
      if (!user.roles.includes(SecurityRoles.SUPER_ADMIN)) {
        throw new UnauthorizedException(
          'Se ocupa ser SUPER_ADMIN para acceder a este recurso.',
        );
      }
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }

    return true;
  }
}
