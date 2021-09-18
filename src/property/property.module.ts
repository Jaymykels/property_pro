import { Module } from '@nestjs/common';
import { MongooseModule  } from '@nestjs/mongoose'
import { PropertyController } from './property.controller';
import { PropertySchema } from './property.model';
import { PropertyService } from './property.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Property', schema: PropertySchema}])],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
