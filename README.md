This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Movie_View

## 프로젝트 소개 (Description)

- 영화 정보 조회와 리뷰 작성을 할 수 있는 웹 프로젝트.
- This is a website that provides movie information, as well as the ability to write reviews and ratings.

## 기술 스택 (Tech Stack)

- Frontend: Next.js, TypeScript, Tailwind CSS, TanStack Query
- Backend: Node.js, MariaDB, Redis

## 설치 (Installation)

### 패키지 설치

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### .env 설정

```
DATABASE_HOST=**<DB 아이피>**
DATABASE_PORT=**<DB 포트>**
DATABASE_USER=**<DB 유저>**
DATABASE_PASSWORD=**<DB 유저 비밀번호>**
DATABASE_NAME=**<DB 이름>**

## Redis
REDIS_URL=**<Redis URL>**

## TMDB
TMDB_API_KEY=**<TMDB API KEY>**
TMDB_ACCESS_TOKEN=**<TMDB ACCESS TOKEN>**
```
* 설치 전에 .env 파일을 생성하고 위와 같이 설정해주세요.
  * Before the installation, create a .env file in the root of the project, and set it up as above.

* TMDB API KEY는 [TMDB](https://www.themoviedb.org/)에서 발급받을 수 있습니다.
  * You can get the TMDB API KEY from [TMDB](https://www.themoviedb.org/).

* DB 관련 정보는 보안을 위해 설정하지 않았습니다. 직접 설정해주세요.
  * For security reasons, we did not set up the DB information. Please set it up yourself. 
  * Contact us for the information on the schema and tables.