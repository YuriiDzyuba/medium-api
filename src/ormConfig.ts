import { ConnectionOptions } from 'typeorm';
import { TagEntity } from './tag/tag.entity';

const config: ConnectionOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'mediumcloneuser',
    password: '8848',
    database: 'mediumclone',
    entities: [TagEntity],
    synchronize: false,
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    cli: {
        migrationsDir: 'src/migrations',
    },
};

export default config;
