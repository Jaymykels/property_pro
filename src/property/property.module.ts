import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { PropertyController } from './property.controller';
import { PropertySchema } from './property.model';
import { PropertyService } from './property.service';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    MailModule,
    UserModule,
    MongooseModule.forFeature([{ name: 'Property', schema: PropertySchema }]),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    }),
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
