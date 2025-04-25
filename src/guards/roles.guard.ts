import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Auth } from 'src/modules/auth/entities/auth.entity';

import { SecurityRoles } from 'src/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const ValidRoles: string[] = this.reflector.get<SecurityRoles[]>(
      'roles',
      context.getHandler(),
    );

    if (!ValidRoles || !ValidRoles.length) return true;

    const req = context.switchToHttp().getRequest(); // Get Request as make Express in Node Js
    const user = req.user as Auth; // this is an user as entity auth user

    if (!user) throw new UnauthorizedException('Not Valid User was found');

    for (const role of user.roles) {
      if (ValidRoles.includes(role)) return true;
    }

    throw new ForbiddenException(
      `User ${user.name} does not have one valid role [ ${ValidRoles} ]`,
    );
  }
}
