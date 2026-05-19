<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 프로젝트 작업 규칙

## 기본 원칙

- 작업 전 현재 코드 구조와 이미 있는 패턴을 먼저 확인한다.
- 불필요한 리팩터링, 파일 이동, 포맷 변경은 하지 않는다.
- 사용자가 요청한 범위 밖의 동작 변경은 하지 않는다.
- 타입 안정성을 우선한다. `any`는 피하고, 필요한 경우 명확한 타입을 둔다.
- 서버/클라이언트 경계를 신중하게 다룬다. 브라우저 API는 Client Component에서만 사용한다.

## Next.js

- 이 프로젝트는 일반적인 Next.js 지식과 다를 수 있다.
- Next.js 관련 코드를 작성하기 전, 필요한 범위의 공식 문서를 `node_modules/next/dist/docs/`에서 확인한다.
- App Router의 파일 컨벤션을 우선한다.
- `metadata`에 deprecated 된 `themeColor`, `viewport` 같은 값을 넣지 않는다. 필요한 경우 `viewport` export를 사용한다.

## Import 규칙

- import 정렬은 ESLint의 `simple-import-sort` 규칙을 따른다.
- 정렬 순서는 side effect import, Node 내장 모듈, 외부 패키지, `@/` 내부 alias, 상대경로, 스타일 import 순서다.
- 타입 전용 import는 가능한 `import type`을 사용한다.

- TypeScript/React 코드 import는 기본적으로 `@/` 절대경로 alias를 사용한다.

```ts
import { Button } from "@/shared/ui/button";
import { PwaRegister } from "@/app/pwa-register";
```

- 깊은 상대경로 import는 사용하지 않는다.

```ts
// 피한다
import { Button } from "../../../shared/ui/button";
```

- 같은 폴더 안에서만 쓰는 아주 가까운 private 파일은 상대경로를 허용한다.

```ts
import { localHelper } from "./local-helper";
```

- `public/` 정적 파일은 import alias가 아니라 브라우저 URL 경로를 사용한다.

```ts
src: "/icons/icon-192x192.png";
```

```ts
// 사용하지 않는다
src: "@/public/icons/icon-192x192.png";
```

## 아키텍처

- 기본 구조는 `features/`, `shared/`, `app/`를 사용한다.
- `app/`은 Next 라우트, 레이아웃, 전역 provider, 앱 초기화만 담당한다. route/page/layout 파일은 얇게 유지한다.
- 사용자 흐름과 제품 기능은 `features/<feature-name>/` 아래에 둔다. 예: `features/onboarding/`.
- feature 내부 화면 컴포넌트는 `features/<feature-name>/components/`에 둔다.
- feature 내부 퍼널 단계 컴포넌트는 `features/<feature-name>/steps/`에 둔다.
- feature 안에서만 재사용되는 작은 UI는 `features/<feature-name>/ui/`에 둔다.
- feature 정적 설정과 문항 데이터는 `features/<feature-name>/constants/`에 둔다.
- feature의 공개 진입점은 `features/<feature-name>/index.ts`로 둔다. app에서는 가능하면 이 공개 진입점을 import한다.
- `shared/`에는 도메인과 무관한 재사용 UI, layout, lib, config, constants만 둔다.
- 도메인에 종속된 코드를 `shared/`에 넣지 않는다.
- 큰 `utils/` 폴더를 만들지 않는다. 유틸은 목적과 소유 도메인이 드러나는 위치에 둔다.

## 파일명

- React 컴포넌트 파일은 PascalCase를 사용한다. 예: `OnboardingEntry.tsx`, `MobileAppShell.tsx`.
- React 컴포넌트 이름도 파일명과 같은 PascalCase를 사용한다.
- feature 공개 진입점은 `index.ts`를 사용한다.
- Next App Router 예약 파일은 Next 파일 컨벤션을 따른다. 예: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `manifest.ts`.
- 브라우저 URL로 직접 접근되는 public asset 파일은 기존 파일명 또는 kebab-case를 사용한다.
- 일반 TypeScript 파일은 camelCase를 사용한다. 예: `onboardingSteps.ts`.
- 폴더명은 소문자 kebab-case를 사용한다. 예: `features/onboarding/`.

## 컴포넌트와 상태

- 컴포넌트는 기본적으로 Server Component로 둔다.
- `use client`는 상태, 이벤트 핸들러, 브라우저 API가 필요한 가장 작은 컴포넌트에만 붙인다.
- UI 컴포넌트는 재사용 목적이 명확할 때만 `shared`로 올린다.
- 페이지 전용 컴포넌트는 해당 화면이나 도메인 폴더 안에 둔다.
- 폼, 인증, 금융 데이터처럼 사용자 입력이나 민감 정보가 있는 영역은 검증과 에러 상태를 명확히 둔다.

## 모바일 레이아웃

