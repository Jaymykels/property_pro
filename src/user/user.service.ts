import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Exception } from 'handlebars';
import { Model } from 'mongoose';
import { User } from './user.model';

interface UserPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}
@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async getUser(id: string): Promise<User> {
    let user;
    try {
      user = await this.userModel.findOne({ _id: id });
    } catch (error) {
      throw new NotFoundException('Could not find user');
    }
    return user;
  }

  async createUser(user: UserPayload): Promise<User> {
    let result;
    try {
      result = await this.userModel.create(user);
    } catch (error) {
      throw new Exception(error);
    }
    return result;
  }
}
