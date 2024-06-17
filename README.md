# 🎥 MovieView
## 📝 프로젝트 시작 가이드
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
<br />

## ✨ 프로젝트 소개
- 영화 정보 조회와 리뷰 작성을 할 수 있는 웹 프로젝트.
- This is a website that provides movie information, as well as the ability to write reviews and ratings.
<br />

### 🔗 프로젝트 주소
- https://movieview.online

<br />

### 기술 스택
<div style='display: flex;'>
  <img src="https://img.shields.io/badge/Tailwind CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=white">
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=Redis&logoColor=white"> 
  <img src="https://img.shields.io/badge/Next-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  <img src="https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white">
</div>

<br />

### 개발 기간 & 팀원 소개
- 개발 기간 : 3주
- 팀원
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/jeong922"><img src="https://item.kakaocdn.net/do/b5d3d6a7b67fbf5afdaffb79fffbf8b18f324a0b9c48f77dbce3a43bd11ce785" width="100px;" alt=""/><br /><sub><b>이화정 </b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/jh0222"><img src="https://item.kakaocdn.net/do/47112f1ae6f87f4323cb73f65a8c5424f604e7b0e6900f9ac53a43965300eb9a" width="100px;" alt=""/><br /><sub><b>서지현 </b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/choongnyeong6215"><img src="https://avatars.githubusercontent.com/u/138146406?v=4" width="100px;" alt=""/><br /><sub><b>이충녕 </b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/7jw92nVd1kLaq1"><img src="https://avatars.githubusercontent.com/u/75822302?v=4" width="100px;" alt=""/><br /><sub><b>위수종 </b></sub></a><br /></td>
     <tr/>
  </tbody>
</table>
<br />

## ✅ 주요 기능
- 로그인/로그아웃
- 영화 목록 보기
    - 무한 스크롤
- 영화 검색
    - 실시간 검색처럼
    - 한번에 너무 많은 data 요청 안 되게 하기
- 영화 상세 정보
- 리뷰 목록 보기/등록/수정/삭제
    - 리뷰 목록 무한 스크롤
- 리뷰 좋아요 기능
<br />

## 🖥️ 화면 구성
### 첫 화면
<img src="https://github.com/MovieView/Movie_View/assets/70255311/95e9d83c-5f6f-48eb-aa8f-a467384e5b90" width="800px;">

### 로그인 화면
<img src="https://github.com/MovieView/Movie_View/assets/70255311/67088ae8-1e8d-4383-b338-6cf827690a2a" width="800px;">

### 디테일 화면
<img src="https://github.com/MovieView/Movie_View/assets/70255311/13d2f329-2918-4dba-9a3a-4d5f2199c812" width="800px;">

### 디테일 화면 - 리뷰
<img src="https://github.com/MovieView/Movie_View/assets/70255311/cc1fa62b-3ea7-45f9-a25e-98c9ac2d2c8b" width="500px;">
<br />

## 참고 주소
🔗 [https://prgrms.notion.site/team7-c547a575d92f40fa99a854ddaeed4542](https://prgrms.notion.site/Movie-view-5f8ab3dce4e5454aa50281b5939364ff)

