import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommandModule } from 'nestjs-command';
import { UserCommand } from 'src/user/user.command';
import { UserSchema } from './user.model';
import { UserService } from './user.service';

@Module({
  imports: [
    CommandModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [],
  providers: [UserService, UserCommand],
  exports: [UserService],
})
export class UserModule {}
