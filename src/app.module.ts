import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from './tag/tag.module';
import ormConfig from './ormConfig';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TagModule, TypeOrmModule.forRoot(ormConfig)],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