- 이 앱은 모바일 우선 PWA다. 기본 디자인 기준 폭은 390px로 보고, 최소 320px까지 깨지지 않게 만든다.
- 앱의 최대 표시 폭은 430px을 기본으로 한다. 데스크톱과 태블릿에서는 중앙 정렬된 모바일 앱 프레임으로 보이게 한다.
- 전체 높이는 `100vh`보다 `min-h-dvh`를 우선한다. 모바일 브라우저 주소창과 PWA 환경의 viewport 차이를 고려한다.
- 전역 앱 프레임은 `shared/layout/MobileAppShell.tsx`에서 관리한다. 개별 페이지가 다시 `max-w-[430px]`, `mx-auto`, 전체 배경을 중복 정의하지 않는다.
- 하단 고정 버튼이나 탭바는 `env(safe-area-inset-bottom)`을 고려한다.
- 페이지 본문은 `flex-1`과 명확한 스크롤 영역을 사용해 하단 UI와 겹치지 않게 한다.

## 스타일링

- 기존 Tailwind CSS 패턴을 따른다.
- 기본 색상은 `app/globals.css`의 CSS 변수와 Tailwind theme token을 사용한다.
- 색상 토큰은 디자인 가이드에 정의된 다음 토큰만 사용한다.

```txt
background      #fcfcfc
grayscale-1000  #1e1e1e
grayscale-900   #474747
grayscale-800   #5b5b5b
grayscale-700   #707070
grayscale-600   #848484
grayscale-500   #989898
grayscale-400   #adadad
grayscale-300   #c1c1c1
grayscale-200   #d6d6d6
grayscale-100   #eaeaea
espresso        #301c1b
yellow-500      #d7c05c
yellow-400      #f4dc70
yellow-300      #ffed9e
yellow-200      #fff5c8
yellow-100      #fffcf1
red             #eb1818
green           #20a940
orange          #f96617
```

- 새 색상이 필요하면 먼저 토큰으로 추가할지 검토하고, 임의 hex 값을 컴포넌트에 흩뿌리지 않는다.
- 텍스트 스타일은 전역 타입 클래스 `text-display`, `text-title-lg`, `text-title-md`, `text-title-sm`, `text-body-lg`, `text-body-md`, `text-caption`을 우선 사용한다.
- 타입 스타일은 디자인 가이드의 font-size, font-weight, line-height 기준을 따른다.
- 반복되는 스타일은 필요할 때만 컴포넌트화한다.
- 화면 텍스트가 모바일에서 넘치거나 겹치지 않도록 확인한다.
- 버튼, 링크, 입력, 로딩, 비활성 상태를 누락하지 않는다.

## 공통 UI와 레이아웃 컴포넌트

- 상단 헤더의 공통 기반은 `shared/layout/Header.tsx`를 사용한다.
- 온보딩 헤더는 `shared/layout/OnboardingHeader.tsx`를 사용한다. 직접 뒤로가기 아이콘을 그리지 않고 `public/icons/header/back-arrow.svg`를 사용한다.
- 홈/메인 탭 헤더는 `shared/layout/MainHeader.tsx`를 사용한다. 좌측 로고 텍스트는 `text-title-md text-grayscale-1000` 기준으로 둔다.
- 프로젝트 공통 하단 CTA 버튼은 `shared/ui/BottomActionButton.tsx`를 사용한다.
- safe-area padding, 하단 CTA, 보조 텍스트가 함께 필요한 화면은 `shared/ui/BottomActionBar.tsx`를 사용한다.
- 하단 고정 버튼과 보조 텍스트를 개별 화면에서 새로 조합하기보다 위 공통 컴포넌트 사용을 먼저 검토한다.

## 온보딩

- 온보딩 스플래시는 `public/icons/onboarding/splash-1.svg`부터 `splash-4.svg`까지의 Figma export SVG를 사용한다.
- 스플래시의 Diamond fill, blur, 텍스트 위치를 CSS로 다시 구현하지 않는다. 필요하면 SVG asset을 교체한다.
- 온보딩 단계 화면은 공통 `OnboardingHeader`와 `BottomActionBar` 사용을 우선한다.

## PWA

- Manifest 아이콘 경로는 `public/` 기준 URL 경로로 작성한다.

```ts
"/icons/icon-192x192.png"
```

- `app/apple-icon.png`는 Next App Router metadata 파일 컨벤션이다. 직접 metadata를 수동 설정하지 않는 한 `app/` 아래에 둔다.
- Service Worker는 보수적으로 작성한다.
- API 응답, 인증 응답, 개인화 데이터, 금융 데이터는 캐시하지 않는다.
- 캐시 허용 대상은 기본적으로 공개 정적 리소스와 앱 shell로 제한한다.
- Service Worker를 바꿀 때는 캐시 버전 이름을 함께 검토한다.

## 보안과 데이터

- 계좌, 거래, 인증, 사용자 식별 정보 같은 민감 데이터는 브라우저 캐시에 저장하지 않는다.
- 로그에 민감 정보를 남기지 않는다.
- 외부 링크는 필요한 경우 `target="_blank"`와 `rel="noopener noreferrer"`를 함께 사용한다.
- 사용자 입력은 신뢰하지 않는다. 서버와 클라이언트 양쪽에서 필요한 검증을 둔다.

## 검증

- 변경 후 최소한 `npm run lint`를 실행한다.
- 타입, 빌드, 라우팅, PWA manifest 같은 기반 설정을 건드린 경우 `npm run build`도 실행한다.
- 빌드가 환경 문제로 실패하면 원인과 미검증 범위를 명확히 남긴다.
