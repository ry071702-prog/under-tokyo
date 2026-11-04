// 都営大江戸線 (Toei Oedo Line) 駅データ
//
// ⚠️ データの正確性について (重要)
//  - depth (ホーム深さ) が公表値なのは 六本木 42.3m / 東中野 38.8m / 新宿 36.6m / 中井 35.1m の4駅だけ
//    published: true がその4駅  残り34駅の depth は概算 (estimated)
//  - ground (地表標高) は 六本木も含めた全38駅が概算  公表値の4駅でも trackElevation() で出す
//    「線路の海抜」は概算の ground を引いた値なので概算まじりになる
//    台地・谷・低地という地形のトレンドは実地形に寄せているが、数値そのものは暫定
//  - lat/lng はミニマップの概形用の概略座標
//  - 全駅の縦断面 (建設記録) に基づく精緻化は今後のフェーズで対応する
//
// 公表値の出典と、その限界:
//  - 「駅の深さ」の定義 = 駅中心位置の地表からホーム面までの距離
//    (東京都交通局による定義として引用されているもの)
//  - 4駅の数値は「東京のモグラ駅、深さランキング TOP10」(tabi-mag.jp) に載っている値
//    https://tabi-mag.jp/underground-stationtk/
//    この記事は定義の出どころを東京都交通局としているが、表の数値そのものの一次資料は示していない
//  - 六本木の 42.3m は大門方面ホーム  新宿方面ホームは 32.8m という報道がある
//    https://trafficnews.jp/post/131168
//  - 東京都交通局が全38駅の深さを一覧で公表している資料は、2026年11月時点で見つけられていない
//
// 並び順: 光が丘(E38) → 都庁前(E28) → 環状部を E27→E01 と一周
// 断面は「光が丘 → 新宿西口」を一本の連続プロファイルとして描く

export interface Station {
  /** 駅ナンバリング (例 "E23") */
  id: string;
  name: string;
  nameEn: string;
  /** 概略緯度 (ミニマップ用) */
  lat: number;
  /** 概略経度 (ミニマップ用) */
  lng: number;
  /** 地表標高 m (全38駅が概算) */
  ground: number;
  /** ホーム深さ m (駅中心位置の地表からホーム面まで) */
  depth: number;
  /** depth が公表値なら true、概算なら false */
  published: boolean;
}

export const OEDO_LINE = {
  id: "oedo",
  name: "都営大江戸線",
  nameEn: "Toei Oedo Line",
  color: "#ce045b", // 大江戸線のラインカラー (マゼンタ)
};

