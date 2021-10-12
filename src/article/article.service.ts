import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '../user/user.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleEntity } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import e from 'express';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async findAllArticles(
        currentUserId: number,
        query: any
    ): Promise<ArticlesResponseInterface> {
        const queryBuilder = getRepository(ArticleEntity)
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author');

        if (query.tag) {
            queryBuilder.andWhere('articles.tagList LIKE :tag', {
                tag: `%${query.tag}%`,
            });
        }

        if (query.quthor) {
            const author = await this.userRepository.findOne({
                username: query.author,
            });
            queryBuilder.andWhere('articles.authorId = :id', {
                id: author.id,
            });
        }

        if (query.favorited) {
            const author = await this.userRepository.findOne(
                {
                    username: query.favorited,
                },
                { relations: ['favorites'] }
            );
            const ids = author.favorites.map((el) => el.id);

            if (ids.length > 0) {
                queryBuilder.andWhere('articles.authorId IN (:...ids)', {
                    ids,
                });
            } else {
                queryBuilder.andWhere('1=0');
            }
        }

        if (query.limit) {
            queryBuilder.limit(query.limit);
        }

        if (query.offset) {
            queryBuilder.offset(query.offset);
        }

        let favoriteIds: number[] = [];

        if (favoriteIds) {
            const currentUser = await this.userRepository.findOne(
                currentUserId,
                { relations: ['favorites'] }
            );
            favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
        }

        const articles = await queryBuilder.getMany();
        const articlesCount = await queryBuilder.getCount();
        const articlesWithFavorites = articles.map((article) => {
            const favorited = favoriteIds.includes(article.id);
            return { ...article, favorited };
        });

        return { articles: articlesWithFavorites, articlesCount };
    }

    async createArticle(
        currentUser: UserEntity,
        createArticleDto: CreateArticleDto
    ): Promise<ArticleEntity> {
        const article = new ArticleEntity();
        Object.assign(article, createArticleDto);

        if (!article.tagList) {
            article.tagList = [];
        }

        article.slug = this.getSlug(createArticleDto.title);

        article.author = currentUser;

        return await this.articleRepository.save(article);
    }

    async updateArticle(
        slug: string,
        updateArticleDto: CreateArticleDto,
        currentUserId: number
    ): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);

        if (!article) {
            throw new HttpException(
                "article doesn't exist",
                HttpStatus.NOT_FOUND
            );
        }

        if (article.author.id !== currentUserId) {
            throw new HttpException('access denied ', HttpStatus.FORBIDDEN);
        }

        return await this.articleRepository.save({
            ...article,
            ...updateArticleDto,
        });
    }

    async findBySlug(slug: string): Promise<ArticleEntity> {
        return await this.articleRepository.findOne({ slug });
    }

    async deleteArticle(
        slug: string,
        currentUserId: number
    ): Promise<DeleteResult> {
        const article = await this.findBySlug(slug);

        if (!article) {
            throw new HttpException(
                "article doesn't exist",
                HttpStatus.NOT_FOUND
            );
        }

        if (article.author.id !== currentUserId) {
            throw new HttpException('access denied ', HttpStatus.FORBIDDEN);
        }

        return await this.articleRepository.delete({ slug });
    }

    buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
        return { article };
    }

    async addArticleToFavorites(
        slug: string,
        currentUserId: number
    ): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);
        const user = await this.userRepository.findOne(currentUserId, {
            relations: ['favorites'],
        });

        const isNotFavorite =
            user.favorites.findIndex(
                (articleInFavorites) => articleInFavorites.id === article.id
            ) === -1;

        if (isNotFavorite) {
            user.favorites.push(article);
            article.favoriteCount++;
            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }
        return article;
    }

    async deleteArticleToFavorites(
        slug: string,
        currentUserId: number
    ): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);
        const user = await this.userRepository.findOne(currentUserId, {
            relations: ['favorites'],
        });

        const articleIndex = user.favorites.findIndex(
            (articleInFavorites) => articleInFavorites.id === article.id
        );

        if (articleIndex >= 0) {
            user.favorites.splice(articleIndex, 1);
            article.favoriteCount--;
            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }
        return article;
    }

    private getSlug(title: string): string {
        return (
            slugify(title, { lower: true }) +
            '-' +
            ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
        );
    }
}
