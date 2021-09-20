import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { Property } from './property.model';

@Injectable()
export class PropertyService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectModel('Property') private readonly propertyModel: Model<Property>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  async createProperty(property: Property): Promise<Property> {
    let is_published = false;
    let publishedDate = null;
    const today = new Date();

    if (
      property.user_id &&
      property.name &&
      property.address &&
      property.type &&
      property.description &&
      property.image_url &&
      property.total_rooms &&
      property.occupancy_type &&
      property.rent_amount &&
      property.rent_frequency
    )
      is_published = true;

    if (is_published) publishedDate = today.toString();

    const newProperty = new this.propertyModel({
      ...property,
      is_published,
      publishedDate,
    });
    const result = await newProperty.save();
    this.logger.log(`Created property '${result._id}'`);

    if (!is_published) return result;

    let emailProperties =
      JSON.parse(await this.cacheManager.get('email-properties')) || null;
    if (emailProperties) emailProperties[result._id] = result.publishedDate;
    else emailProperties = { [result._id]: result.publishedDate };
    const value = JSON.stringify(emailProperties);
    await this.cacheManager.set('email-properties', value, { ttl: 300 });

    this.logger.log(`Updating cache with '${value}'`);
    return result;
  }

  @Cron('60 * * * * *')
  async publishProperty(): Promise<void> {
    const emailProperties =
      JSON.parse(await this.cacheManager.get('email-properties')) || null;
    if (!emailProperties) return;
    this.logger.log(`Searching email properties`);

    Object.keys(emailProperties).forEach(async (key) => {
      const today = new Date();
      const propertyDate = new Date(emailProperties[key]);
      const interval = Number(process.env.EMAIL_INTERVAL);
      propertyDate.setTime(propertyDate.getTime() + interval * 60000);

      if (!(propertyDate <= today)) return;

      const property = await this.propertyModel.findOne({ _id: key });
      const user = await this.userService.getUser(property.user_id);
      await this.mailService.sendEmail(user, property);

      delete emailProperties[key];
      const value = JSON.stringify(emailProperties);
      await this.cacheManager.set('email-properties', value, { ttl: 300 });
      this.logger.log(`Updating cache with '${value}'`);
    });
  }
}
