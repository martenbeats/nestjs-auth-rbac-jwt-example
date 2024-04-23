import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('seed')
@ApiTags('Seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get('user')
  seedUsers() {
    return this.seedService.seedUsers();
  }

  @Get('role')
  seedRoles() {
    return this.seedService.seedRoles();
  }
  @Get('book')
  seedBook() {
    return this.seedService.seedBook();
  }
}
