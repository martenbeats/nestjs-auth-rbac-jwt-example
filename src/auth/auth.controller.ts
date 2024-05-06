import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserCreateDto, UserLoginDto } from './dto';
import { ValidRoles } from './enums/valid-roles';
import { Authorization } from './decorators';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createAuthDto: UserCreateDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('login')
  login(@Body() userLoginDto: UserLoginDto) {
    return this.authService.login(userLoginDto);
  }

  @Get('guardtest')
  @Authorization(ValidRoles.guest)
  guardTest() {
    return {
      ok: true,
      message: 'ruta privada',
    };
  }
}
