이 프로젝트는 웹사이트 UI/UX 분석 서비스의 프론트엔드입니다.

## 설정

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000
```

Supabase 프로젝트의 URL과 Anon Key는 Supabase 대시보드에서 확인할 수 있습니다.

백엔드 API URL은 개발 환경에서는 `http://localhost:8000`을 사용하고, 프로덕션 환경에서는 Railway 등에 배포된 URL을 사용합니다.

### 2. Supabase 인증 설정

Supabase 대시보드에서 다음 OAuth 제공자를 설정해야 합니다:
- Google

각 제공자의 Client ID와 Client Secret을 Supabase 인증 설정에 추가하세요.

## Getting Started

개발 서버를 실행하세요:

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
