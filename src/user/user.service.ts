import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>){}

  async getUser(id: string): Promise<User> {
    let user;
    try {
      user = await this.userModel.findOne({ _id: id})
    } catch (error) {
      throw new NotFoundException('Could not find user');
    }
    return user
  }
}