export const OEDO_STATIONS: Station[] = [
  { id: "E38", name: "光が丘", nameEn: "Hikarigaoka", lat: 35.7602, lng: 139.6322, ground: 36, depth: 17, published: false },
  { id: "E37", name: "練馬春日町", nameEn: "Nerima-kasugacho", lat: 35.7462, lng: 139.6421, ground: 35, depth: 19, published: false },
  { id: "E36", name: "豊島園", nameEn: "Toshimaen", lat: 35.7432, lng: 139.6480, ground: 33, depth: 16, published: false },
  { id: "E35", name: "練馬", nameEn: "Nerima", lat: 35.7375, lng: 139.6537, ground: 34, depth: 17, published: false },
  { id: "E34", name: "新江古田", nameEn: "Shin-egota", lat: 35.7301, lng: 139.6671, ground: 33, depth: 22, published: false },
  { id: "E33", name: "落合南長崎", nameEn: "Ochiai-minami-nagasaki", lat: 35.7243, lng: 139.6733, ground: 32, depth: 24, published: false },
  { id: "E32", name: "中井", nameEn: "Nakai", lat: 35.7153, lng: 139.6851, ground: 25, depth: 35.1, published: true },
  { id: "E31", name: "東中野", nameEn: "Higashi-nakano", lat: 35.7060, lng: 139.6835, ground: 33, depth: 38.8, published: true },
  { id: "E30", name: "中野坂上", nameEn: "Nakano-sakaue", lat: 35.6971, lng: 139.6852, ground: 37, depth: 32, published: false },
  { id: "E29", name: "西新宿五丁目", nameEn: "Nishi-shinjuku-gochome", lat: 35.6922, lng: 139.6873, ground: 36, depth: 27, published: false },
  { id: "E28", name: "都庁前", nameEn: "Tochomae", lat: 35.6905, lng: 139.6925, ground: 37, depth: 32, published: false },
  { id: "E27", name: "新宿", nameEn: "Shinjuku", lat: 35.6931, lng: 139.7006, ground: 36, depth: 36.6, published: true },
  { id: "E26", name: "代々木", nameEn: "Yoyogi", lat: 35.6834, lng: 139.7021, ground: 34, depth: 28, published: false },
  { id: "E25", name: "国立競技場", nameEn: "Kokuritsu-kyogijo", lat: 35.6792, lng: 139.7140, ground: 33, depth: 36, published: false },
  { id: "E24", name: "青山一丁目", nameEn: "Aoyama-itchome", lat: 35.6725, lng: 139.7241, ground: 33, depth: 33, published: false },
  { id: "E23", name: "六本木", nameEn: "Roppongi", lat: 35.6628, lng: 139.7314, ground: 32, depth: 42.3, published: true },
  { id: "E22", name: "麻布十番", nameEn: "Azabu-juban", lat: 35.6549, lng: 139.7365, ground: 12, depth: 30, published: false },
  { id: "E21", name: "赤羽橋", nameEn: "Akabanebashi", lat: 35.6553, lng: 139.7452, ground: 8, depth: 28, published: false },
  { id: "E20", name: "大門", nameEn: "Daimon", lat: 35.6581, lng: 139.7548, ground: 4, depth: 24, published: false },
  { id: "E19", name: "汐留", nameEn: "Shiodome", lat: 35.6634, lng: 139.7621, ground: 4, depth: 20, published: false },
  { id: "E18", name: "築地市場", nameEn: "Tsukiji-shijo", lat: 35.6653, lng: 139.7700, ground: 3, depth: 19, published: false },
  { id: "E17", name: "勝どき", nameEn: "Kachidoki", lat: 35.6591, lng: 139.7773, ground: 3, depth: 23, published: false },
  { id: "E16", name: "月島", nameEn: "Tsukishima", lat: 35.6652, lng: 139.7841, ground: 3, depth: 26, published: false },
  { id: "E15", name: "門前仲町", nameEn: "Monzen-nakacho", lat: 35.6721, lng: 139.7962, ground: 2, depth: 30, published: false },
  { id: "E14", name: "清澄白河", nameEn: "Kiyosumi-shirakawa", lat: 35.6814, lng: 139.8003, ground: 2, depth: 30, published: false },
  { id: "E13", name: "森下", nameEn: "Morishita", lat: 35.6882, lng: 139.7972, ground: 2, depth: 27, published: false },
  { id: "E12", name: "両国", nameEn: "Ryogoku", lat: 35.6960, lng: 139.7932, ground: 3, depth: 31, published: false },
  { id: "E11", name: "蔵前", nameEn: "Kuramae", lat: 35.7050, lng: 139.7912, ground: 6, depth: 27, published: false },
  { id: "E10", name: "新御徒町", nameEn: "Shin-okachimachi", lat: 35.7065, lng: 139.7831, ground: 8, depth: 25, published: false },
  { id: "E09", name: "上野御徒町", nameEn: "Ueno-okachimachi", lat: 35.7072, lng: 139.7742, ground: 10, depth: 28, published: false },
  { id: "E08", name: "本郷三丁目", nameEn: "Hongo-sanchome", lat: 35.7071, lng: 139.7601, ground: 20, depth: 33, published: false },
  { id: "E07", name: "春日", nameEn: "Kasuga", lat: 35.7082, lng: 139.7522, ground: 16, depth: 32, published: false },
  { id: "E06", name: "飯田橋", nameEn: "Iidabashi", lat: 35.7021, lng: 139.7451, ground: 9, depth: 38, published: false },
  { id: "E05", name: "牛込神楽坂", nameEn: "Ushigome-kagurazaka", lat: 35.7033, lng: 139.7351, ground: 24, depth: 35, published: false },
  { id: "E04", name: "牛込柳町", nameEn: "Ushigome-yanagicho", lat: 35.6982, lng: 139.7281, ground: 27, depth: 33, published: false },
  { id: "E03", name: "若松河田", nameEn: "Wakamatsu-kawada", lat: 35.6951, lng: 139.7221, ground: 28, depth: 33, published: false },
  { id: "E02", name: "東新宿", nameEn: "Higashi-shinjuku", lat: 35.6972, lng: 139.7061, ground: 30, depth: 33, published: false },
  { id: "E01", name: "新宿西口", nameEn: "Shinjuku-nishiguchi", lat: 35.6942, lng: 139.7001, ground: 36, depth: 27, published: false },
];

/** 駅の線路面の海抜 (m)  地表標高 - 深さ  負なら海面下  ground が概算なので結果も概算 */
export function trackElevation(s: Station): number {
  return s.ground - s.depth;
}
