import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayloadDto } from '../dto';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly repositoryUser: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `${configService.get('JWT_SECRET')}`,
    });
  }

  //create custom validation in validate function
  async validate(payload: JwtPayloadDto): Promise<User> {
    const { id } = payload;

    const user: User = await this.repositoryUser.findOne({
      where: {
        id: id,
      },
      relations: {
        rol: true,
      },
    });

    //put your validations
    if (!user) throw new UnauthorizedException(`Invalid token`);

    return user;
  }
}
