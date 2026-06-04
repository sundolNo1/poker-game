# Texas Hold'em Poker

친구들과 함께하는 텍사스 홀덤 포커 게임

## 로컬 실행

**서버:**
```bash
cd server
npm install
npm run dev
```

**클라이언트 (새 터미널):**
```bash
cd client
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 배포 방법

### 1. GitHub에 올리기
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_NAME/poker-game.git
git push -u origin main
```

### 2. 서버 배포 (Render - 무료)
1. render.com 접속 → New Web Service
2. GitHub 연결 → `poker-game` 선택
3. Root Directory: `server`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. 배포 후 URL 복사 (예: `https://poker-server-xxxx.onrender.com`)

### 3. 클라이언트 배포 (Vercel - 무료)
1. vercel.com 접속 → New Project
2. GitHub 연결 → `poker-game` 선택
3. Root Directory: `client`
4. Environment Variables 추가:
   - `VITE_SERVER_URL` = Render 서버 URL
5. Deploy

## 게임 방법
- 방장이 방을 만들고 방코드를 친구들에게 공유
- 친구들은 방코드로 입장
- 방장이 게임 시작 버튼 클릭
- 2~6명 플레이 가능
- 시작 칩: 1,000 · 블라인드: 10/20
