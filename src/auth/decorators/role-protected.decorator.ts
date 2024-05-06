import { SetMetadata } from '@nestjs/common';
import { META_ROLES, ValidRoles } from '../enums/valid-roles';

export const RoleProtected = (...args: ValidRoles[]) =>
  SetMetadata(META_ROLES, args);
