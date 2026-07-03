# 정보처리기사 실기 올인원

정보처리기사 실기 대비 **모의고사 · 기출문제 · 이론 암기장** 단일 페이지 웹앱.
GitHub Pages(정적) + Supabase(백엔드) 구조이며, **문제/이론 데이터는 로그인한 사용자만** 볼 수 있습니다.

**🔗 배포 주소:** https://gil280956-del.github.io (로그인 필요)

## 구조

```
[GitHub Pages]  index.html — 로그인 화면 + 앱 UI (데이터 없음)
      │  로그인 후 fetch
      ▼
[Supabase]      study_data 테이블 — 문제/이론 (RLS: 로그인만 읽기)
```

- React·ReactDOM·Babel·Supabase-js를 CDN으로 로드하는 단일 정적 페이지 (번들러/npm 설치 없음)
- 로그인 계정은 Supabase 대시보드에서 발급 (공개 회원가입 없음)

## 개발 / 빌드

앱 소스와 데이터는 `info_processing_allinone_12.jsx`(비공개, 로컬 전용)에 있습니다.
`build.cjs`가 데이터를 걷어내고 로그인 래핑을 씌워 `index.html`을 만듭니다.

```bash
node build.cjs      # index.html 재생성 → 브라우저 확인 → 커밋 & 푸시
```

푸시 후 약 1~2분이면 GitHub Pages에 반영됩니다.

## 업데이트 기록

| 날짜 | 내용 |
| --- | --- |
| 2026-07-03 | Supabase 백엔드 도입 — 문제/이론 데이터를 서버로 분리, 로그인(RLS) 후에만 접근. 공개 번들에서 데이터 제거(985KB→53KB), git 히스토리 초기화 |
