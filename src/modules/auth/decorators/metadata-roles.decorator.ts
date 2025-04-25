import { SetMetadata } from '@nestjs/common';
import { SecurityRoles } from 'src/enums';

export const MetadataRoles = (...args: SecurityRoles[]) => {
  return SetMetadata('roles', args);
};
