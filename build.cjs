// info_processing_allinone_12.jsx → index.html 변환 빌드 스크립트 (Supabase 백엔드 버전)
//  - 문제/이론 데이터(EXAMS_1_5 ~ MOCK2_EXAMS)를 번들에서 제거한다.
//  - 데이터는 로그인 후 Supabase(study_data 테이블)에서 fetch 하여 주입한다.
//  - React/ReactDOM/Babel/Supabase 를 CDN 으로 로드하는 단일 정적 페이지.
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "info_processing_allinone_12.jsx");
const OUT = path.join(__dirname, "index.html");

// Supabase 접속 정보 (anon 키는 공개돼도 안전 — 실제 보안은 RLS 가 담당)
const SB_URL = "https://jsirzbdkoltgnsmzyice.supabase.co";
const SB_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzaXJ6YmRrb2x0Z25zbXp5aWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NTQwMTAsImV4cCI6MjA5ODUzMDAxMH0.CA7fiQ1WwWWPIeAdTefgkATMeNFdkTf_LtTIIzzkiCo";

let jsx = fs.readFileSync(SRC, "utf8");

// 1) import 제거 → 전역 React 에서 훅 구조분해 (useEffect 추가)
jsx = jsx.replace(
  /^import\s*\{[^}]*\}\s*from\s*["']react["'];?\s*$/m,
  "const { useState, useMemo, useEffect } = React;"
);

// 2) export default 제거
jsx = jsx.replace(/export\s+default\s+function\s+App\s*\(/, "function App(");

// 3) 데이터 블록 제거 — const EXAMS_1_5 ... const MOCK2_EXAMS 까지가 전부 데이터다.
//    그 자리에 빈 placeholder + __hydrate() 주입 함수만 남긴다.
{
  const lines = jsx.split(/\r?\n/);
  const startIdx = lines.findIndex((l) => /^const\s+EXAMS_1_5\s*=/.test(l));
  const endIdx = lines.findIndex((l) => /^const\s+MOCK2_EXAMS\s*=/.test(l));
  if (startIdx < 0 || endIdx < 0 || endIdx < startIdx) {
    throw new Error("데이터 블록 경계(EXAMS_1_5 ~ MOCK2_EXAMS)를 찾지 못했습니다.");
  }
  const placeholder = [
    "// ── 문제/이론 데이터는 로그인 후 Supabase 에서 로드된다 (번들에 데이터 없음) ──",
    "let ALL_EXAMS = [], GICHUL_EXAMS = [], MOCK2_EXAMS = [], CARDS = [], COMPARE = [], MNEMONICS = [], CODE_CARDS = [];",
    "function __hydrate(d) {",
    "  ALL_EXAMS = d.all_exams || []; GICHUL_EXAMS = d.gichul_exams || []; MOCK2_EXAMS = d.mock2_exams || [];",
    "  CARDS = d.cards || []; COMPARE = d.compare || []; MNEMONICS = d.mnemonics || []; CODE_CARDS = d.code_cards || [];",
    "}",
  ];
  const removed = endIdx - startIdx + 1;
  lines.splice(startIdx, removed, ...placeholder);
  jsx = lines.join("\n");
  console.log(`데이터 블록 제거: ${removed}줄 (${startIdx + 1}~${endIdx + 1}행)`);
}

const head = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#0f172a">
<title>정보처리기사 올인원 — 모의고사 & 이론 암기장</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
<style>
  * { -webkit-tap-highlight-color: transparent; }
  html, body { margin: 0; padding: 0; background: #0f172a; }
  #loading {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    color: #94a3b8; font: 500 15px 'Noto Sans KR', sans-serif;
    background: linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#1e3a5f 100%);
  }
</style>
</head>
<body>
<div id="root"><div id="loading">불러오는 중…</div></div>
<script type="text/babel" data-presets="react">
`;

const tail = `
// ============================================================
//  로그인 게이트 + Supabase 데이터 로딩
// ============================================================
const __SB_URL = ${JSON.stringify(SB_URL)};
const __SB_ANON = ${JSON.stringify(SB_ANON)};
const __sb = supabase.createClient(__SB_URL, __SB_ANON);

const __center = { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:"#94a3b8", font:"500 15px 'Noto Sans KR',sans-serif", background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#1e3a5f 100%)", padding:20, boxSizing:"border-box" };
const __inp = { width:"100%", padding:"11px 12px", marginBottom:12, borderRadius:10, border:"1px solid rgba(255,255,255,.15)", background:"rgba(0,0,0,.25)", color:"#f1f5f9", font:"400 14px 'Noto Sans KR',sans-serif", boxSizing:"border-box" };

function Gate() {
  const [session, setSession] = useState(undefined); // undefined=확인중, null=로그아웃, obj=로그인
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    __sb.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = __sb.auth.onAuthStateChange((_e, s) => setSession(s || null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setReady(false); return; }
    let alive = true;
    (async () => {
      const { data, error } = await __sb.from("study_data").select("key,payload");
      if (!alive) return;
      if (error) { setErr("데이터 로드 실패: " + error.message); return; }
      const m = {}; (data || []).forEach((r) => { m[r.key] = r.payload; });
      __hydrate(m);
      setReady(true);
    })();
    return () => { alive = false; };
  }, [session]);

  async function onLogin(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const { error } = await __sb.auth.signInWithPassword({ email: email.trim(), password: pw });
    setBusy(false);
    if (error) setErr("로그인 실패 — 이메일/비밀번호를 확인하세요.");
  }
  async function onLogout() { await __sb.auth.signOut(); setReady(false); }

  if (session === undefined) return <div style={__center}>불러오는 중…</div>;

  if (!session) {
    return (
      <div style={__center}>
        <form onSubmit={onLogin} style={{ width:"100%", maxWidth:340, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.12)", borderRadius:16, padding:28, boxSizing:"border-box" }}>
          <div style={{ color:"#f1f5f9", font:"900 22px 'Noto Sans KR',sans-serif", marginBottom:6 }}>정보처리기사 올인원</div>
          <div style={{ color:"#94a3b8", fontSize:13, marginBottom:20 }}>로그인이 필요합니다</div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" autoComplete="username" style={__inp} />
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="비밀번호" autoComplete="current-password" style={__inp} />
          {err ? <div style={{ color:"#f87171", fontSize:13, margin:"2px 0 12px" }}>{err}</div> : null}
          <button type="submit" disabled={busy} style={{ width:"100%", padding:"12px", borderRadius:10, border:"none", background:"#6366f1", color:"#fff", font:"700 15px 'Noto Sans KR',sans-serif", cursor:"pointer", opacity: busy ? 0.6 : 1 }}>
            {busy ? "로그인 중…" : "로그인"}
          </button>
        </form>
      </div>
    );
  }

  if (!ready) return <div style={__center}>{err || "데이터 불러오는 중…"}</div>;

  return (
    <React.Fragment>
      <App />
      <button onClick={onLogout} title="로그아웃" style={{ position:"fixed", top:12, right:12, zIndex:9999, padding:"6px 12px", borderRadius:999, background:"rgba(15,23,42,.7)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,.18)", color:"#cbd5e1", font:"600 12px 'Noto Sans KR',sans-serif", cursor:"pointer" }}>
        로그아웃
      </button>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Gate />);
</script>
</body>
</html>
`;

fs.writeFileSync(OUT, head + jsx + tail, "utf8");
console.log("생성 완료:", OUT, "(" + Buffer.byteLength(head + jsx + tail, "utf8") + " bytes)");
