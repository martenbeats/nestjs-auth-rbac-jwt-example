import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../auth/entities/rol.entity';
import { User } from '../auth/entities/user.entity';
import { rolSeed } from './data/data-seed';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { Book } from '../book/entities/book.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Rol) private repositoryRol: Repository<Rol>,
    @InjectRepository(User) private repositoryUser: Repository<User>,
    @InjectRepository(Book) private repositoryBook: Repository<Book>,
  ) {}

  async seedUsers() {
    const userData: User[] = [];

    for (let i = 0; i < 10; i++) {
      const user = new User();

      const rolId = this.getRandomIntInclusive(1, 3);

      user.username = faker.internet.userName();
      user.email = faker.internet.email();
      user.password = bcrypt.hashSync('secret', 10);
      user.active = true;
      user.rolId = rolId;

      userData.push(user);
    }

    try {
      await this.repositoryUser.save(userData);
      Logger.log('Data seeded successfully');
    } catch (error) {
      Logger.error(`Error seeding data: ${error.message}`, error.stack);
    }
  }

  async seedRoles() {
    try {
      await this.repositoryRol.save(rolSeed);
      Logger.log('Data seeded successfully');
    } catch (error) {
      Logger.error(`Error seeding data: ${error.message}`, error.stack);
    }

    Logger.log('Data seeded successfully');
  }

  async seedBook() {
    const bookData: Book[] = [];

    for (let i = 0; i < 10; i++) {
      const book = new Book();

      book.name = faker.lorem.words(3);
      book.publishDate = faker.date.anytime();

      bookData.push(book);
    }

    try {
      await this.repositoryBook.save(bookData);
      Logger.log('Data seeded successfully');
    } catch (error) {
      Logger.error(`Error seeding data: ${error.message}`, error.stack);
    }

    Logger.log('Data seeded successfully');
  }

  getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
