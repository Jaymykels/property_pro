import { Controller, Post, Body } from '@nestjs/common';
import { Property } from './property.model';
import { PropertyService } from './property.service';

@Controller('property')
export class PropertyController {
    constructor(private readonly propertyService: PropertyService){}

    @Post()
    async store(@Body() params: Property): Promise<Property> {
        return await this.propertyService.createProperty(params);
    }
}
