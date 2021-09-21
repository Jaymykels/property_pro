import { HttpService } from '@nestjs/axios';
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
    private httpService: HttpService,
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
    });
    const result = await newProperty.save();
    this.logger.log(`Created property '${result._id}'`);

    if (!is_published) return result;

    this.updatePostPropertiesCache(result._id, publishedDate)

    return result;
  }

  async postProperty(property: Property): Promise<any> {
    const res = await this.httpService.post(process.env.POST_URL, property, { headers: { 'content-type': 'application/json'}}).toPromise()
    this.logger.debug(`post response ${JSON.stringify(res.data)}`)
  }

  @Cron('60 * * * * *')
  async publishProperty(): Promise<void> {
    let postProperties: string | undefined | Record<string, string> = await this.cacheManager.get('post-properties');
    if (!postProperties) return;
    postProperties = JSON.parse(postProperties as string) as Record<string, string>
    this.postPropertiesJson(postProperties)

    let emailProperties: string | undefined | Record<string, string> = await this.cacheManager.get('email-properties');
    if (!emailProperties) return;
    emailProperties = JSON.parse(emailProperties as string) as Record<string, string>
    this.sendPropertiesEmail(emailProperties)
  }
  
  async sendPropertiesEmail(propertiesCache: Record<string, string>): Promise<void> {
    this.logger.log(`Searching email properties`);
    Object.keys(propertiesCache).forEach(async (key) => {
      const today = new Date();
      const propertyDate = new Date(propertiesCache[key]);
      const interval = Number(process.env.EMAIL_INTERVAL);
      propertyDate.setTime(propertyDate.getTime() + interval * 60000);
  
      if (!(propertyDate <= today)) return;
  
      const property = await this.propertyModel.findOne({ _id: key });
      const user = await this.userService.getUser(property.user_id);
      await this.mailService.sendEmail(user, property);
  
      delete propertiesCache[key];
      const value = JSON.stringify(propertiesCache);
      await this.cacheManager.set('email-properties', value, { ttl: 1200 });
      this.logger.log(`Updating email cache with '${value}'`);
    });
  }

  async postPropertiesJson(propertiesCache: Record<string, string>): Promise<void> {
    this.logger.log(`Searching post properties`);
    
    Object.keys(propertiesCache).forEach(async (key) => {
      const today = new Date();
      const propertyDate = new Date(propertiesCache[key]);
      const interval = Number(process.env.POST_INTERVAL);
      propertyDate.setTime(propertyDate.getTime() + interval * 60000);
  
      if (!(propertyDate <= today)) return;
  
      const property = await this.propertyModel.findOne({ _id: key });
      this.postProperty(property)
      
      this.updateEmailPropertiesCache(key, propertiesCache[key])
      delete propertiesCache[key];
      const value = JSON.stringify(propertiesCache);
      await this.cacheManager.set('post-properties', value, { ttl: 1200 });
      this.logger.log(`Updating post cache with '${value}'`);
    });
  }
  
  async updateEmailPropertiesCache(key: string, value: string): Promise<void> {
    let emailPropertiesCache = JSON.parse(await this.cacheManager.get('email-properties')) || null;
    if (emailPropertiesCache) emailPropertiesCache[key] = value;
    else emailPropertiesCache = { [key]: value };
    const emailValue = JSON.stringify(emailPropertiesCache);
    await this.cacheManager.set('email-properties', emailValue, { ttl: 1200 });
    this.logger.log(`Updating email cache with '${emailValue}'`);
  }

  async updatePostPropertiesCache(key: string, value: string): Promise<void> {
    let postProperties =
      JSON.parse(await this.cacheManager.get('post-properties')) || null;
    if (postProperties) postProperties[key] = value;
    else postProperties = { [key]: value };
    const postValue = JSON.stringify(postProperties);
    await this.cacheManager.set('post-properties', postValue, { ttl: 1200 });
    this.logger.log(`Updating post cache with '${postValue}'`);
  }
}
