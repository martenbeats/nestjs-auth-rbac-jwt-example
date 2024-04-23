import { Injectable } from '@nestjs/common';
import { UserLoginDto } from './dto/user-login.dto';
import { UserCreateDto } from './dto/user-create.dto';

@Injectable()
export class AuthService {
  register(userCreateDto: UserCreateDto) {
    return 'This action adds a new auth';
  }

  login(userLoginDto: UserLoginDto) {
    return `This action returns all auth`;
  }
}
