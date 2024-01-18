# 시작하기

Javascript Runtime 환경 구성을 위한 NodeJS 설치 필요

[https://nodejs.org/](https://nodejs.org/)

## 프로젝트 clone
```bash
git clone https://github.com/YeonHoo-Kim/kocham-scrapper.git
```

## 프로젝트 라이브러리 설치
```bash
npm install
```

## 크롤링 진행
### index.js에서 다음 입력 값 조절
```javascript
const START_ID = 1; // 시작 id
const END_ID = 5; // 종료 id
const interval = 10000; // 조회 주기 (ms 단위)
```
interval은 페이지 조회 마다 사이에 sleep 걸어두는 시간 (차단 방지 용도)

### 실행
```bash
node index.js
```