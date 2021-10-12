import { ArticleTypes } from './article.types';

export interface ArticlesResponseInterface {
    articles: ArticleTypes[];
    articlesCount: number;
}
