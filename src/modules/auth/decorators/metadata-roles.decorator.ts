import { SetMetadata } from '@nestjs/common';
import { SecurityRoles } from 'src/enums/auth/security-roles.enum';

export const MetadataRoles = (...args: SecurityRoles[]) => {
  return SetMetadata('roles', args);
};
