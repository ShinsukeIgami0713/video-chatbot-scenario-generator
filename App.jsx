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
  .logo-badge { width: 40px; height: 40px; background: #2D5016; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; color: white; flex-shrink: 0; }
  .header-text h1 { font-size: 18px; font-weight: 700; color: #fff; }
  .header-text p { font-size: 11px; color: #555; margin-top: 3px; }

  .main { padding: 36px 40px; max-width: 1440px; margin: 0 auto; }

  .url-section { background: #141414; border: 1px solid #252525; border-radius: 14px; padding: 28px 32px; margin-bottom: 36px; }
  .url-section h2 { font-size: 11px; font-weight: 700; color: #555; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 14px; font-family: 'Space Mono', monospace; }
  .url-input { width: 100%; background: #0a0a0a; border: 1px solid #2c2c2c; border-radius: 9px; padding: 13px 16px; font-size: 14px; color: #eee; outline: none; font-family: 'Space Mono', monospace; transition: border-color .2s; margin-bottom: 18px; }
  .url-input:focus { border-color: #2D5016; }
  .url-input::placeholder { color: #333; }
  .gen-btn { background: #2D5016; color: #fff; border: none; border-radius: 9px; padding: 13px 32px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .2s; font-family: 'Noto Sans JP', sans-serif; width: 100%; margin-top: 20px; }
  .gen-btn:hover:not(:disabled) { background: #4A7C2C; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(45,80,22,.3); }
  .gen-btn:disabled { background: #333; cursor: not-allowed; transform: none; box-shadow: none; }

  .progress { margin-top: 16px; }
  .progress-bar { height: 2px; background: #1e1e1e; border-radius: 2px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #2D5016, #4A7C2C); animation: prog 1.8s ease-in-out infinite; }
  @keyframes prog { 0%{width:0;margin-left:0} 60%{width:65%;margin-left:0} 100%{width:0;margin-left:100%} }
  .status-text { font-size: 12px; color: #4A7C2C; margin-top: 10px; font-family: 'Space Mono', monospace; }
  .error-msg { font-size: 12px; color: #ff5555; margin-top: 10px; font-family: 'Space Mono', monospace; background: rgba(255,50,50,.06); border: 1px solid rgba(255,50,50,.2); padding: 10px 14px; border-radius: 8px; white-space: pre-wrap; }
  .debug-btn { background: transparent; border: 1px solid #333; color: #666; border-radius: 6px; padding: 5px 12px; font-size: 11px; cursor: pointer; margin-top: 8px; font-family: 'Space Mono', monospace; }
  .debug-btn:hover { border-color: #555; color: #999; }
  .debug-box { background: #0a0a0a; border: 1px solid #222; border-radius: 8px; padding: 12px; margin-top: 8px; font-size: 10px; color: #666; font-family: 'Space Mono', monospace; overflow-x: auto; white-space: pre-wrap; max-height: 200px; overflow-y: auto; }

  .results { display: flex; flex-direction: column; gap: 24px; }

  .panel { background: #141414; border: 1px solid #252525; border-radius: 14px; overflow: hidden; }
  .panel-head { padding: 18px 24px; border-bottom: 1px solid #1e1e1e; display: flex; align-items: center; justify-content: space-between; }
  .panel-title { font-size: 11px; font-weight: 700; color: #555; letter-spacing: 2px; text-transform: uppercase; font-family: 'Space Mono', monospace; }
  .panel-badge { background: #2D5016; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px; font-family: 'Space Mono', monospace; }

  .tree-wrap { overflow-x: auto; padding: 28px; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #0e0e0e; padding: 11px 14px; text-align: left; font-size: 9px; font-weight: 700; color: #444; letter-spacing: 1.5px; text-transform: uppercase; border-bottom: 1px solid #1e1e1e; font-family: 'Space Mono', monospace; white-space: nowrap; }
  td { padding: 13px 14px; border-bottom: 1px solid #1a1a1a; vertical-align: top; line-height: 1.6; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(45,80,22,.03); }
  .td-id { font-family: 'Space Mono', monospace; font-size: 11px; color: #2D5016; font-weight: 700; white-space: nowrap; }
  .td-q { color: #888; min-width: 140px; font-size: 11px; }
  .td-script { color: #ddd; min-width: 240px; max-width: 380px; font-size: 12px; }
  .td-num { text-align: center; font-family: 'Space Mono', monospace; font-size: 11px; color: #555; white-space: nowrap; }
  .td-link { font-size: 10px; }
  .td-link a { color: #6B9D3E; text-decoration: none; }
  .td-link a:hover { text-decoration: underline; }
  .cta-chip { display: inline-block; background: #2D5016; color: #fff; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 4px; white-space: nowrap; }
  .dl-btn { background: transparent; border: 1px solid #2a2a2a; color: #666; border-radius: 7px; padding: 7px 14px; font-size: 11px; cursor: pointer; transition: all .2s; font-family: 'Noto Sans JP', sans-serif; }
  .dl-btn:hover { border-color: #2D5016; color: #2D5016; }

  .settings { display: flex; gap: 20px; margin-top: 18px; flex-wrap: wrap; }
  .setting-group { display: flex; flex-direction: column; gap: 8px; }
  .setting-label { font-size: 10px; font-weight: 700; color: #555; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Space Mono', monospace; }
  .setting-options { display: flex; gap: 6px; flex-wrap: wrap; }
  .opt-btn { background: #0a0a0a; border: 1px solid #2c2c2c; border-radius: 7px; padding: 8px 14px; font-size: 12px; color: #888; cursor: pointer; transition: all .2s; font-family: 'Noto Sans JP', sans-serif; white-space: nowrap; }
  .opt-btn:hover { border-color: #555; color: #ccc; }
  .opt-btn.active { background: #1a1f15; border-color: #2D5016; color: #4A7C2C; font-weight: 700; }

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
    if (t === "opening") return { bg: "#1a1f15", stroke: "#2D5016", text: "#4A7C2C" };
    if (t === "cta")     return { bg: "#2D5016", stroke: "#2D5016", text: "#fff" };
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
  const [url, setUrl] = useState("https://bonsai-video.com/");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [scenario, setScenario] = useState(null);
  const [error, setError] = useState("");
  const [debugRaw, setDebugRaw] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const [qasetCount, setQasetCount] = useState(5);
  const [purpose, setPurpose] = useState("CV最大化");
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});

  const QASET_STRUCTURES = {
    5: `- id=1: Opening (type=opening, parent_id=null, 80文字・11秒以内)
- id=2〜5: 4つの質問ノード (type=qa, parent_id="1", 各8〜12秒)
- 合計QAset数: 5個（Opening + 4つのQ&A）`,

    15: `- id=1: Opening (type=opening, parent_id=null, 80文字・11秒以内)
- id=2〜5: 第1階層の質問 4個 (type=qa, parent_id="1", 各8〜12秒)
- id=2-1,2-2,3-1,3-2…: 第2階層 各親に2〜3個のフォローアップ質問 (type=qa_detail, parent_idは親のid, 各10〜15秒)
- 合計QAset数: 約15個`,
  };

  const PURPOSE_PROMPTS = {
    "CV最大化": `目的: コンバージョン最大化（申し込み・問い合わせ・購入へ直結させる）

スクリプトのトーン: 行動喚起型。自信を持った断定的な語り口で、視聴者を具体的なアクションに導く。
構成ルール:
- 各ノードに必ず行動を促すCTA（申し込み・問い合わせ・購入・無料相談など）を含めること
- ベネフィットは必ず具体的な数字・実績・事例で伝えること（例:「導入企業300社以上」「コスト30%削減」「満足度98%」など）
- 緊急性・限定性のある表現を積極的に使うこと（例:「今だけ」「先着○名」「期間限定」「残りわずか」など）
- Openingでは最も強いベネフィットを冒頭で提示し、すぐに興味を引くこと
- 各分岐の末端ノードでは、明確な次のアクション（申し込みフォーム・電話番号・LINEなど）へ誘導すること`,

    "理解促進": `目的: 製品・サービスの理解促進（視聴者が「わかった！」と感じるまで丁寧に伝える）

スクリプトのトーン: 教育的でフレンドリー。先生が生徒に教えるように、丁寧でわかりやすい語り口。
構成ルール:
- 専門用語は必ずわかりやすく噛み砕いて説明すること（「○○とは、簡単に言うと△△のことです」のように）
- 図解・例え話・ステップ説明を意識した構成にすること（「たとえば〜」「ステップ1は〜」「イメージとしては〜」など）
- 「なぜ？」→「どうやって？」→「具体的には？」の順で疑問に答える流れにすること
- Openingでは「こんなお悩みありませんか？」のように視聴者の疑問を代弁して始めること
- 各分岐では機能・特徴・仕組みをひとつずつ掘り下げ、具体例を必ず含めること
- CTAは詳細ページ・導入事例・ヘルプガイドなど「もっと知りたい人向け」の誘導にすること`,
  };

  const buildSystem = () => `あなたは企業の動画チャットボットシナリオ設計の専門家です。
企業URLを分析し、以下のJSON形式のみを出力してください。説明文・コードブロック・前置き・後置きは一切不要です。

{"company_name":"企業名","brand_color":"#HEX","nodes":[{"id":"1","parent_id":null,"type":"opening","label":"Opening","question":"Opening","script":"スクリプト本文","chars":80,"seconds":11,"cta_label":"CTA文言","cta_link":"https://...","detail_label":null,"detail_link":null},{"id":"2","parent_id":"1","type":"branch","label":"質問ラベル","question":"質問文","script":"スクリプト本文","chars":42,"seconds":6,"cta_label":"CTA文言","cta_link":"https://...","detail_label":"詳細はこちら","detail_link":"https://..."}]}

構造ルール:
${QASET_STRUCTURES[qasetCount]}
- 1秒≒7文字

目的:
${PURPOSE_PROMPTS[purpose]}

絶対に守ること: 出力はJSON文字列のみ。{ で始まり } で終わること。`;

  const maxTokens = qasetCount >= 15 ? 8000 : 4000;

  /* URLを直接フェッチして企業情報を取得 */
  const fetchSiteInfo = async (targetUrl) => {
    const res = await fetch("/api/fetch-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: targetUrl }),
    });
    if (!res.ok) throw new Error(`URL取得エラー: ${res.status}`);
    return res.json();
  };

  /* フェッチ結果を構造化テキストに変換 */
  const formatSiteInfo = (data) => {
    const parts = [`企業URL: ${data.url}`];
    if (data.title) parts.push(`サイトタイトル: ${data.title}`);
    if (data.ogTitle && data.ogTitle !== data.title) parts.push(`OGタイトル: ${data.ogTitle}`);
    if (data.metaDescription) parts.push(`説明文: ${data.metaDescription}`);
    if (data.ogDescription && data.ogDescription !== data.metaDescription) parts.push(`OG説明文: ${data.ogDescription}`);
    if (data.keywords) parts.push(`キーワード: ${data.keywords}`);
    if (data.headings?.length) parts.push(`主な見出し:\n${data.headings.map(h => `- ${h}`).join("\n")}`);
    if (data.links?.length) parts.push(`主なリンク:\n${data.links.map(l => `- ${l.text}: ${l.href}`).join("\n")}`);
    if (data.bodyText) parts.push(`ページ本文（抜粋）:\n${data.bodyText}`);
    return parts.join("\n\n");
  };

  /* Claude APIコール */
  const callClaude = async (siteInfo) => {
    const sys = buildSystem();
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system: sys,
        messages: [{
          role: "user",
          content: `以下の企業サイトから取得した情報をもとに、シナリオJSONを生成してください。JSONのみ出力。\n\n${siteInfo}`,
        }],
      }),
    });
    if (!res.ok) { const t = await res.text(); throw new Error(`API ${res.status}: ${t}`); }
    return res.json();
  };

  const generate = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setScenario(null);
    setDebugRaw("");
    setShowDebug(false);

    try {
      // ── 1. URLを直接フェッチして企業情報を取得 ──
      setStatus("🌐 企業サイトを取得中...");
      const siteData = await fetchSiteInfo(url);

      let siteInfo;
      if (siteData.error) {
        setStatus("⚠ サイト取得に失敗、URLのみで生成...");
        siteInfo = `企業URL: ${url}\nサイト取得エラー: ${siteData.error}\nこのURLの企業サイトのサービス・特徴を推測してシナリオを設計してください。`;
      } else {
        siteInfo = formatSiteInfo(siteData);
      }

      // ── 2. Claude APIでシナリオ生成 ──
      setStatus("🤖 シナリオを生成中...");
      const data = await callClaude(siteInfo);
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "";
      setDebugRaw(text);

      // ── 3. JSON抽出 ──
      setStatus("📋 シナリオを解析中...");
      const parsed = extractJSON(text);

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
  }, [url, qasetCount, purpose]);

  const startEdit = (node) => {
    setEditingId(node.id);
    setEditedData({
      script: node.script,
      cta_label: node.cta_label,
      cta_link: node.cta_link,
    });
  };

  const saveEdit = (nodeId) => {
    const updatedNodes = scenario.nodes.map(n =>
      n.id === nodeId ? { ...n, ...editedData } : n
    );
    setScenario({ ...scenario, nodes: updatedNodes });
    setEditingId(null);
    setEditedData({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedData({});
  };

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
      download: `${scenario.company_name || "scenario"}_qaset.csv`,
    });
    a.click();
  };

  return (
    <div className="app">
      <style>{style}</style>
      <header className="header">
        <div className="logo-badge">▶</div>
        <div className="header-text">
          <h1>bonsai cast QAset generator</h1>
          <p>企業URLから動画チャットボットシナリオ（樹形図＋スクリプト）を自動生成</p>
        </div>
      </header>

      <main className="main">
        <div className="url-section">
          <h2>企業URL を入力</h2>
          <input
            className="url-input" type="text" value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.co.jp"
          />

          <div className="settings">
            <div className="setting-group">
              <span className="setting-label">QAset数</span>
              <div className="setting-options">
                <button className={`opt-btn${qasetCount === 5 ? " active" : ""}`} onClick={() => setQasetCount(5)}>
                  コンパクト
                </button>
                <button className={`opt-btn${qasetCount === 15 ? " active" : ""}`} onClick={() => setQasetCount(15)}>
                  詳細版
                </button>
              </div>
            </div>
            <div className="setting-group">
              <span className="setting-label">目的</span>
              <div className="setting-options">
                <button className={`opt-btn${purpose === "CV最大化" ? " active" : ""}`} onClick={() => setPurpose("CV最大化")}>
                  CV最大化
                </button>
                <button className={`opt-btn${purpose === "理解促進" ? " active" : ""}`} onClick={() => setPurpose("理解促進")}>
                  理解促進
                </button>
              </div>
            </div>
          </div>

          <button className="gen-btn" onClick={generate} disabled={loading}>
            {loading ? "生成中..." : "生成"}
          </button>

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
              </div>
              <ScenarioTree nodes={scenario.nodes} />
            </div>

            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">{scenario.company_name} QAset</span>
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
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenario.nodes.map(n => (
                      <tr key={n.id}>
                        <td className="td-id">{n.id}</td>
                        <td className="td-q">{n.question}</td>

                        {/* Script 編集可能 */}
                        <td className="td-script" style={editingId === n.id ? {background: 'rgba(45,80,22,.08)'} : {}}>
                          {editingId === n.id ? (
                            <textarea
                              value={editedData.script || ''}
                              onChange={(e) => setEditedData({...editedData, script: e.target.value})}
                              style={{
                                width: '100%',
                                minHeight: '80px',
                                background: '#0a0a0a',
                                border: '1px solid #2D5016',
                                borderRadius: '6px',
                                padding: '8px',
                                color: '#ddd',
                                fontSize: '12px',
                                fontFamily: 'Noto Sans JP, sans-serif',
                                resize: 'vertical',
                              }}
                            />
                          ) : (
                            n.script
                          )}
                        </td>

                        <td className="td-num">{(editingId === n.id ? editedData.script : n.script)?.length ?? 0}</td>
                        <td className="td-num">{Math.ceil(((editingId === n.id ? editedData.script : n.script)?.length ?? 0) / 7)}s</td>

                        <td className="td-link">
                          {n.detail_link
                            ? <a href={n.detail_link} target="_blank" rel="noreferrer">{n.detail_label || "詳細"}</a>
                            : <span style={{color:"#333"}}>—</span>}
                        </td>
                        <td className="td-link" style={{fontSize:"9px",color:"#444",maxWidth:180,wordBreak:"break-all"}}>
                          {n.detail_link || "—"}
                        </td>

                        {/* CTA Label 編集可能 */}
                        <td className="td-link" style={editingId === n.id ? {background: 'rgba(45,80,22,.08)'} : {}}>
                          {editingId === n.id ? (
                            <input
                              type="text"
                              value={editedData.cta_label || ''}
                              onChange={(e) => setEditedData({...editedData, cta_label: e.target.value})}
                              style={{
                                width: '100%',
                                background: '#0a0a0a',
                                border: '1px solid #2D5016',
                                borderRadius: '6px',
                                padding: '6px 8px',
                                color: '#ddd',
                                fontSize: '11px',
                                fontFamily: 'Noto Sans JP, sans-serif',
                              }}
                            />
                          ) : (
                            n.cta_label && <span className="cta-chip">{n.cta_label}</span>
                          )}
                        </td>

                        {/* CTA Link 編集可能 */}
                        <td className="td-link" style={editingId === n.id ? {fontSize:"9px", background: 'rgba(45,80,22,.08)'} : {fontSize:"9px"}}>
                          {editingId === n.id ? (
                            <input
                              type="text"
                              value={editedData.cta_link || ''}
                              onChange={(e) => setEditedData({...editedData, cta_link: e.target.value})}
                              style={{
                                width: '100%',
                                background: '#0a0a0a',
                                border: '1px solid #2D5016',
                                borderRadius: '6px',
                                padding: '6px 8px',
                                color: '#ddd',
                                fontSize: '10px',
                                fontFamily: 'Space Mono, monospace',
                              }}
                            />
                          ) : (
                            n.cta_link
                              ? <a href={n.cta_link} target="_blank" rel="noreferrer">{n.cta_link}</a>
                              : "—"
                          )}
                        </td>

                        {/* 編集/保存/キャンセルボタン */}
                        <td style={{padding: '8px', whiteSpace: 'nowrap'}}>
                          {editingId === n.id ? (
                            <div style={{display: 'flex', gap: '4px'}}>
                              <button
                                onClick={() => saveEdit(n.id)}
                                style={{
                                  background: '#2D5016',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '4px 10px',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  fontWeight: '700',
                                }}
                              >
                                保存
                              </button>
                              <button
                                onClick={cancelEdit}
                                style={{
                                  background: 'transparent',
                                  color: '#888',
                                  border: '1px solid #333',
                                  borderRadius: '4px',
                                  padding: '4px 10px',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                }}
                              >
                                キャンセル
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(n)}
                              disabled={editingId !== null}
                              style={{
                                background: 'transparent',
                                color: editingId !== null ? '#444' : '#6B9D3E',
                                border: '1px solid #2a2a2a',
                                borderRadius: '4px',
                                padding: '4px 10px',
                                fontSize: '10px',
                                cursor: editingId !== null ? 'not-allowed' : 'pointer',
                              }}
                            >
                              編集
                            </button>
                          )}
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
