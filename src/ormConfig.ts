import { ConnectionOptions } from 'typeorm';
import { TagEntity } from './tag/tag.entity';
import { UserEntity } from './user/user.entity';
import { ArticleEntity } from './article/article.entity';

const config: ConnectionOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'mediumcloneuser',
    password: '8848',
    database: 'mediumclone',
    entities: [TagEntity, UserEntity, ArticleEntity],
    synchronize: false,
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    cli: {
        migrationsDir: 'src/migrations',
    },
};

export default config;
