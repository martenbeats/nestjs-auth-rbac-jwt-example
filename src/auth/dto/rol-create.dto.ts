import { UserCreateDto } from './user-create.dto';
import { IsNumber, IsString } from 'class-validator';

export class RolCreateDto {
  @IsNumber()
  id?: number;

  @IsString()
  name?: string;

  users?: UserCreateDto[];
}
