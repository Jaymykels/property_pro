import { MailerService } from '@nestjs-modules/mailer';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Property } from 'src/property/property.model';
import { User } from 'src/user/user.model';

@Processor('queue_name')
export class MailProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly mailerService: MailerService) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(
        job.data,
      )}`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.debug(
      `Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(
        result,
      )}`,
    );
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }

  @Process('notification')
  async sendNotificationEmail(
    job: Job<{ user: User; property: Property }>,
  ): Promise<any> {
    this.logger.log(`Sending notification email to '${job.data.user.email}'`);

    const { user, property } = job.data;
    delete user._id;
    delete property._id;
    delete property.publishedDate;
    delete property.__v;
    delete user.__v;
    delete property.user_id;

    try {
      const result = await this.mailerService.sendMail({
        template: './notification',
        context: {
          user,
          property,
        },
        subject: `Property notification.`,
        to: process.env.METRICS_EMAIL,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send notification email to '${job.data.user.email}'`,
        error.stack,
      );
      throw error;
    }
  }
}
