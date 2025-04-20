# 💰 TEAM 부자인거지 "부자될랩(BDL)"     
## 🏆SSAFY 12기 특화프로젝트(핀테크) 🏆    
![207677445 (1)](https://github.com/user-attachments/assets/da3f1be4-6d70-4b1d-85bf-602c9435224d)

> **실시간 투자 체험과 주식 튜토리얼을 통한 주식 교육 플랫폼!**
>
> 모의 투자 및 자동 투자 시스템 기반 주식 학습 플랫폼

- [🌐 부자될랩 서비스 바로가기](https://j12d202.p.ssafy.io)

## 📑 목차

1. [📋 프로젝트 소개](#-프로젝트-소개)
2. [🚀 주요 기능](#-주요-기능)
3. [🔬 주요 기술](#-주요-기술)
4. [🛠️ 기술 스택](#-기술-스택)
5. [📂 프로젝트 구조](#-프로젝트-구조)
6. [⚙️ 설치 및 실행 방법](#-설치-및-실행-방법)
7. [👨‍👩‍👧‍👦 팀원 정보](#-팀원-정보)
8. [📌 기타 정보](#-기타-정보)

---

## 📋 프로젝트 소개

> **실시간 투자 체험 및 주식 교육 플랫폼**

- 실시간 모의 투자와 자동 투자 시스템을 통해 실제와 유사한 투자 경험 제공
- 주식 튜토리얼로 과거 데이터 분석 및 투자 전략 학습
- 백테스트와 실시간 알람 기능으로 투자 피드백 지원

---

## 🚀 주요 기능

1. **주식 튜토리얼**

- 과거 변곡점(변화율, 변곡점 개수, 최소 간격 기준) 분석
- 구매, 판매, 관망의 세 가지 행동을 통해 투자 전 연습 및 기본적인 주식 흐름 이해 가능
- 변곡점 사이의 뉴스 데이터 요약으로 흐름 이해 가능
- 튜토리얼 완료 후 수익률 기반 피드백

2. **실시간 모의 투자**

- 제공하는 포인트로 초보자도 실제와 유사한 경험을 할 수 있게 모의투자 시스템 제공
  - 틱당 차트 데이터
  - 기업 기본 정보

3. **자동 투자 시스템**

- 사용자에 맞게 자동 투자 알고리즘 생성 가능
- 생성된 자동 투자 알고리즘으로 모의 투자 자동 매매 가능

4. **백테스트**

- 자동 투자 알고리즘을 과거 1년치 실제 주식 데이터에 적용해보고, 매매 전략의 수익률과 안정성을 사전에 검증할 수 있음
- 본격적인 자동 매매 실행 전에 투자 전략의 성능을 수치로 확인하여 리스크 최소화 가능

5. **투자 체결 알람 시스템**

- 투자가 체결됐을 시 실시간 알람으로 체결 유무 확인 가능

6. **어려운 투자 용어 툴팁 기능**

- 초보자가 이해하기 어려운 투자 용어 확인 가능

## 🔬 주요 기술

1. **분산 비동기 작업 관리 및 자동 투자 시스템**

- Celery와 Redis 기반의 작업 큐 시스템으로 거래 알고리즘 실행을 스케줄링 및 관리
- 독립적인 워커 풀을 통한 병렬 알고리즘 연산으로 확장성 확보

2. **거래 매매 시스템 트랜잭션 무결성 보장**

- 지수 백오프 알고리즘(Exponential Backoff)을 적용한 재시도 메커니즘으로 일시적 장애 극복
- 분산 락(Distributed Lock)으로 거래 원자성 보장 및 금융 데이터 정합성 유지
- 동일 사용자의 자동 매매 거래 동시성에 대한 락 메커니즘으로 경쟁 상태(Race Condition) 방지

3. **효율적인 데이터 캐싱 아키텍처**

- 최신 거래 데이터를 ConcurrentHashMap과 같은 표준 인메모리 캐시에 저장하여 응답 지연 최소화
- 메모리 최적화된 데이터 구조를 통한 대용량 실시간 거래 정보 처리
- 읽기 연산 최적화로 수천 명의 동시 사용자 환경에서도 안정적인 성능 유지

4. **이벤트 기반 실시간 처리 아키텍처**

- TradeDataEvent 등의 이벤트 드리븐 설계를 도입해, 실시간 체결 데이터의 변화에 따라 주문 체결, 주식 랭킹 계산 등 다양한 도메인 서비스가 비동기적으로 반응
- 이를 통해 모의 투자 시스템이 빠르고 정확하게 실시간 작동하며 사용자에게 즉각적인 피드백 제공

5. **실시간 이벤트 알림 시스템**

- SSE(Server-Sent Events) 기술을 활용한 단방향 실시간 투자 체결 알림 제공
- 폴링 방식 대비 서버 부하를 최소화하는 효율적인 이벤트 스트리밍 아키텍처 구현

6. **통합 모니터링**

- Prometheus, Grafana, Loki 기반의 풀스택 모니터링 인프라를 통한 시스템 상태 실시간 가시화
- Nginx 웹 서버부터 데이터베이스까지 전체 서비스 계층의 성능 지표 가시화
- Loki-Promtail 로그 집계 시스템으로 오류 추적 및 성능 병목 자동 감지

7. **STOMP 기반 실시간 금융 데이터 스트리밍 아키텍처**

- WebSocket과 STOMP 프로토콜을 활용한 틱 단위 주가 데이터 실시간 전송 시스템
- 이벤트 기반 발행-구독(pub-sub) 모델로 가격 변동 시 즉시 관련 서비스 및 사용자에게 시세 정보 전파

8. **Cursor 기반 페이지네이션**

- 차트 데이터가 부족할 경우에도 이전 데이터를 효율적으로 불러와 안정적인 사용자 경험을 보장

---

## 🛠️ 기술 스택

### 💻 프론트엔드

![React](https://img.shields.io/badge/react-%230db7ed.svg?style=for-the-badge&logo=react&logoColor=white)![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white)![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220)![ky](https://img.shields.io/badge/axios-%23663399.svg?style=for-the-badge&logo=ky&logoColor=)![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)![Prettier](https://img.shields.io/badge/prettier-%23F7B93E.svg?style=for-the-badge&logo=prettier&logoColor=black)![Zustand](https://img.shields.io/badge/zustand-black.svg?style=for-the-badge&logo=zustand&logoColor=black)![shadcn](https://img.shields.io/badge/shadcn/ui-black.svg?style=for-the-badge&logo=shadcn&logoColor=black)![Framer-Motion](https://img.shields.io/badge/framer_motion-black.svg?style=for-the-badge&logo=framer-motion&logoColor=black)![Lottie](https://img.shields.io/badge/lottie-black.svg?style=for-the-badge&logo=lottie&logoColor=black)![Stomp](https://img.shields.io/badge/stompjs-black.svg?style=for-the-badge&logo=stompjs&logoColor=black)![Echarts](https://img.shields.io/badge/Echarts-black.svg?style=for-the-badge&logo=echart&logoColor=black)

### ⚙️ 백엔드

![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)![SpringBoot](https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=Spring&logoColor=white)![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)![Gradle](https://img.shields.io/badge/Gradle-02303A.svg?style=for-the-badge&logo=Gradle&logoColor=white)![YAML](https://img.shields.io/badge/yaml-black.svg?style=for-the-badge&logo=yaml&logoColor=white)![NumPy](https://img.shields.io/badge/numpy-%23013243.svg?style=for-the-badge&logo=numpy&logoColor=white)![ChatGPT](https://img.shields.io/badge/chatGPTAPI-74aa9c?style=for-the-badge&logo=openai&logoColor=white)

### 🗄️ 데이터베이스

![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)![Amazon S3](https://img.shields.io/badge/Amazon%20S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)

### ☁️ 인프라

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)![Ubuntu](https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)![Docker](https://img.shields.io/badge/docker_compose-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)![Jenkins](https://img.shields.io/badge/jenkins-%232C5263.svg?style=for-the-badge&logo=jenkins&logoColor=white)![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

### 👊 협업 툴

![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)![GitLab](https://img.shields.io/badge/gitlab-%23181717.svg?style=for-the-badge&logo=gitlab&logoColor=white)![Jira](https://img.shields.io/badge/jira-%230A0FFF.svg?style=for-the-badge&logo=jira&logoColor=white)![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white)![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)![Mattermost](https://img.shields.io/badge/Mattermost-0285FF?style=for-the-badge&logo=Mattermost&logoColor=white)![Notion](https://img.shields.io/badge/Notion-%23000000.svg?style=for-the-badge&logo=notion&logoColor=white)![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)![KakaoTalk](https://img.shields.io/badge/kakaotalk-ffcd00.svg?style=for-the-badge&logo=kakaotalk&logoColor=000000)

### ✍️ IDE & 편집툴

![Vim](https://img.shields.io/badge/VIM-%2311AB00.svg?style=for-the-badge&logo=vim&logoColor=white)![IntelliJ IDEA](https://img.shields.io/badge/IntelliJ_IDEA-000000.svg?style=for-the-badge&logo=intellij-idea&logoColor=white)![PyCharm](https://img.shields.io/badge/pycharm-143?style=for-the-badge&logo=pycharm&logoColor=black&color=black&labelColor=green)![Adobe](https://img.shields.io/badge/adobe_Premiere_Pro-%23FF0000.svg?style=for-the-badge&logo=adobe-Premiere-Pro&logoColor=white)![OBS](https://img.shields.io/badge/obsstudio-black.svg?style=for-the-badge&logo=obsstudio&logoColor=white)![ScreenToGif](https://img.shields.io/badge/Screen_To_Gif-black.svg?style=for-the-badge&logo=Screen-To-Gif&logoColor=white)

---

## 📂 프로젝트 구조

### 📦 프론트엔드

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

### 🖥️ 백엔드

1. Spring Boot

```
src
└── main
    └── java
        └── com.ac202
            ├── adapter
            │   ├── autoloading
            |   ├── hantuapi
	    |   └── hantuwebsocket
            ├── domain
            │   ├── algorithm
            |   ├── auth
            |   ├── company
            |   ├── member
            |   ├── news
            |   ├── notification
            |   ├── orderbook
            |   ├── realtimetrade
            |   ├── simulation
            |   ├── stock
            |   └── tutorial
            └── global
                ├── annotation
                ├── aop
                ├── config
                ├── exception
                ├── handler
                ├── model
                ├── enums
                ├── s3
                ├── service
                └── sql
```

2. FastAPI

```
app
├── api
│   └── endpoints
├── core
├── db
├── models
└── services
```

### 🏗️ 아키텍처

<img width="908" alt="스크린샷 2025-04-14 오후 9 19 38" src="https://github.com/user-attachments/assets/a016a9f8-01df-4e6c-8d71-bdb6e01c0ec0" />


### 📚 ERD

<img width="857" alt="스크린샷 2025-04-14 오후 9 19 48" src="https://github.com/user-attachments/assets/ff00ff68-d0e3-417d-b37f-76eafda4597d" />

---

## 👨‍👩‍👧‍👦 팀원 정보

| 🧑‍💻**이름** |         🏆**역할**          |  🚀**이메일주소**   |
| :--------: | :-------------------------: | :-----------------: |
| **우정훈** |  팀장, 프론트엔드, PM 담당  | hoonixox@naver.com  |
| **신해인** |      프론트엔드 개발자      | godls0215@naver.com |
| **우준규** | 프론트엔드 개발자, 디자이너 | dnwnsrb11@naver.com |
| **배준영** |    백엔드 개발자, 인프라    |  bjy556@naver.com   |
| **전승기** |        백엔드 개발자        | moda2047@naver.com  |
| **정유선** |        백엔드 개발자        | seon7129@naver.com  |

---

## 🛠 담당 파트

### 우정훈

- **프론트엔드 개발**
  - **사용자 인증 및 계정 관리 구현**
  - **실시간 통신 및 프로필 페이지 개발**
    - STOMP 연결을 통한 프로필 페이지 구현
    - SSE 알람 연동을 통한 실시간 알림 기능 구현
  - **프로젝트 초기 세팅 및 아키텍처 구성**
    - 폴더 구조 및 프로젝트 설정으로 모듈화와 재사용성을 고려한 클린 아키텍처 설계
    - React Query 도입으로 데이터 페칭, 캐싱, 동기화 관리로 효율적인 상태관리 구현
    - shadcn/ui, react-bits, aceternity 등 최신 UI 컴포넌트 라이브러리 적용 및 사용법 공유
    - Prettier, ESLint 설정을 통한 코드 일관성 확보 및 스타일 관리
  - **추가 기술 스택 및 도구**
    - 빌드 및 번들러로 pnpm, Vite 등 최신 프론트엔드 도구 활용
    - 네트워크 요청 라이브러리로 금융 및 핀테크 프로젝트 특성에 맞춰, 보안과 효율성을 고려한 경량화 HTTP 클라이언트 ky 사용 (Toss 등 금융 API 연동 사례 참고)
- **PM**
  - **Agile 기반의 프로젝트 기획 및 일정 관리**
    - 스프린트 및 칸반 보드를 활용한 업무 우선순위 설정 및 진행 상황 시각화
    - 프로젝트 전체 일정 수립 및 팀원 업무 분배
  - **도구를 활용한 협업 및 커뮤니케이션 최적화**
    - Jira를 통한 이슈 및 일정 관리, GitLab과 연동하여 개발과 관리 간의 원활한 연결 유지
    - Mattermost와 GitLab CI/CD 연동으로 커밋 알림 및 실시간 코드 변경사항 공유
    - Notion 기반의 프로젝트 문서화 및 회의록 공유 시스템 운영
  - **품질 유지와 코드 협업 문화 구축**
    - 팀 전체 Git 전략 수립 (Git Flow) 및 PR 리뷰 가이드라인 정의

### 신해인

- **프론트엔드 개발**
  - **주식 튜토리얼 시스템 구현**
    - 기간별 주가 데이터(4단계 구간)를 기반으로 튜토리얼 흐름 구성
    - 각 구간별로 매수/매도 가능 여부 처리 및 사용자 액션에 따른 자산 변화 시뮬레이션 로직 구현
    - 각 구간 종료 시 수익률 계산 후 프론트 화면에 반영, 최종 결과는 종료 모달로 출력
  - **튜토리얼 가이드 기능**
    - React-Joyride를 활용한 단계별 UI 가이드 구현
    - 스텝마다 텍스트 및 버튼 커스터마이징, 타겟 요소로 스크롤 이동 처리
    - `beforeunload` 이벤트를 사용해 진행 중 이탈 방지 처리
  - **차트 컴포넌트 개발**
    - ECharts 기반의 분봉/일봉/주봉/월봉 전환 차트 구현
    - 거래량, 이동평균선(5일, 20일) 오버레이 추가
    - 튜토리얼 구간 경계 표시를 위한 마커 및 라벨 커스터마이징 적용
  - **상태 관리 및 렌더링 최적화**
    - React Query를 통한 데이터 캐싱 및 상태 동기화 처리
    - API 호출 로직을 커스텀 훅으로 분리하여 모듈화
    - useRef, useMemo, useCallback 활용하여 렌더링 성능 최적화

### 우준규

- **프론트엔드 개발**
  - **메인페이지** - 실시간 랭킹 시스템 - STOMP 프로토콜을 이용한 실시간 랭킹 시스템 구현
  - **메인페이지** - ECharts를 활용한 코스피·코스닥 지수 차트 시각화
  - **모의투자**
    - Cursor 기반 페이지네이션을 통한 차트 데이터 렌더링 최적화
    - WebSocket을 활용한 틱·호가 실시간 정보 시각화
    - 종목 판매, 구매, 수정 기능 로직 구현
    - ECharts를 활용한 실시간 틱 데이터 차트 구현
  - **알고리즘 LAB**
    - **백테스팅** - 시간 지연 및 슬라이드를 활용한 백테스트 연출 구현
    - ECharts를 활용한 자산 변화 추이 차트 시각화
- **디자인**
  - **전체 UX/UI 디자인**
    - 메인페이지, 마이페이지, 알고리즘 LAB, 모의주식, 주식 튜토리얼 등 서비스 전체의 화면 구성 및 UI/UX 설계

### 배준영

- **백엔드 개발**
  - **자동매매 시스템 설계 및 구현**
    - Python과 FastAPI를 활용한 알고리즘 트레이딩 서버 개발
    - Celery와 Redis 기반 분산 작업 큐를 통한 비동기 실시간 매매 신호 처리
    - 분봉/일봉 기반 기술적 분석 알고리즘 구현 (이동평균 교차, 가격 변동률 등)
  - **백엔드-알고리즘 서버 간 SSE 연동**
    - Spring Boot 서버와 Python 서버 간 매매 신호 실시간 전송
    - 하트비트 메시지를 통한 장기 연결 유지 및 신뢰성 확보
  - **분산 거래 시스템 동시성 제어**
    - Redis 기반 분산 락 서비스 구현으로 동시 거래 안전성 확보
    - 지수 백오프 재시도 로직 적용을 통한 시스템 안정성 강화
  - **백테스트 기능 구현**
    - 일 단위 매매 전략 백테스트 처리 API 개발
- **인프라 구축 및 관리**
  - **Docker 기반 멀티 컨테이너 아키텍처 설계 및 구현**
    - Spring Boot, React, MySQL, Redis, FastAPI, Celery 컨테이너 구성
    - 컨테이너 간 네트워크 구성 및 서비스 간 통신 최적화
  - **Nginx 리버스 프록시 설정**
    - HTTPS 암호화 및 인증서 관리(Let's Encrypt)
    - WebSocket, SSE 등 실시간 통신 최적화
    - 멀티 서비스 라우팅 및 다중 서비스 통합 프록시 설정
  - **모니터링 시스템 구축**
    - Prometheus, Grafana 기반 시스템 모니터링
    - Loki를 활용한 중앙화된 로그 관리 시스템 구축
    - 실시간 성능 지표 수집 및 대시보드 구현
  - **CI/CD 파이프라인 통합**
    - Jenkins 연동을 통한 자동화된 배포 체계 구축
    - 서비스별 컨테이너 이미지 빌드 및 배포 자동화

### 전승기

- **백엔드 개발**
  - Redis를 이용한 refreshToken 관리 및 JWT 인증/인가
  - 데이터 적재 스케줄러 및 애플리케이션 시작 시 초기 데이터 자동 로드
  - 모의투자 거래 시스템(시장가, 지정가 등)
    - **실시간 체결 데이터 및 호가 수신·전송**
      - 한국투자증권 Open API 웹소켓에서 틱 단위 체결 데이터 및 호가 수신
      - **ConcurrentHashMap** 캐시에 최신 데이터 저장
      - 개별 토픽(`/topic/tradeData/{code}`)으로 STOMP 전송
    - **미체결 주문 자동 체결**
      - DB 미체결 주문을 인메모리로 관리
      - 최신 체결가 캐싱 → 지정가 조건 충족 시 자동 체결·환불·알림
    - Cursor 기반 페이지네이션으로 차트 데이터 효율적 조회
  - **실시간 주식 랭킹**
    - 10초 주기 거래대금·등락률 기준 랭킹 계산
    - 제네릭 랭킹 모듈로 Comparator·매핑 추상화
    - 구독 즉시 캐시된 랭킹 전송(@SubscribeMapping) 및 REST API 제공
  - **이벤트 기반 처리**
    - **TradeDataEvent** 발행 → 주문 매칭·랭킹·알림을 비동기 트리거
  - SSE를 활용한 수동 매매 체결 알림 기능
  - 마이페이지 거래내역 API 개발

### 정유선

- **백엔드 개발**
  - **주식 튜토리얼(교육) 구현**
    - Redis를 이용한 튜토리얼 세션 상태 관리 및 유저별 진행 상황 캐싱
    - 변곡점 기반(변화율, 변곡점 개수, 최소 간격 기준) 시나리오 학습 구조 설계 및 수익률 계산 API 구현
    - 주식 구간 내 수익률 및 자산 변동 데이터 계산 로직 개발
  - **뉴스 관련 API 및 크롤링 로직 개발**
    - Jsoup을 활용한 뉴스 크롤링 및 HTML 파싱
  - **S3 구축 및 이미지 저장 로직 구현**
  - **기업 및 카테고리 관련 API 개발**
    - 종목 프로필, 기본 정보, 재무비율, 수익성 비율 등 정보 제공 API 설계
    - 정기적 정보 업데이트를 위한 스케줄러 구현
  - **데이터 적재 자동화 및 환경 설정**
    - 초기 데이터 적재를 위한 SQL 스크립트 작성 및 애플리케이션 구동 시 자동 실행 로직 구현
    - 서버 환경 기준 시간을 KST에서 UTC로 일괄 변경하여 시간 데이터 일관성 확보
  - **데이터베이스 최적화**
    - 복잡한 계산 로직 캐싱을 위한 Redis 활용 (예: 튜토리얼 수익률 계산 캐시)
    - Slow Query Log 분석 및 Performance Schema 활용을 통한 부하 쿼리 식별 및 개선 (쿼리 튜닝)

### 공통 파트

- **기획, 요구사항 명세서, ERD구성, API 명세서**
- **피드백 및 개선 프로세스**
  - 자체 QA 2차까지 진행
  - 컨설턴트 QA 3차까지 진행
  - QA 과정 중 도출된 피드백을 바탕으로 기능 및 오류 개선
  - 3차 QA에서 모든 주요 이슈 해결

---

## 기능 시연

### 홈

![mainpage](https://github.com/user-attachments/assets/baea9a6d-dffa-456f-bb7e-8ac1710cdbb0)


### 알고리즘 생성

![algo_lab](https://github.com/user-attachments/assets/6615a6f9-0d1a-406d-a9cd-83f2e74b050c)


### 알고리즘 백테스트

![backtest1](https://github.com/user-attachments/assets/3ae97d3b-632d-420b-a9b2-dd0475325c11)

### 모의 투자

![모의주식-전체움직임](https://github.com/user-attachments/assets/81432f37-ead8-4683-b069-89bd63bca255)
![호가움직임3](https://github.com/user-attachments/assets/e4f0f2c8-7e80-47c9-ad39-c4502558daae)

### 주식 튜토리얼 (대용량 파일로 로딩이 오래 걸릴 수 있습니다..!)

![tutorials](https://github.com/junyoungBae1/BDL/blob/master/%EC%8B%9C%EC%97%B0%20GIF/tutorials.gif?raw=true)

### 마이페이지

![mypage](https://github.com/user-attachments/assets/293fefe6-0f89-4985-b7c5-b8020dd023f7)


---

## 📌 기타 정보

- **CI/CD:** GitLab, Jenkins를 활용한 자동화 배포      
- **테스트 방법:** QA 문서 작성 후 페이지별 테스트 진행 / 유저 테스트 진행      
	+ **✅유저 테스트**:       
	약 5:1의 경쟁률을 뚫고 전국 137개 팀 중 5개의 팀 내에 선정되어, 삼성 임직원분들께 테스트를 받을 수 있었습니다.

		 ![434344210-186fa68c-2576-4d8b-a438-80a172444ea8](https://github.com/user-attachments/assets/e4550579-1e9d-45f0-8323-ee8edc6f3066)
      
		발표자료 및 영상 포트폴리오를 제출하고, 테스트 후 제공받은 피드백은 아래와 같습니다.           

		![01B8EFF8-247D-4392-848A-F245D10CAD8E](https://github.com/user-attachments/assets/329bc932-13d6-4dbe-b3c1-6c990201e9ec)
   



