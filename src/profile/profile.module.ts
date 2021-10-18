import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { FollowEntity } from './follow.entity';

@Module({
    controllers: [ProfileController],
    providers: [ProfileService],
    imports: [TypeOrmModule.forFeature([UserEntity, FollowEntity])],
})
export class ProfileModule {}
