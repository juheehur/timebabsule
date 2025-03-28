This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# 타임밥슐

미래의 나에게 보내는 편지, 타임밥슐

## 카카오톡 공유하기 설정 방법

1. [카카오 개발자 사이트](https://developers.kakao.com/)에 가입합니다.
2. 애플리케이션 추가하기를 클릭하여 새 애플리케이션을 생성합니다.
3. 생성된 애플리케이션에서 다음 설정을 진행합니다:
   - 플랫폼 > Web 플랫폼 등록
   - 사이트 도메인에 `http://localhost:3000`과 실제 배포 URL을 등록
   - JavaScript 키를 확인합니다.
4. 애플리케이션의 JavaScript 키를 복사하여 다음 파일에 붙여넣습니다:
   - `src/app/page.tsx`
   - `src/app/capsule/[id]/page.tsx`
   파일 내에서 `KAKAO_KEY_GOES_HERE` 부분을 실제 키로 교체합니다.

```javascript
// 예시
window.Kakao.init('여기에_JavaScript_키_입력')
```

5. 카카오톡 공유하기 기능을 테스트합니다. 필요한 경우 [카카오 공유하기 문서](https://developers.kakao.com/docs/latest/ko/message/js-link)를 참조하여 커스터마이징할 수 있습니다.

## 기타 공유 기능

- X(트위터) 공유: 앱 설정 없이 사용 가능합니다.
- 인스타그램 공유: 편지 내용을 이미지로 저장한 후 인스타그램 앱에서 직접 업로드해야 합니다.
- 링크 복사: 클립보드에 현재 페이지의 URL을 복사합니다.
