import { useState, useCallback } from "react";

const API_ENDPOINT = "/api/generate";
const MODEL = "claude-sonnet-4-5-20250929";

/* ─── Styles ─── */
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans JP', sans-serif; background: #0d0d0d; color: #f0f0f0; min-height: 100vh; }
  .app { min-height: 100vh; background: #0d0d0d; }

  .header { padding: 28px 40px 20px; border-bottom: 1px solid #222; display: flex; align-items: center; gap: 14px; }
  .logo-badge { width: 40px; height: 40px; background: #FF6B00; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; color: white; flex-shrink: 0; }
  .header-text h1 { font-size: 18px; font-weight: 700; color: #fff; }
  .header-text p { font-size: 11px; color: #555; margin-top: 3px; }

  .main { padding: 36px 40px; max-width: 1440px; margin: 0 auto; }

  .url-section { background: #141414; border: 1px solid #252525; border-radius: 14px; padding: 28px 32px; margin-bottom: 36px; }
  .url-section h2 { font-size: 11px; font-weight: 700; color: #555; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 14px; font-family: 'Space Mono', monospace; }
  .url-row { display: flex; gap: 10px; }
  .url-input { flex: 1; background: #0a0a0a; border: 1px solid #2c2c2c; border-radius: 9px; padding: 13px 16px; font-size: 14px; color: #eee; outline: none; font-family: 'Space Mono', monospace; transition: border-color .2s; }
  .url-input:focus { border-color: #FF6B00; }
  .url-input::placeholder { color: #333; }
  .gen-btn { background: #FF6B00; color: #fff; border: none; border-radius: 9px; padding: 13px 26px; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all .2s; font-family: 'Noto Sans JP', sans-serif; }
  .gen-btn:hover:not(:disabled) { background: #ff8533; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(255,107,0,.3); }
  .gen-btn:disabled { background: #333; cursor: not-allowed; transform: none; box-shadow: none; }

  .progress { margin-top: 16px; }
  .progress-bar { height: 2px; background: #1e1e1e; border-radius: 2px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #FF6B00, #ffad66); animation: prog 1.8s ease-in-out infinite; }
  @keyframes prog { 0%{width:0;margin-left:0} 60%{width:65%;margin-left:0} 100%{width:0;margin-left:100%} }
  .status-text { font-size: 12px; color: #FF6B00; margin-top: 10px; font-family: 'Space Mono', monospace; }
  .error-msg { font-size: 12px; color: #ff5555; margin-top: 10px; font-family: 'Space Mono', monospace; background: rgba(255,50,50,.06); border: 1px solid rgba(255,50,50,.2); padding: 10px 14px; border-radius: 8px; white-space: pre-wrap; }
  .debug-btn { background: transparent; border: 1px solid #333; color: #666; border-radius: 6px; padding: 5px 12px; font-size: 11px; cursor: pointer; margin-top: 8px; font-family: 'Space Mono', monospace; }
  .debug-btn:hover { border-color: #555; color: #999; }
  .debug-box { background: #0a0a0a; border: 1px solid #222; border-radius: 8px; padding: 12px; margin-top: 8px; font-size: 10px; color: #666; font-family: 'Space Mono', monospace; overflow-x: auto; white-space: pre-wrap; max-height: 200px; overflow-y: auto; }

  .results { display: flex; flex-direction: column; gap: 24px; }

  .panel { background: #141414; border: 1px solid #252525; border-radius: 14px; overflow: hidden; }
  .panel-head { padding: 18px 24px; border-bottom: 1px solid #1e1e1e; display: flex; align-items: center; justify-content: space-between; }
  .panel-title { font-size: 11px; font-weight: 700; color: #555; letter-spacing: 2px; text-transform: uppercase; font-family: 'Space Mono', monospace; }
  .panel-badge { background: #FF6B00; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px; font-family: 'Space Mono', monospace; }

  .tree-wrap { overflow-x: auto; padding: 28px; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #0e0e0e; padding: 11px 14px; text-align: left; font-size: 9px; font-weight: 700; color: #444; letter-spacing: 1.5px; text-transform: uppercase; border-bottom: 1px solid #1e1e1e; font-family: 'Space Mono', monospace; white-space: nowrap; }
  td { padding: 13px 14px; border-bottom: 1px solid #1a1a1a; vertical-align: top; line-height: 1.6; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,107,0,.03); }
  .td-id { font-family: 'Space Mono', monospace; font-size: 11px; color: #FF6B00; font-weight: 700; white-space: nowrap; }
  .td-q { color: #888; min-width: 140px; font-size: 11px; }
  .td-script { color: #ddd; min-width: 240px; max-width: 380px; font-size: 12px; }
  .td-num { text-align: center; font-family: 'Space Mono', monospace; font-size: 11px; color: #555; white-space: nowrap; }
  .td-link { font-size: 10px; }
  .td-link a { color: #6699ff; text-decoration: none; }
  .td-link a:hover { text-decoration: underline; }
  .cta-chip { display: inline-block; background: #FF6B00; color: #fff; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 4px; white-space: nowrap; }
  .dl-btn { background: transparent; border: 1px solid #2a2a2a; color: #666; border-radius: 7px; padding: 7px 14px; font-size: 11px; cursor: pointer; transition: all .2s; font-family: 'Noto Sans JP', sans-serif; }
  .dl-btn:hover { border-color: #FF6B00; color: #FF6B00; }

  .empty { text-align: center; padding: 80px 40px; color: #333; }
  .empty h3 { font-size: 16px; color: #444; margin-bottom: 8px; }
  .empty p { font-size: 12px; line-height: 1.7; }
`;

/* ─── JSON extraction: handles markdown fences, leading/trailing text ─── */
function extractJSON(raw) {
  if (!raw) return null;
  // strip code fences
  let s = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  // find outermost { ... }
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(s.slice(start, end + 1));
  } catch (e) {
    console.error("JSON parse error:", e, s.slice(start, end + 1).slice(0, 200));
    return null;
  }
}

/* ─── SVG Tree ─── */
function ScenarioTree({ nodes }) {
  if (!nodes?.length) return null;

  const NW = 160, NH = 60, HGAP = 60, VGAP = 28;
  const map = {};
  nodes.forEach(n => { map[n.id] = { ...n, children: [] }; });
  const roots = [];
  nodes.forEach(n => {
    if (!n.parent_id) roots.push(map[n.id]);
    else if (map[n.parent_id]) map[n.parent_id].children.push(map[n.id]);
  });

  let maxX = 0, maxY = 0;
  function place(nd, x, y) {
    nd.x = x; nd.y = y;
    maxX = Math.max(maxX, x + NW); maxY = Math.max(maxY, y + NH);
    if (!nd.children.length) return NH + VGAP;
    let used = 0;
    nd.children.forEach(ch => { used += place(ch, x + NW + HGAP, y + used); });
    const fc = nd.children[0], lc = nd.children[nd.children.length - 1];
    nd.y = (fc.y + lc.y) / 2;
    maxY = Math.max(maxY, nd.y + NH);
    return Math.max(used, NH + VGAP);
  }
  let ty = 0;
  roots.forEach(r => { ty += place(r, 32, ty); });

  const W = maxX + 40, H = maxY + 40;

  const col = t => {
    if (t === "opening") return { bg: "#1c0e00", stroke: "#FF6B00", text: "#FF6B00" };
    if (t === "cta")     return { bg: "#FF6B00", stroke: "#FF6B00", text: "#fff" };
    if (t === "branch")  return { bg: "#1a1a1a", stroke: "#3a3a3a", text: "#ccc" };
    return { bg: "#111", stroke: "#2a2a2a", text: "#888" };
  };

  const edges = nodes.map(n => {
    const nd = map[n.id];
    if (!nd?.parent_id || !map[nd.parent_id]) return null;
    const p = map[nd.parent_id];
    const x1 = p.x + NW, y1 = p.y + NH / 2;
    const x2 = nd.x,     y2 = nd.y + NH / 2;
    const mx = (x1 + x2) / 2;
    return (
      <path
        key={`e-${p.id}-${nd.id}`}
        d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
        stroke="#2a2a2a" strokeWidth="1.5" fill="none"
      />
    );
  });

  return (
    <div className="tree-wrap">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ minWidth: W }}>
        {edges}
        {Object.values(map).map(nd => {
          const c = col(nd.type);
          const raw = nd.label || nd.question || nd.id;
          const label = raw.length > 16 ? raw.slice(0, 15) + "…" : raw;
          return (
            <g key={nd.id}>
              <rect x={nd.x} y={nd.y} width={NW} height={NH} rx={8}
                fill={c.bg} stroke={c.stroke}
                strokeWidth={nd.type === "opening" ? 2 : 1.5} />
              <text x={nd.x + 8} y={nd.y + 14} fill="#3a3a3a" fontSize="8"
                fontFamily="Space Mono, monospace" fontWeight="700">{nd.id}</text>
              <text x={nd.x + 8} y={nd.y + 30} fill={c.text} fontSize="10"
                fontFamily="Noto Sans JP, sans-serif">{label}</text>
              {nd.seconds != null && (
                <text x={nd.x + 8} y={nd.y + 46} fill="#444" fontSize="9"
                  fontFamily="Space Mono, monospace">{nd.seconds}s · {nd.chars}文字</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [url, setUrl] = useState("https://degipro.com/");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [scenario, setScenario] = useState(null);
  const [error, setError] = useState("");
  const [debugRaw, setDebugRaw] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  const SYSTEM = `あなたは企業の動画チャットボットシナリオ設計の専門家です。
企業URLを分析し、以下のJSON形式のみを出力してください。説明文・コードブロック・前置き・後置きは一切不要です。

{"company_name":"企業名","brand_color":"#HEX","nodes":[{"id":"1","parent_id":null,"type":"opening","label":"Opening","question":"Opening","script":"スクリプト本文","chars":80,"seconds":11,"cta_label":"CTA文言","cta_link":"https://...","detail_label":null,"detail_link":null},{"id":"2","parent_id":"1","type":"branch","label":"質問ラベル","question":"質問文","script":"スクリプト本文","chars":42,"seconds":6,"cta_label":"CTA文言","cta_link":"https://...","detail_label":"詳細はこちら","detail_link":"https://..."}]}

構造ルール:
- id=1: Opening (type=opening, parent_id=null, 80文字・11秒以内)
- id=2〜4: 第1階層の選択肢 3〜4個 (type=branch, parent_id="1", 各5〜8秒)
- id=2-1,2-2,3-1,3-2…: 第2階層 各親に2〜3個 (type=sub, parent_idは親のid, 各8〜12秒)
- 合計ノード数: 10〜18個
- 1秒≒7文字

絶対に守ること: 出力はJSON文字列のみ。{ で始まり } で終わること。`;

  /* 単純な1回APIコール（ツールなし）*/
  const callDirect = async (siteInfo) => {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        system: SYSTEM,
        messages: [{
          role: "user",
          content: `以下の企業情報をもとにシナリオJSONを生成してください。JSONのみ出力。\n\n${siteInfo}`,
        }],
      }),
    });
    if (!res.ok) { const t = await res.text(); throw new Error(`API ${res.status}: ${t}`); }
    return res.json();
  };

  /* web_search付きAPIコール + tool_use処理 */
  const callWithSearch = async (userMsg) => {
    // Step A: web_search起動
    const resA = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        system: SYSTEM,
        messages: [{ role: "user", content: userMsg }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        tool_choice: { type: "auto" },
      }),
    });
    if (!resA.ok) { const t = await resA.text(); throw new Error(`API(A) ${resA.status}: ${t}`); }
    const dataA = await resA.json();

    // tool_use がなければ直接テキスト返却
    const hasToolUse = dataA.content?.some(b => b.type === "tool_use");
    if (!hasToolUse) {
      return dataA.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "";
    }

    // Step B: tool_result を送って最終生成
    const toolResults = dataA.content
      .filter(b => b.type === "tool_use")
      .map(b => ({ type: "tool_result", tool_use_id: b.id, content: "Search completed." }));

    const resB = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        system: SYSTEM,
        messages: [
          { role: "user", content: userMsg },
          { role: "assistant", content: dataA.content },
          { role: "user", content: toolResults },
        ],
      }),
    });
    if (!resB.ok) { const t = await resB.text(); throw new Error(`API(B) ${resB.status}: ${t}`); }
    const dataB = await resB.json();
    return dataB.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "";
  };

  const generate = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setScenario(null);
    setDebugRaw("");
    setShowDebug(false);

    try {
      // ── 1. web_search でサイト情報取得 + シナリオ生成 ──
      setStatus("🌐 企業サイトを調査中...");
      const userMsg = `企業URL: ${url}\n\nこの企業サイトを検索・調査して、動画チャットボットシナリオをJSONで出力してください。JSONのみ出力。`;
      let text = await callWithSearch(userMsg);
      setDebugRaw(text);

      // ── 2. JSON抽出 ──
      setStatus("📋 シナリオを解析中...");
      let parsed = extractJSON(text);

      // ── 3. フォールバック：直接生成 ──
      if (!parsed?.nodes?.length) {
        setStatus("🔄 再生成中（ツールなし）...");
        const siteInfo = `企業URL: ${url}\nサービス内容: このURLの企業サイトのサービス・特徴をもとにシナリオを設計してください。`;
        const data2 = await callDirect(siteInfo);
        text = data2.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "";
        setDebugRaw(text);
        parsed = extractJSON(text);
      }

      if (!parsed?.nodes?.length) {
        throw new Error("JSONの解析に失敗しました。\n「デバッグ情報」でAPIレスポンスを確認できます。");
      }

      setScenario(parsed);
      setStatus("✅ 完了！");
    } catch (e) {
      setError(e.message);
      setStatus("");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const downloadCSV = () => {
    if (!scenario) return;
    const h = ["動画ID","Question","Answer（Script）","文字数","秒数","詳細 Label","詳細 Link","CTA Label","CTA Link"];
    const rows = scenario.nodes.map(n => [
      n.id, n.question || "", (n.script || "").replace(/"/g, '""'),
      n.chars || "", `${n.seconds || ""}s`,
      n.detail_label || "—", n.detail_link || "—",
      n.cta_label || "", n.cta_link || "",
    ]);
    const csv = [h, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" })),
      download: `${scenario.company_name || "scenario"}_script.csv`,
    });
    a.click();
  };

  return (
    <div className="app">
      <style>{style}</style>
      <header className="header">
        <div className="logo-badge">▶</div>
        <div className="header-text">
          <h1>Video Chatbot Scenario Generator</h1>
          <p>企業URLから動画チャットボットシナリオ（樹形図＋スクリプト）を自動生成</p>
        </div>
      </header>

      <main className="main">
        <div className="url-section">
          <h2>企業URL を入力</h2>
          <div className="url-row">
            <input
              className="url-input" type="text" value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.co.jp"
              onKeyDown={e => e.key === "Enter" && !loading && generate()}
            />
            <button className="gen-btn" onClick={generate} disabled={loading}>
              {loading ? "生成中..." : "🎬 シナリオ生成"}
            </button>
          </div>

          {loading && (
            <div className="progress">
              <div className="progress-bar"><div className="progress-fill" /></div>
              <div className="status-text">{status}</div>
            </div>
          )}
          {!loading && status === "✅ 完了！" && <div className="status-text">{status}</div>}

          {error && (
            <div>
              <div className="error-msg">⚠ {error}</div>
              {debugRaw && (
                <>
                  <button className="debug-btn" onClick={() => setShowDebug(v => !v)}>
                    {showDebug ? "▲ デバッグ非表示" : "▼ デバッグ情報を表示"}
                  </button>
                  {showDebug && <div className="debug-box">{debugRaw}</div>}
                </>
              )}
            </div>
          )}
        </div>

        {scenario ? (
          <div className="results">
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">Scenario Flow — {scenario.company_name}</span>
                <span className="panel-badge">{scenario.nodes?.length} nodes</span>
              </div>
              <ScenarioTree nodes={scenario.nodes} />
            </div>

            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">{scenario.company_name} トークスクリプト</span>
                <button className="dl-btn" onClick={downloadCSV}>⬇ CSV</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>動画ID</th><th>Question</th><th>Answer（Script）</th>
                      <th>文字数</th><th>秒数</th>
                      <th>詳細 Label</th><th>詳細 Link</th>
                      <th>CTA Label</th><th>CTA Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenario.nodes.map(n => (
                      <tr key={n.id}>
                        <td className="td-id">{n.id}</td>
                        <td className="td-q">{n.question}</td>
                        <td className="td-script">{n.script}</td>
                        <td className="td-num">{n.chars}</td>
                        <td className="td-num">{n.seconds}s</td>
                        <td className="td-link">
                          {n.detail_link
                            ? <a href={n.detail_link} target="_blank" rel="noreferrer">{n.detail_label || "詳細"}</a>
                            : <span style={{color:"#333"}}>—</span>}
                        </td>
                        <td className="td-link" style={{fontSize:"9px",color:"#444",maxWidth:180,wordBreak:"break-all"}}>
                          {n.detail_link || "—"}
                        </td>
                        <td className="td-link">
                          {n.cta_label && <span className="cta-chip">{n.cta_label}</span>}
                        </td>
                        <td className="td-link" style={{fontSize:"9px"}}>
                          {n.cta_link
                            ? <a href={n.cta_link} target="_blank" rel="noreferrer">{n.cta_link}</a>
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="empty">
              <h3>企業URLを入力してシナリオを生成</h3>
              <p>AIがサイトを解析し、樹形図フローチャートと<br/>動画スクリプト表を自動生成します</p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
