# 프로젝트 가이드

## 프로젝트 개요

GitHub Pages로 배포되는 **정보처리기사 실기 올인원** 단일 페이지 앱이다.
모의고사 · 기출문제 · 이론 암기장을 하나의 React 앱으로 통합했다.

**문제/이론 데이터는 공개 번들에 넣지 않는다.** 데이터는 Supabase(백엔드)에 두고,
**로그인한 사용자만** 앱에서 불러올 수 있다. GitHub Pages에는 로그인 화면 + UI 코드만 올라간다.

**배포 URL:** `https://gil280956-del.github.io`

## 파일 구성

| 파일 | 공개? | 설명 |
|---|---|---|
| `info_processing_allinone_12.jsx` | **비공개(gitignore)** | 마스터 소스. 앱 코드 + 모든 문제/이론 데이터. **로컬에만 보관, 절대 커밋 금지** |
| `build.cjs` | 공개 | jsx에서 **데이터 블록을 제거**하고 로그인/데이터 fetch를 감싸 `index.html` 생성 |
| `index.html` | 공개(배포본) | 데이터 없는 앱. 로그인 → Supabase에서 데이터 로드 |
| `supabase/` | **비공개(gitignore)** | 스키마·시드·추출 스크립트 + 데이터 JSON (로컬 전용) |
| `.nojekyll` | 공개 | Jekyll 빌드 실패 방지(필수) |

## 아키텍처

```
[GitHub Pages — 공개]              [Supabase — 백엔드]
 index.html (로그인 + UI)   ──►     study_data 테이블 (문제/이론 JSON)
 · Supabase 로그인                  · RLS: 로그인(authenticated)만 SELECT
 · 로그인 후 fetch → __hydrate()     · 계정은 대시보드에서 발급(공개가입 OFF)
```

- 화면(view): `main` / `exam` / `flash` / 코드·SQL 개념노트
- 데이터 상수(`ALL_EXAMS`, `GICHUL_EXAMS`, `MOCK2_EXAMS`, `CARDS`, `COMPARE`, `MNEMONICS`, `CODE_CARDS`)는
  번들에서 빈 배열 placeholder로 바뀌고, 로그인 후 `__hydrate()`로 채워진다.
- 설정(`SUBJECTS`, `SUBJECT_COLORS`, `LANG_COLORS`)과 UI 코드는 번들에 그대로 남는다.

## 빌드 절차

1. `info_processing_allinone_12.jsx` 수정 (문제/이론 = 상단 상수 배열)
2. `node build.cjs` → `index.html` 재생성 (데이터 자동 제거 + 로그인 래핑)
3. 브라우저에서 `index.html` 열어 로그인·렌더 확인
4. 테스트 보고 → 승인 후 커밋 & 푸시

## 콘텐츠(데이터) 업데이트 절차

데이터는 Supabase에 있으므로, 내용을 바꾸면 재업로드해야 한다:

1. `info_processing_allinone_12.jsx`의 데이터 배열 수정
2. `node supabase/extract.cjs` → `supabase/data/*.json` 재생성
3. `supabase/seed.mjs` 실행(service_role 키 필요) → Supabase 업로드
4. 앱 **코드**가 바뀐 경우에만 `node build.cjs`로 `index.html` 재빌드 후 커밋

## Git 커밋 규칙

- **`info_processing_allinone_12.jsx`, `supabase/`, `pdfs/` 는 절대 커밋하지 않는다** (데이터/비밀키, `.gitignore` 처리됨)
- `index.html`은 데이터 없는 배포본이므로 커밋한다
- 커밋은 반드시 테스트(빌드 + 로그인/렌더 확인) 후, 사용자 승인을 받고 진행한다
- Supabase `anon` 키는 공개돼도 안전하므로 `build.cjs`/`index.html`에 포함해도 된다. **`service_role` 키는 절대 커밋 금지.**

## 배포

- GitHub Pages **브랜치 배포(main / root)** + `.nojekyll` 필수.
- **커밋을 연달아 빠르게 푸시하지 말 것** — 배포 환경이 잼 상태가 될 수 있다(빌드는 성공/deploy만 실패). 한 번 푸시하고 초록불 확인 후 다음 작업.
- 반영까지 약 1~2분.

## 코드 스타일

- 순수 React(단일 jsx) + CDN. 프레임워크·번들러·npm 의존성 추가하지 않는다(Supabase JS도 CDN).
- 스타일은 jsx 내부 인라인 스타일/스타일 객체.
- 새 데이터는 기존 상수 배열의 객체 형식·네이밍에 맞춘다.
- 불필요한 주석은 작성하지 않는다.
