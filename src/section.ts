// 断面ビュー — 横軸=路線に沿った距離、縦軸=海抜(m)
// 地表ラインと線路ラインを重ねて「地面の下をどう潜っているか」を見せる

import { type Station, trackElevation } from "./data/oedo";

/** 2点間の距離 (km) — haversine */
function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 駅列の累積距離 (km) */
function cumulativeDistance(stations: Station[]): number[] {
  const out = [0];
  for (let i = 1; i < stations.length; i++) {
    const a = stations[i - 1];
    const b = stations[i];
    out.push(out[i - 1] + haversineKm(a.lat, a.lng, b.lat, b.lng));
  }
  return out;
}

/** 深さ(m)を色に  浅い=シアン寄り → 深い=紫   */
export function depthColor(depth: number, maxDepth: number): string {
  const t = Math.min(1, Math.max(0, depth / maxDepth));
  const hue = 195 + t * 90; // 195(cyan) → 285(violet)
  const light = 60 - t * 18; // 深いほど暗く
  const sat = 70 + t * 10;
  return `hsl(${hue} ${sat}% ${light}%)`;
}

interface SectionOptions {
  lineColor: string;
}

export class SectionView {
  private container: HTMLElement;
  private stations: Station[];
  private opts: SectionOptions;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tooltip: HTMLDivElement;

  private cum: number[];
  private maxDepth: number;
  private active: number | null = null;
  private exaggerate = true;

  /** ホバー駅が変わったとき呼ばれる (同期用) */
  onHover: (index: number | null) => void = () => {};

  // 描画レイアウト（hit-test 用に保持）
  private geom = { padL: 0, padR: 0, padT: 0, padB: 0, w: 0, h: 0 };
  private xAt: (i: number) => number = () => 0;

  constructor(container: HTMLElement, stations: Station[], opts: SectionOptions) {
    this.container = container;
    this.stations = stations;
    this.opts = opts;
    this.cum = cumulativeDistance(stations);
    this.maxDepth = Math.max(...stations.map((s) => s.depth));

    this.canvas = document.createElement("canvas");
    this.canvas.className = "section-canvas";
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d")!;

    this.tooltip = document.createElement("div");
    this.tooltip.className = "section-tooltip";
    this.tooltip.style.display = "none";
    container.appendChild(this.tooltip);

    this.canvas.addEventListener("mousemove", (e) => this.handleMove(e));
    this.canvas.addEventListener("mouseleave", () => this.setActive(null, true));
    this.canvas.addEventListener("click", (e) => this.handleMove(e));

    this.resize();
  }

  setExaggeration(on: boolean) {
    this.exaggerate = on;
    this.draw();
  }

  setActive(index: number | null, notify = false) {
    if (this.active === index) return;
    this.active = index;
    this.draw();
    if (index === null) this.tooltip.style.display = "none";
    if (notify) this.onHover(index);
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  private handleMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // 最近傍駅
    let best = 0;
    let bestDx = Infinity;
    for (let i = 0; i < this.stations.length; i++) {
      const dx = Math.abs(this.xAt(i) - x);
      if (dx < bestDx) {
        bestDx = dx;
        best = i;
      }
    }
    this.setActive(best, true);
    this.showTooltip(best, e.clientX - rect.left, e.clientY - rect.top);
  }

