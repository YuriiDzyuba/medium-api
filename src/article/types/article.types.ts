import { ArticleEntity } from '../article.entity';

export type ArticleTypes = Omit<ArticleEntity, 'updateTimeStamp'>;
