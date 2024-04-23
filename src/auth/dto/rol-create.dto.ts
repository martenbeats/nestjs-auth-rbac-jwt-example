import { UserCreateDto } from './user-create.dto';

export class RolCreateDto {
  id?: number;

  name?: string;

  users?: UserCreateDto[];
}
