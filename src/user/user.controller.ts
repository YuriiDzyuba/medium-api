import {
    Controller,
    Post,
    Body,
    UsePipes,
    ValidationPipe,
    Get,
    UseGuards,
    Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/loginUser.dto';
import { User } from './decorators/user.decorator';
import { UserEntity } from './user.entity';
import { AuthGuard } from './guards/auth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('users')
    @UsePipes(new ValidationPipe())
    async create(
        @Body('user') createUserDto: CreateUserDto
    ): Promise<UserResponseInterface> {
        const user = await this.userService.create(createUserDto);

        return this.userService.buildUserResponse(user);
    }

    @Post('users/login')
    @UsePipes(new ValidationPipe())
    async login(
        @Body('user') loginUserDto: LoginUserDto
    ): Promise<UserResponseInterface> {
        const user = await this.userService.login(loginUserDto);

        return this.userService.buildUserResponse(user);
    }

    @Get('user')
    @UseGuards(AuthGuard)
    async currentUser(
        @User() user: UserEntity
    ): Promise<UserResponseInterface> {
        return this.userService.buildUserResponse(user);
    }

    @Put('user')
    @UseGuards(AuthGuard)
    async updateCurrentUser(
        @User('id') currentUserId: number,
        @Body('user') updateUserDto: UpdateUserDto
    ): Promise<UserResponseInterface> {
        const updatedUser = await this.userService.updateUser(
            currentUserId,
            updateUserDto
        );
        return this.userService.buildUserResponse(updatedUser);
    }
}
