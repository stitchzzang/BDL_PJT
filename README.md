## 부자될랩(Lab) Frontend

### 📂 폴더 구조

```
src/
├── api/            # API 관련 로직
│   └── instance/   # ky 인스턴스 설정
├── assets/         # 이미지, 폰트 등 정적 파일
│   └── images/     # 이미지
│   └── lottie/     # lottie 관련 json
├── components/     # 재사용 가능한 컴포넌트
│   ├── common/     # 공통 컴포넌트 (Button, Input 등)
│   └── ui/         # React UI 컴포넌트 라이브러리 (shadcn/ui, react-bits)
│       └── icons.jsx      # 아이콘 컴포넌트
├── hooks/          # 커스텀 훅 (use~)
├── layouts/        # 레이아웃 컴포넌트
├── lib/            # 외부 라이브러리 관련 유틸
├── routes/         # 라우트 설정
│   ├── pages/      # 페이지 컴포넌트
│   └── index.tsx   # 최상위 라우트 설정 (RouterProvider 등)
│   └── router.tsx  # 개별 라우트 정의 (라우트 목록)
├── store/          # 상태 관리 (Zustand)
├── styles/         # 전역 스타일
│   └── index.css
└── utils/          # 유틸리티 함수 (only js, ts)
```