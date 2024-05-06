import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBookDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  name?: string;

  @IsDate()
  publishDate?: Date;
}
