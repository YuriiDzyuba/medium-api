import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { AuthGuard } from './guards/auth.guard';

@Module({
    controllers: [UserController],
    providers: [UserService, AuthGuard],
    imports: [TypeOrmModule.forFeature([UserEntity])],
    exports: [UserService],
})
export class UserModule {}
