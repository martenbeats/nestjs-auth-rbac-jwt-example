import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLoginDto } from './dto/user-login.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private repositoryUser: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(userCreateDto: UserCreateDto) {
    const { password, ...userWithoutPass } = userCreateDto;

    const user = this.repositoryUser.create({
      ...userWithoutPass,
      password: bcrypt.hashSync(password, 10),
    });

    await this.repositoryUser.save(user);

    return {
      userWithoutPass,
      token: this.getJwt({
        id: userWithoutPass.id,
      }),
    };
  }

  async login(userLoginDto: UserLoginDto) {
    const user = await this.repositoryUser.findOne({
      where: {
        username: userLoginDto.username,
      },
      relations: {
        rol: true,
      },
    });

    if (!user) throw new NotFoundException(`user not found`);

    const isPasswordMatch = bcrypt.compareSync(
      userLoginDto.password,
      user.password,
    );

    if (!isPasswordMatch) throw new ForbiddenException(`Invalid credentials`);

    const { password, ...userWithoutPass } = user;

    return {
      ...userWithoutPass,
      token: this.getJwt({
        id: userWithoutPass.id,
      }),
    };
  }

  private getJwt(payload: JwtPayloadDto) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
