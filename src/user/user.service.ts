import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from 'src/config';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/loginUser.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    findUserById(id: number): Promise<UserEntity> {
        return this.userRepository.findOne(id);
    }

    async updateUser(
        userId: number,
        updateUserDto: UpdateUserDto
    ): Promise<UserEntity> {
        const userToUpdate = await this.userRepository.findOne(userId);
        const updatedUser = await this.userRepository.save({
            ...userToUpdate,
            ...updateUserDto,
        });
        return updatedUser;
    }

    async create(createUserDto: CreateUserDto): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOne({
            email: createUserDto.email,
        });

        const userByUsername = await this.userRepository.findOne({
            email: createUserDto.username,
        });

        if (userByEmail || userByUsername) {
            throw new HttpException(
                { message: 'user exists' },
                HttpStatus.UNPROCESSABLE_ENTITY
            );
        }

        const newUser = new UserEntity();
        Object.assign(newUser, createUserDto);
        return await this.userRepository.save(newUser);
    }

    async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOne(
            {
                email: loginUserDto.email,
            },
            { select: ['id', 'username', 'email', 'bio', 'image', 'password'] }
        );

        if (!userByEmail) {
            throw new HttpException(
                {
                    message: `user with email: ${loginUserDto.email} is not exist`,
                },
                HttpStatus.BAD_REQUEST
            );
        }

        const isPasswordCorrect = await compare(
            loginUserDto.password,
            userByEmail.password
        );

        if (!isPasswordCorrect) {
            throw new HttpException(
                { message: 'wrong password' },
                HttpStatus.FORBIDDEN
            );
        }

        delete userByEmail.password;
        return userByEmail;
    }

    generateJwt(user: UserEntity): string {
        return sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            JWT_SECRET
        );
    }

    buildUserResponse(user: UserEntity): UserResponseInterface {
        return {
            user: {
                ...user,
                token: this.generateJwt(user),
            },
        };
    }
}
