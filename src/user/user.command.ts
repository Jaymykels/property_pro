import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class UserCommand {
  constructor(private readonly userService: UserService) {}

  @Command({ command: 'seed:user', describe: 'create dummy user in database' })
  async create() {
    console.log('seeding data');
    const user = await this.userService.createUser({
      first_name: 'John',
      last_name: 'Doe',
      email: 'johnd@gmail.com',
      phone: '08012345678',
    });
    console.log(user);
  }
}
