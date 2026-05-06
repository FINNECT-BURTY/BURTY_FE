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

- 현재 기본 방향은 Screaming Architecture다. 폴더명은 기술 계층보다 제품/도메인 의도를 먼저 드러내야 한다.
- `features/`, `entities/`, `widgets/` 같은 FSD 레이어명을 현재 기본 구조로 강제하지 않는다.
- 새 도메인 코드는 도메인 이름이 보이는 폴더에 둔다. 예시는 다음과 같다.

```txt
app/          Next 라우트, 레이아웃, 전역 provider, 앱 초기화
banking/      계좌, 자산, 거래 등 금융 도메인
conversation/ AI 대화, 메시지, 추천 흐름
onboarding/   가입, 권한 요청, 초기 설정
home/         홈 화면 구성과 홈 전용 흐름
shared/       도메인과 무관한 재사용 UI, lib, config, constants
```

- 실제 도메인 이름은 제품 요구사항에 맞춰 정한다. 위 이름은 예시이며, 의미 없는 generic 폴더보다 도메인 언어를 우선한다.
- `app/`의 route/page/layout 파일은 얇게 유지한다. 실질적인 UI와 로직은 해당 도메인 모듈로 옮긴다.
- 도메인에 종속된 코드를 `shared/`에 넣지 않는다.
- `shared/`는 진짜 공용 코드만 둔다. 임시 편의를 위한 쓰레기통 폴더로 쓰지 않는다.
- 큰 `utils/` 폴더를 만들지 않는다. 유틸은 목적과 소유 도메인이 드러나는 위치에 둔다.
- 향후 FSD로 마이그레이션할 가능성은 고려하되, 지금부터 FSD 레이어명을 억지로 도입하지 않는다.
- 나중에 FSD로 옮길 때는 도메인 폴더를 `features`, `entities`, `widgets` 등으로 재분류할 수 있게 결합도를 낮게 유지한다.

## 컴포넌트와 상태

- 컴포넌트는 기본적으로 Server Component로 둔다.
- `use client`는 상태, 이벤트 핸들러, 브라우저 API가 필요한 가장 작은 컴포넌트에만 붙인다.
- UI 컴포넌트는 재사용 목적이 명확할 때만 `shared`로 올린다.
- 페이지 전용 컴포넌트는 해당 화면이나 도메인 폴더 안에 둔다.
- 폼, 인증, 금융 데이터처럼 사용자 입력이나 민감 정보가 있는 영역은 검증과 에러 상태를 명확히 둔다.

## 스타일링

- 기존 Tailwind CSS 패턴을 따른다.
- 반복되는 스타일은 필요할 때만 컴포넌트화한다.
- 화면 텍스트가 모바일에서 넘치거나 겹치지 않도록 확인한다.
- 버튼, 링크, 입력, 로딩, 비활성 상태를 누락하지 않는다.

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
