import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PropertyModule } from './property/property.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, PropertyModule, MongooseModule.forRoot('mongodb://root:password@localhost:27017/property_pro')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
