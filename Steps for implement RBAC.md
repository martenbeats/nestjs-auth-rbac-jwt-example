## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Packages  

```bash
$ npm install @nestjs/jwt @nestjs/passport passport-jwt passport class-validator class-transformer @nestjs/swagger @nestjs/typeorm typeorm [your_db_driver]
```

```bash
$ npm install --save-dev @types/passport-jwt
```

```typescript
//src/app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedModule } from './seed/seed.module';
import { BookModule } from './book/book.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      options: {
        // MSSQL-specific option
        encrypt: false,
      },
      //use this with development environment
      synchronize: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    AuthModule,
    SeedModule,
    BookModule,
  ],
  exports: [ConfigModule],
})
export class AppModule {}


```

````typescript
//src/auth/enums/valid-roles.ts
export enum ValidRoles {
  admin = 'Admin',
  moderator = 'Moderator',
  guest = 'Guest',
}

export const META_ROLES = 'roles';


````

### 1- Import modules PassportModule and JwtModule
```typescript 
//src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: `${configService.get('TOKEN_EXPIRE')}`,
          },
        };
      },
    }),
  ],
  exports: [PassportModule, JwtModule, TypeOrmModule],
  providers: [AuthService],
})
export class AuthModule {}

```

### 2- Create strategies

```typescript
//src/auth/jwt.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly repositoryUser: Repository<User>,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  //create custom validation in validate function
  async validate(payload: JwtPayloadDto): Promise<User> {
    const { id } = payload;

    const user = await this.repositoryUser.findOne({
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
```
### 3- Add your custom strategy to providers module
```typescript
//src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: `${configService.get('TOKEN_EXPIRE')}`,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}

```

### 4- Create customs guards and decorators for RBAC

```typescript
//src/auth/decorators/role-protected.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { META_ROLES, ValidRoles } from '../enums/valid-roles';

export const RoleProtected = (...args: ValidRoles[]) =>
  SetMetadata(META_ROLES, args);

```

````typescript
//src/auth/guards/user-role.guard.ts

import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { User } from '../entities/user.entity';
import { META_ROLES } from '../enums/valid-roles';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('user role guard');
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) throw new BadRequestException('User not found');

    if (validRoles.includes(user.rol.name)) {
      return true;
    }

    throw new ForbiddenException(
      `User doesn't have a valid rol: [${validRoles}]`,
    );
  }
}

````

````typescript
//src/auth/decorators/authorization.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '../enums/valid-roles';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';

export const Authorization = (...roles: ValidRoles[]) => {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
};

````

### 5- Decorate your routes in your controller using Authorization decorator

````typescript
//src/auth/auth.controller.ts

@Get('guardtest')
@Authorization(ValidRoles.guest)
guardTest() {
  return {
    ok: true,
    message: 'ruta privada',
  };
}

````