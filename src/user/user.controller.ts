import {
    Controller,
    Post,
    Body,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/loginUser.dto';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('user')
    @UsePipes(new ValidationPipe())
    async create(
        @Body('user') createUserDto: CreateUserDto
    ): Promise<UserResponseInterface> {
        const user = await this.userService.create(createUserDto);
        return this.userService.buildUserResponse(user);
    }

    @Post('login')
    @UsePipes(new ValidationPipe())
    async login(
        @Body('user') loginUserDto: LoginUserDto
    ): Promise<UserResponseInterface> {
        const user = await this.userService.login(loginUserDto);
        return this.userService.buildUserResponse(user);
    }
}
