import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileType } from './types/profile.type';
import { ProfileResponseInterface } from './types/profileResponse.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { Repository } from 'typeorm';
import { FollowEntity } from './follow.entity';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(FollowEntity)
        private readonly followRepository: Repository<FollowEntity>
    ) {}

    async findOneProfile(
        currentUserId: number,
        profileUserName: string
    ): Promise<ProfileType> {
        const user = await this.userRepository.findOne({
            username: profileUserName,
        });

        if (!user) {
            throw new HttpException(
                'profile does not exist',
                HttpStatus.NOT_FOUND
            );
        }

        const follow = await this.followRepository.findOne({
            followerId: currentUserId,
            followingId: user.id,
        });

        return { ...user, following: !!follow };
    }

    async followProfile(
        currentUserId: number,
        profileUserName: string
    ): Promise<ProfileType> {
        const user = await this.userRepository.findOne({
            username: profileUserName,
        });

        if (!user) {
            throw new HttpException(
                'profile does not exist',
                HttpStatus.NOT_FOUND
            );
        }

        if (user.id === currentUserId) {
            throw new HttpException(
                "follower and following can't be equal",
                HttpStatus.BAD_REQUEST
            );
        }

        const follow = await this.followRepository.findOne({
            followerId: currentUserId,
            followingId: user.id,
        });

        if (!follow) {
            const followToCreate = new FollowEntity();
            followToCreate.followerId = currentUserId;
            followToCreate.followingId = user.id;
            await this.followRepository.save(followToCreate);
        }

        return { ...user, following: true };
    }

    async unFollowProfile(
        currentUserId: number,
        profileUserName: string
    ): Promise<ProfileType> {
        const user = await this.userRepository.findOne({
            username: profileUserName,
        });

        if (!user) {
            throw new HttpException(
                'profile does not exist',
                HttpStatus.NOT_FOUND
            );
        }

        if (user.id === currentUserId) {
            throw new HttpException(
                'you cant unfollow your own profile',
                HttpStatus.BAD_REQUEST
            );
        }

        await this.followRepository.delete({
            followerId: currentUserId,
            followingId: user.id,
        });

        return { ...user, following: false };
    }

    update(id: number, updateProfileDto: UpdateProfileDto) {
        return `This action updates a #${id} profile`;
    }

    remove(id: number) {
        return `This action removes a #${id} profile`;
    }

    buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
        delete profile.email;
        return { profile };
    }
}
