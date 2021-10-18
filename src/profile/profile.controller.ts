import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    Delete,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../user/decorators/user.decorator';
import { ProfileResponseInterface } from './types/profileResponse.interface';
import { AuthGuard } from '../user/guards/auth.guard';

@Controller('profiles')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get(':username')
    async findOneProfile(
        @User('id') currentUserId: number,
        @Param('username') profileUserName: string
    ): Promise<ProfileResponseInterface> {
        const profile = await this.profileService.findOneProfile(
            currentUserId,
            profileUserName
        );
        return this.profileService.buildProfileResponse(profile);
    }

    @Post(':username/follow')
    @UseGuards(AuthGuard)
    async followProfile(
        @User('id') currentUserId: number,
        @Param('username') profileUserName: string
    ): Promise<ProfileResponseInterface> {
        const profile = await this.profileService.followProfile(
            currentUserId,
            profileUserName
        );
        return this.profileService.buildProfileResponse(profile);
    }

    @Delete(':username/follow')
    @UseGuards(AuthGuard)
    async unFollowProfile(
        @User('id') currentUserId: number,
        @Param('username') profileUserName: string
    ): Promise<ProfileResponseInterface> {
        const profile = await this.profileService.unFollowProfile(
            currentUserId,
            profileUserName
        );
        return this.profileService.buildProfileResponse(profile);
    }

    @Patch(':id')
    updateProfile(
        @Param('id') id: string,
        @Body() updateProfileDto: UpdateProfileDto
    ) {
        return this.profileService.update(+id, updateProfileDto);
    }

    @Delete(':id')
    removeProfile(@Param('id') id: string) {
        return this.profileService.remove(+id);
    }
}
