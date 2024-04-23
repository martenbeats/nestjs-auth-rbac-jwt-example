import { RolCreateDto } from './rol-create.dto';

export class UserCreateDto {
  id?: number;

  email?: string;

  username?: string;

  password?: string;

  rolId?: number;

  rol?: RolCreateDto;
}