  private showTooltip(i: number, px: number, py: number) {
    const s = this.stations[i];
    const elev = trackElevation(s);
    const tag = s.published
      ? `<span class="tt-published">公表値</span>`
      : `<span class="tt-est">概算</span>`;
    this.tooltip.innerHTML = `
      <div class="tt-name">${s.name} <span class="tt-id">${s.id}</span></div>
      <div class="tt-row">深さ <b>${s.depth.toFixed(1)} m</b> ${tag}</div>
      <div class="tt-row">地表標高 約 ${s.ground} m <span class="tt-est">概算</span></div>
      <div class="tt-row">線路の海抜 約 ${elev.toFixed(1)} m <span class="tt-est">概算</span></div>`;
    const w = this.geom.w;
    const left = px > w * 0.6 ? px - 180 : px + 16;
    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${Math.max(8, py - 10)}px`;
    this.tooltip.style.display = "block";
  }

  private draw() {
    const ctx = this.ctx;
    const rect = this.container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const padL = 52;
    const padR = 20;
    const padT = 46;
    const padB = 64;
    this.geom = { padL, padR, padT, padB, w, h };
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const totalKm = this.cum[this.cum.length - 1] || 1;
    this.xAt = (i: number) => padL + (this.cum[i] / totalKm) * plotW;

    // 海抜レンジ
    const grounds = this.stations.map((s) => s.ground);
    const tracks = this.stations.map((s) => trackElevation(s));
    let eMax = Math.max(...grounds) + 6;
    let eMin = Math.min(...tracks) - 6;
    // 誇張: 縦を引き伸ばす（範囲を狭めて拡大表示）  OFF なら素直なレンジ
    if (!this.exaggerate) {
      const span = eMax - eMin;
      const mid = (eMax + eMin) / 2;
      eMax = mid + span * 0.62;
      eMin = mid - span * 0.62;
    }
    const yAt = (elev: number) =>
      padT + ((eMax - elev) / (eMax - eMin)) * plotH;

    // --- 空（地表より上） ---
    ctx.fillStyle = "#0b0f1a";
    ctx.fillRect(0, 0, w, h);

    // --- 地中の塗り（地表ラインの下） ---
    ctx.beginPath();
    ctx.moveTo(padL, h - padB);
    for (let i = 0; i < this.stations.length; i++) {
      ctx.lineTo(this.xAt(i), yAt(this.stations[i].ground));
    }
    ctx.lineTo(padL + plotW, h - padB);
    ctx.closePath();
    const soil = ctx.createLinearGradient(0, padT, 0, h - padB);
    soil.addColorStop(0, "#2c2420");
    soil.addColorStop(1, "#15110d");
    ctx.fillStyle = soil;
    ctx.fill();

    // --- 海抜0ライン ---
    if (eMin < 0 && eMax > 0) {
      const y0 = yAt(0);
      ctx.strokeStyle = "rgba(96,165,250,0.55)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, y0);
      ctx.lineTo(padL + plotW, y0);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(147,197,253,0.9)";
      ctx.font = "11px ui-sans-serif, system-ui";
      ctx.fillText("海抜 0m", padL + 4, y0 - 4);
    }

    // --- Y軸目盛り ---
    ctx.fillStyle = "rgba(148,163,184,0.7)";
    ctx.font = "10px ui-sans-serif, system-ui";
    ctx.textAlign = "right";
    const step = 10;
    const from = Math.ceil(eMin / step) * step;
    for (let e = from; e <= eMax; e += step) {
      const y = yAt(e);
      ctx.strokeStyle = "rgba(148,163,184,0.08)";
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
      ctx.fillText(`${e}`, padL - 6, y + 3);
    }
    ctx.textAlign = "left";

    // --- 地表ライン ---
    ctx.strokeStyle = "rgba(180,160,120,0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < this.stations.length; i++) {
      const x = this.xAt(i);
      const y = yAt(this.stations[i].ground);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(180,160,120,0.7)";
    ctx.font = "10px ui-sans-serif, system-ui";
    ctx.fillText("地表", padL + 2, yAt(this.stations[0].ground) - 6);

    // --- 各駅の縦線（地表→線路） ---
    for (let i = 0; i < this.stations.length; i++) {
      const x = this.xAt(i);
      const yg = yAt(this.stations[i].ground);
      const yt = yAt(trackElevation(this.stations[i]));
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, yg);
      ctx.lineTo(x, yt);
      ctx.stroke();
    }

    // --- 線路ライン（深さ色エンコード, セグメントごと） ---
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    for (let i = 1; i < this.stations.length; i++) {
      const a = this.stations[i - 1];
      const b = this.stations[i];
      ctx.strokeStyle = depthColor((a.depth + b.depth) / 2, this.maxDepth);
      ctx.beginPath();
      ctx.moveTo(this.xAt(i - 1), yAt(trackElevation(a)));
      ctx.lineTo(this.xAt(i), yAt(trackElevation(b)));
      ctx.stroke();
    }

    // --- 駅ドット + ラベル ---
    for (let i = 0; i < this.stations.length; i++) {
      const s = this.stations[i];
      const x = this.xAt(i);
      const yt = yAt(trackElevation(s));
      const isActive = this.active === i;

      if (isActive) {
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.shadowColor = this.opts.lineColor;
        ctx.shadowBlur = 14;
      } else {
        ctx.fillStyle = depthColor(s.depth, this.maxDepth);
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.arc(x, yt, isActive ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 駅名（回転）
      ctx.save();
      ctx.translate(x, h - padB + 10);
      ctx.rotate(-Math.PI / 3.2);
      ctx.fillStyle = isActive ? "#fff" : "rgba(203,213,225,0.78)";
      ctx.font = `${isActive ? "bold " : ""}10px ui-sans-serif, system-ui`;
      ctx.textAlign = "right";
      ctx.fillText(s.name, 0, 0);
      ctx.restore();
    }
    ctx.textAlign = "left";

    // --- アクティブ駅の縦ガイド + 深さラベル ---
    if (this.active !== null) {
      const s = this.stations[this.active];
      const x = this.xAt(this.active);
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, h - padB);
      ctx.stroke();
      ctx.setLineDash([]);

      const yt = yAt(trackElevation(s));
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px ui-sans-serif, system-ui";
      const label = s.published
        ? `-${s.depth.toFixed(1)}m`
        : `-${s.depth.toFixed(1)}m (概算)`;
      const tw = ctx.measureText(label).width;
      ctx.fillText(label, Math.min(x + 8, padL + plotW - tw), yt + 4);
    }
  }
}
