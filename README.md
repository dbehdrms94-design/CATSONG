# 🎨 CatSong AI - AI 콘텐츠 생성 플랫폼

AI를 활용하여 이미지, 모델, 동영상을 생성하고 홍보하는 웹사이트입니다.

## ✨ 주요 기능

- 🖼️ **이미지 생성** - 텍스트 설명으로부터 고급 AI 이미지 생성
- 🤖 **AI 모델** - 다양한 AI 모델을 활용한 스마트 분석
- 🎬 **동영상 생성** - AI로 전문적인 동영상 콘텐츠 제작

## ☁️ Cloudflare Pages 배포 (Full-stack)

이 프로젝트는 Cloudflare Pages를 통해 정적 파일과 API(Functions)를 모두 배포할 수 있도록 구성되어 있습니다.

### 배포 방법

1.  **Cloudflare Pages 연결:**
    *   Cloudflare 대시보드에서 **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**을 선택합니다.
    *   GitHub 저장소를 연결합니다.

2.  **빌드 설정:**
    *   **Framework preset:** None (또는 빈 값)
    *   **Build command:** (비워둠)
    *   **Build output directory:** `public`

3.  **환경 변수 설정:**
    *   배포 설정의 **Settings** > **Functions** > **Environment variables**에서 `GEMINI_API_KEY`를 추가합니다.

4.  **Wrangler로 로컬 테스트:**
    ```bash
    npx wrangler pages dev public
    ```

## 📁 프로젝트 구조

```
catsong/
├── public/
│   ├── index.html      # 메인 HTML 파일
│   ├── style.css       # 스타일시트
│   └── script.js       # 클라이언트 JavaScript
├── server.js           # Node.js 백엔드 서버
├── package.json        # 프로젝트 의존성
├── .env                # 환경 변수
└── README.md           # 이 파일
```

## 🛠️ 사용 기술

- **프론트엔드**: HTML5, CSS3, Vanilla JavaScript
- **백엔드**: Node.js, Express.js
- **API**: Google Gemini API
- **기타**: CORS, dotenv

## 📝 API 엔드포인트

### POST /api/generate-content
콘텐츠 생성 요청

**요청 본문:**
```json
{
  "contentType": "image|model|video",
  "prompt": "생성하고 싶은 콘텐츠 설명"
}
```

**응답:**
```json
{
  "success": true,
  "message": "Generating content",
  "prompt": "프롬프트",
  "contentType": "content type"
}
```

### GET /api/health
서버 상태 확인

## 🔧 개발 모드로 실행

```bash
npm run dev
```

nodemon을 사용하여 파일 변경 시 자동으로 서버를 재시작합니다.

## 🌐 Gemini API 설정

1. [Google AI Studio](https://aistudio.google.com/apikey)에서 API 키 생성
2. `.env` 파일에 API 키 추가
3. 완료!

## 📱 반응형 디자인

- 데스크톱 (1200px 이상)
- 태블릿 (768px ~ 1199px)
- 모바일 (768px 이하)

## 🎨 커스터마이제이션

### 배색 변경
`public/style.css`의 색상 값을 수정하세요:
```css
/* 주요 색상 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### 기능 추가
`server.js`에 새로운 API 엔드포인트를 추가하세요.

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다.

## 🤝 기여

이 프로젝트에 기여하고 싶다면:
1. Fork 하기
2. Feature Branch 생성 (`git checkout -b feature/AmazingFeature`)
3. Commit 하기 (`git commit -m 'Add some AmazingFeature'`)
4. Push 하기 (`git push origin feature/AmazingFeature`)
5. Pull Request 오픈

## 📧 문의

프로젝트에 대한 질문이나 제안이 있으면 이슈를 생성해주세요.

---

**Powered by Google Gemini API** 🔥
