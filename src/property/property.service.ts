import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'
import { Property } from './property.model';

@Injectable()
export class PropertyService {
  constructor(@InjectModel('Property') private readonly propertyModel: Model<Property>) { }

  async createProperty(property: Property): Promise<Property> {
    let is_published = false
    if(property.user_id && property.name && property.address && property.type && property.description && property.image_url && property.total_rooms && property.occupancy_type && property.rent_amount && property.rent_frequency)
      is_published = true
    const newProperty = new this.propertyModel({ ...property, is_published });
    const result = await newProperty.save();
    return result
  }
}
