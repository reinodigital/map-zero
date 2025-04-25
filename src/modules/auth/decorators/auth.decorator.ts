import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RolesGuard } from 'src/guards/roles.guard';
import { MetadataRoles } from './metadata-roles.decorator';
import { SecurityRoles } from 'src/enums/auth/security-roles.enum';

export const AuthDecorator = (...roles: SecurityRoles[]) => {
  return applyDecorators(
    MetadataRoles(...roles), // Decorator to establish Roles in Metadata
    UseGuards(
      AuthGuard(), // default guard of nestjs/passport who check user token
      RolesGuard,
    ),
  );
};
