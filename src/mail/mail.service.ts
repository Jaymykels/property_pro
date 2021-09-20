import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Property } from 'src/property/property.model';
import { User } from 'src/user/user.model';

@Injectable()
export class MailService {
  constructor(@InjectQueue('queue_name') private mailQueue: Queue) {}

  /** Send email confirmation link to new user account. */
  async sendEmail(user: User, property: Property): Promise<boolean> {
    try {
      await this.mailQueue.add('notification', {
        user,
        property,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
