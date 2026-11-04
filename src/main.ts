import "./style.css";
import { OEDO_LINE, OEDO_STATIONS, trackElevation } from "./data/oedo";
import { SectionView } from "./section";
import { MiniMap } from "./minimap";

const deepest = OEDO_STATIONS.reduce((a, b) => (b.depth > a.depth ? b : a));
const lowestTrack = OEDO_STATIONS.reduce((a, b) =>
  trackElevation(b) < trackElevation(a) ? b : a
);

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <header class="topbar">
    <div class="brand">
      <span class="brand-mark">UNDER<span>TOKYO</span></span>
      <span class="brand-sub">東京の地下を、断面で見る</span>
    </div>
    <div class="line-pill" style="--c:${OEDO_LINE.color}">
      <span class="dot"></span>${OEDO_LINE.name}
    </div>
  </header>

  <main class="layout">
    <section class="section-panel">
      <div class="panel-head">
        <h1>断面プロファイル <small>光が丘 → 都心環状</small></h1>
        <label class="toggle">
          <input type="checkbox" id="exaggerate" checked />
          <span>深さを強調</span>
        </label>
      </div>
      <div id="section" class="section-host"></div>
      <div class="legend">
        <span class="lg"><i class="sw shallow"></i>浅い</span>
        <span class="lg"><i class="sw deep"></i>深い</span>
        <span class="lg"><i class="sw ground"></i>地表</span>
        <span class="lg"><i class="sw sea"></i>海抜0m</span>
      </div>
    </section>

    <aside class="side">
      <div class="card map-card">
        <h2>路線図</h2>
        <div id="minimap" class="minimap-host"></div>
        <p class="hint">点にカーソルを合わせると断面と連動します</p>
      </div>

      <div class="card facts">
        <h2>ハイライト</h2>
        <div class="fact">
          <div class="fact-k">最も深い駅</div>
          <div class="fact-v">${deepest.name} <b>-${deepest.depth.toFixed(1)}m</b>
            <span class="badge published">公表値</span></div>
          <div class="fact-note">日本一深い地下鉄駅 (42.3m は大門方面ホーム)</div>
        </div>
        <div class="fact">
          <div class="fact-k">線路が最も低い地点</div>
          <div class="fact-v">${lowestTrack.name}
            <b>海抜 ${trackElevation(lowestTrack).toFixed(1)}m</b>
            <span class="badge est">概算</span></div>
          <div class="fact-note">深さも地表標高も概算の駅なので、海面下かどうかは断定できない</div>
        </div>
      </div>

      <ul class="disclaimer">
        <li>⚠️ ホーム深さが<b>公表値なのは4駅 (六本木・東中野・新宿・中井)</b> だけで、残り34駅は概算です</li>
        <li><b>地表標高は全38駅が概算</b>なので、断面に出る海抜の値も概算まじりになります</li>
        <li>地形のトレンド (台地・谷・低地) は実地形に寄せていますが、数値は今後精緻化します</li>
        <li>出典と限界は README に書いています</li>
      </ul>
    </aside>
  </main>
`;

const sectionHost = document.querySelector<HTMLDivElement>("#section")!;
const minimapHost = document.querySelector<HTMLDivElement>("#minimap")!;

const section = new SectionView(sectionHost, OEDO_STATIONS, {
  lineColor: OEDO_LINE.color,
});
const minimap = new MiniMap(minimapHost, OEDO_STATIONS, {
  lineColor: OEDO_LINE.color,
});

// 双方向同期
section.onHover = (i) => minimap.setActive(i);
minimap.onHover = (i) => section.setActive(i);

const exaggerate = document.querySelector<HTMLInputElement>("#exaggerate")!;
exaggerate.addEventListener("change", () =>
  section.setExaggeration(exaggerate.checked)
);

let raf = 0;
window.addEventListener("resize", () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => section.resize());
});
