// ミニマップ — lat/lng を平面投影した路線の概形。
// 断面ビューとホバー状態を同期する。

import type { Station } from "./data/oedo";

const SVG_NS = "http://www.w3.org/2000/svg";

interface MiniMapOptions {
  lineColor: string;
  size?: number;
}

export class MiniMap {
  private dots: SVGCircleElement[] = [];
  private active: number | null = null;
  onHover: (index: number | null) => void = () => {};

  constructor(container: HTMLElement, stations: Station[], opts: MiniMapOptions) {
    const size = opts.size ?? 220;
    const pad = 16;

    const lats = stations.map((s) => s.lat);
    const lngs = stations.map((s) => s.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    // 経度補正（東京付近で緯度方向と縮尺を合わせる）
    const latMid = (((minLat + maxLat) / 2) * Math.PI) / 180;
    const lngScale = Math.cos(latMid);
    const spanX = (maxLng - minLng) * lngScale || 1;
    const spanY = maxLat - minLat || 1;
    const span = Math.max(spanX, spanY);
    const inner = size - pad * 2;

    const px = (s: Station) =>
      pad +
      (((s.lng - minLng) * lngScale) / span) * inner +
      (inner - (spanX / span) * inner) / 2;
    const py = (s: Station) =>
      pad + ((maxLat - s.lat) / span) * inner + (inner - (spanY / span) * inner) / 2;

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("class", "minimap-svg");

    // 路線ライン
    const path = document.createElementNS(SVG_NS, "polyline");
    path.setAttribute(
      "points",
      stations.map((s) => `${px(s).toFixed(1)},${py(s).toFixed(1)}`).join(" ")
    );
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", opts.lineColor);
    path.setAttribute("stroke-width", "2.5");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("opacity", "0.85");
    svg.appendChild(path);

    // 駅ドット
    stations.forEach((s, i) => {
      const c = document.createElementNS(SVG_NS, "circle");
      c.setAttribute("cx", px(s).toFixed(1));
      c.setAttribute("cy", py(s).toFixed(1));
      c.setAttribute("r", "2.6");
      c.setAttribute("fill", "#cbd5e1");
      c.setAttribute("class", "minimap-dot");
      c.addEventListener("mouseenter", () => {
        this.setActive(i);
        this.onHover(i);
      });
      svg.appendChild(c);
      this.dots.push(c);
    });

    svg.addEventListener("mouseleave", () => {
      this.setActive(null);
      this.onHover(null);
    });

    container.appendChild(svg);
  }

  setActive(index: number | null) {
    if (this.active === index) return;
    if (this.active !== null && this.dots[this.active]) {
      const d = this.dots[this.active];
      d.setAttribute("r", "2.6");
      d.setAttribute("fill", "#cbd5e1");
    }
    this.active = index;
    if (index !== null && this.dots[index]) {
      const d = this.dots[index];
      d.setAttribute("r", "5");
      d.setAttribute("fill", "#fff");
    }
  }
}
