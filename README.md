[![CircleCI](https://dl.circleci.com/status-badge/img/gh/dauletbaev/my-blog-backend/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/dauletbaev/my-blog-backend/tree/main)
[![Twitter][twitter-shield]][twitter-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]

## About The Project

This is my [blog](https://abat.me)'s backend source code. Repository bootstrapped with [NestJS](https://nestjs.com).

> NOTE: If you want to see frontend code checkout [this](https://github.com/dauletbaev/abat.me) repository.

App uses `@nestjs/platform-fastify` for performance reasons. [Prisma](https://prisma.io) for SQL database ORM.

> Disclaimer: This app using SQLite which you don't want to use in production environment. You can change it by removing `prisma/migrations` folder and changing `prisma/schema.prisma` provider to another alternatives. Then run `npm run db:migrate:deploy`

## Features

- Continuous Integration with [CircleCI](https://circleci.com)
- JWT authentication
- Role-based auth
- Upload files to AWS S3
- Send mails
- Google ReCaptcha integration
- Plausible analytics API

### Built With

- [![NestJS][nest]][nest-url]

## Acknowledgments

- [NestJS](https://nestjs.com)

[forks-shield]: https://img.shields.io/github/forks/dauletbaev/my-blog-backend
[forks-url]: https://github.com/dauletbaev/my-blog-backend/network/members
[stars-shield]: https://img.shields.io/github/stars/dauletbaev/my-blog-backend
[stars-url]: https://github.com/dauletbaev/my-blog-backend/stargazers
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/abat-dauletbaev-3b2654211
[twitter-shield]: https://img.shields.io/badge/-Twitter-black.svg?logo=twitter&colorB=555
[twitter-url]: https://twitter.com/abat_dauletbaev
[nest]: https://img.shields.io/badge/nestjs-20232A?style=for-the-badge&logo=nestjs
[nest-url]: https://nestjs.com
