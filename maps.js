"use strict";

// Illustrated race maps. Everything is generated from data in landscape units (1000 x 620)
// and can be transposed into a portrait layout (620 x 1000) for narrow screens.
(function () {
  const INK = "#221d33";
  const W = 1000;
  const H = 620;

  const SPACES = [
    [70, 525], [140, 528], [200, 500], [248, 455], [282, 400], [292, 340], [272, 280], [228, 232],
    [178, 192], [132, 145], [178, 95], [248, 78], [320, 92], [374, 134], [404, 190], [432, 246],
    [492, 276], [556, 262], [610, 226], [650, 176], [690, 122], [755, 95], [822, 113], [872, 160],
    [902, 216], [902, 282], [876, 342], [830, 395], [772, 440], [738, 500], [826, 540]
  ];

  const ZONES = { center: [520, 470], west: [80, 330], east: [785, 268], north: [520, 104] };

  const THEMES = [
    {
      key: "grove", name: "Whisper Grove", mood: "Calm", blurb: "Soft meadow, no tricks on the road.",
      ground: "#4d8d48", patchLight: "#5fa356", patchDark: "#3e7a3c",
      road: "#e7cf98", roadEdge: "#a9834a", roadShadow: "#2f5f2f",
      stone: "#fbf3dc", stoneText: INK,
      scatter: ["pine", "pine", "bush", "bush", "flowers", "rock"],
      landmarks: { center: "pond", west: "oak", east: "mushrooms", north: "cottage" },
      palette: { pine: ["#2f6b3a", "#3f8a4a"], bush: "#3f8a4a", rock: "#9aa59a", flower: ["#ffd23f", "#ff8fb8", "#ffffff"] }
    },
    {
      key: "ember", name: "Ember Ridge", mood: "Chaos", blurb: "Lava rocks, boosts and nasty setbacks.",
      ground: "#4a2d2b", patchLight: "#5d3a33", patchDark: "#3a2222",
      road: "#3b2e31", roadEdge: "#ff8a3d", roadShadow: "#1f1416",
      stone: "#efe2d6", stoneText: INK,
      scatter: ["rock", "rock", "ember", "ember", "deadtree", "crack"],
      landmarks: { center: "lavalake", west: "volcano", east: "obsidian", north: "lavafall" },
      palette: { rock: "#6b5552", ember: "#ffb02e" }
    },
    {
      key: "moon", name: "Moon Pool", mood: "Calm", blurb: "A quiet night run by the water.",
      ground: "#21405e", patchLight: "#2a5070", patchDark: "#1a3450",
      road: "#c6d3e6", roadEdge: "#7f93b8", roadShadow: "#122638",
      stone: "#f4f7fc", stoneText: INK,
      scatter: ["willow", "glowshroom", "glowshroom", "firefly", "firefly", "reeds"],
      landmarks: { center: "moonpool", west: "willowbig", east: "stones", north: "lanterns" },
      palette: { rock: "#56708f" }
    },
    {
      key: "storm", name: "Storm Spire", mood: "Chaos", blurb: "The finale. Crystal cliffs and wild weather.",
      ground: "#353152", patchLight: "#433d66", patchDark: "#2a2742",
      road: "#a79fcf", roadEdge: "#ffd23f", roadShadow: "#1b1930",
      stone: "#f5f2ff", stoneText: INK,
      scatter: ["crystal", "crystal", "rock", "spark", "floatrock", "rock"],
      landmarks: { center: "spire", west: "stormcloud", east: "crystals", north: "floaters" },
      palette: { rock: "#5f5a86", crystal: ["#8de0ff", "#c9a8ff", "#ffd1f2"] }
    }
  ];

  function rng(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function orient(portrait) {
    return portrait
      ? { w: H, h: W, p: (x, y) => [y, x] }
      : { w: W, h: H, p: (x, y) => [x, y] };
  }

  function spacePoint(index, portrait) {
    const [x, y] = SPACES[Math.max(0, Math.min(SPACES.length - 1, index))];
    return orient(portrait).p(x, y);
  }

  function smoothPath(points) {
    let d = `M${points[0][0]} ${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
    }
    return d;
  }

  function blob(cx, cy, r, rand, points = 9) {
    const pts = [];
    for (let i = 0; i < points; i += 1) {
      const a = (i / points) * Math.PI * 2;
      const rr = r * (0.72 + rand() * 0.5);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.78]);
    }
    let d = "";
    for (let i = 0; i < pts.length; i += 1) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      d += i === 0 ? `M${m[0].toFixed(1)} ${m[1].toFixed(1)}` : "";
      const n = pts[(i + 2) % pts.length];
      const m2 = [(b[0] + n[0]) / 2, (b[1] + n[1]) / 2];
      d += ` Q${b[0].toFixed(1)} ${b[1].toFixed(1)} ${m2[0].toFixed(1)} ${m2[1].toFixed(1)}`;
    }
    return d + " Z";
  }

  function distToPath(x, y) {
    let best = Infinity;
    for (let i = 0; i < SPACES.length - 1; i += 1) {
      const [ax, ay] = SPACES[i];
      const [bx, by] = SPACES[i + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
      best = Math.min(best, Math.hypot(x - (ax + dx * t), y - (ay + dy * t)));
    }
    return best;
  }

  // ---------- Scenery pieces (drawn upright around an anchor point) ----------
  const o = (w = 2.4) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const P = {
    pine: (x, y, s, t) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="2" rx="14" ry="4" fill="#000" opacity=".18"/><rect x="-3" y="-6" width="6" height="9" fill="#6b4630" ${o(2)}/><path d="M0 -44 L16 -8 L-16 -8 Z" fill="${t.palette.pine[0]}" ${o()}/><path d="M0 -52 L12 -24 L-12 -24 Z" fill="${t.palette.pine[1]}" ${o()}/></g>`,
    bush: (x, y, s, t) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="2" rx="16" ry="4" fill="#000" opacity=".18"/><path d="M-16 0 Q-20 -14 -8 -16 Q-4 -26 6 -20 Q18 -20 16 -6 Q20 0 14 2 Z" fill="${t.palette.bush}" ${o()}/><circle cx="-4" cy="-10" r="2" fill="#ff8fb8"/><circle cx="7" cy="-12" r="2" fill="#ffd23f"/></g>`,
    flowers: (x, y, s, t) => `<g transform="translate(${x} ${y}) scale(${s})">${[[-8, -2], [0, -6], [8, 0], [-2, 4], [10, -8]].map(([a, b], i) => `<circle cx="${a}" cy="${b}" r="3" fill="${t.palette.flower[i % 3]}" ${o(1.4)}/>`).join("")}</g>`,
    rock: (x, y, s, t) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="3" rx="15" ry="4" fill="#000" opacity=".2"/><path d="M-14 2 L-10 -10 L0 -15 L11 -9 L14 2 Z" fill="${t.palette.rock || "#8a8f9a"}" ${o()}/><path d="M0 -15 L-2 -4 L11 -9" fill="none" stroke="#fff" stroke-width="1.6" opacity=".35"/></g>`,
    ember: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="5" fill="#ff6a2b" opacity=".35"/><circle r="2.6" fill="#ffd23f"/></g>`,
    crack: (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-18 0 L-8 -3 L-2 4 L8 -2 L18 2" fill="none" stroke="#ff7a2f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    deadtree: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="2" rx="10" ry="3" fill="#000" opacity=".2"/><path d="M0 0 V-30 M0 -18 L-10 -26 M0 -24 L9 -34 M-10 -26 L-14 -34" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M0 0 V-30 M0 -18 L-10 -26 M0 -24 L9 -34 M-10 -26 L-14 -34" fill="none" stroke="#5a3d34" stroke-width="2.6" stroke-linecap="round"/></g>`,
    willow: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="2" rx="16" ry="4" fill="#000" opacity=".2"/><rect x="-3" y="-14" width="6" height="16" fill="#4a3a3a" ${o(2)}/><path d="M-18 -4 Q-22 -34 0 -36 Q22 -34 18 -4 Q12 -14 8 -4 Q4 -14 0 -4 Q-4 -14 -8 -4 Q-12 -14 -18 -4 Z" fill="#3f8f7f" ${o()}/></g>`,
    glowshroom: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-8" r="13" fill="#9ff0ff" opacity=".18"/><rect x="-2.5" y="-8" width="5" height="9" fill="#e9f2ff" ${o(1.8)}/><path d="M-9 -7 Q0 -20 9 -7 Z" fill="#7fe3ff" ${o(1.8)}/></g>`,
    firefly: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="7" fill="#fff3a6" opacity=".22"/><circle r="2.2" fill="#fff3a6"/></g>`,
    reeds: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-6 0 Q-8 -14 -4 -24 M0 0 V-28 M6 0 Q8 -12 5 -22" fill="none" stroke="#7fbf9f" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="0" cy="-28" rx="2.6" ry="6" fill="#8a5a3b" ${o(1.4)}/></g>`,
    crystal: (x, y, s, t, r) => { const c = t.palette.crystal[Math.floor(r() * 3)]; return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="2" rx="13" ry="4" fill="#000" opacity=".22"/><path d="M-10 0 L-12 -14 L-6 -22 L-2 -8 Z M-4 0 L0 -32 L6 -18 L6 0 Z M6 0 L8 -16 L13 -10 L12 0 Z" fill="${c}" ${o(2)}/><path d="M0 -32 L1 -6" stroke="#fff" stroke-width="1.6" opacity=".6"/></g>`; },
    spark: (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="#ffd23f" opacity=".85"/>`,
    floatrock: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="14" rx="9" ry="2.4" fill="#000" opacity=".28"/><path d="M-12 -4 L-6 -12 L6 -13 L13 -5 L8 5 L-4 7 Z" fill="#6f6a9a" ${o(2.2)}/><path d="M-6 -12 L-2 -3 L13 -5" fill="none" stroke="#fff" stroke-width="1.4" opacity=".35"/><path d="M-2 -12 L0 -20 L3 -12 Z" fill="#8de0ff" ${o(1.6)}/></g>`
  };

  const LANDMARK = {
    pond: (x, y) => `<g transform="translate(${x} ${y})"><ellipse rx="96" ry="58" fill="#2f6f9f" ${o(3)}/><ellipse rx="84" ry="48" fill="#4aa3d8"/><path d="M-50 -18 q20 -8 40 0 M10 14 q20 -8 40 0" fill="none" stroke="#bfe7ff" stroke-width="3" stroke-linecap="round"/><g fill="#5fae5a" ${o(2)}><path d="M-46 18 a12 8 0 1 0 12 -6 l-10 4 z"/><path d="M34 -24 a10 7 0 1 0 10 -5 l-8 3 z"/></g><circle cx="-40" cy="16" r="3" fill="#ff8fb8"/>${P.reeds(-92, 30, 1)}${P.reeds(88, 0, 0.9)}</g>`,
    oak: (x, y) => `<g transform="translate(${x} ${y + 30})"><ellipse cx="0" cy="4" rx="46" ry="10" fill="#000" opacity=".2"/><path d="M-8 0 L-6 -40 L6 -40 L8 0 Z" fill="#6b4630" ${o(2.6)}/><path d="M-50 -40 Q-60 -80 -24 -86 Q-10 -112 18 -100 Q50 -100 50 -70 Q62 -46 34 -38 Q0 -28 -30 -36 Q-52 -32 -50 -40 Z" fill="#3f8a4a" ${o(3)}/><path d="M-30 -70 q10 -10 22 -6 M10 -84 q14 -4 22 6" fill="none" stroke="#6fbf5f" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="-60" r="4" fill="#ff6a5a" ${o(1.6)}/><circle cx="-22" cy="-52" r="4" fill="#ff6a5a" ${o(1.6)}/></g>`,
    mushrooms: (x, y) => `<g transform="translate(${x} ${y})">${[[-34, 10, 1.3], [0, -20, 1.6], [34, 8, 1.2], [6, 30, 1]].map(([a, b, s]) => `<g transform="translate(${a} ${b}) scale(${s})"><ellipse cx="0" cy="2" rx="12" ry="3" fill="#000" opacity=".2"/><rect x="-4" y="-12" width="8" height="14" rx="3" fill="#fff4e6" ${o(2)}/><path d="M-14 -10 Q0 -32 14 -10 Z" fill="#e8513b" ${o(2)}/><circle cx="-5" cy="-18" r="2.4" fill="#fff"/><circle cx="5" cy="-15" r="2" fill="#fff"/></g>`).join("")}</g>`,
    cottage: (x, y) => `<g transform="translate(${x} ${y + 20})"><ellipse cx="0" cy="4" rx="46" ry="9" fill="#000" opacity=".2"/><rect x="-32" y="-34" width="64" height="36" fill="#f3e2c0" ${o(3)}/><path d="M-42 -32 L0 -66 L42 -32 Z" fill="#c4553a" ${o(3)}/><rect x="-8" y="-20" width="16" height="22" fill="#7a4b2e" ${o(2.4)}/><rect x="14" y="-26" width="12" height="10" fill="#ffd36b" ${o(2)}/><rect x="18" y="-62" width="8" height="16" fill="#8a5a3b" ${o(2)}/><path d="M22 -68 q-6 -8 2 -14 q8 -6 4 -14" fill="none" stroke="#e8eef2" stroke-width="3" stroke-linecap="round" opacity=".8"/></g>`,
    lavalake: (x, y) => `<g transform="translate(${x} ${y})"><ellipse rx="98" ry="60" fill="#2a1a1a" ${o(3)}/><ellipse rx="86" ry="50" fill="#ff6a2b"/><ellipse rx="60" ry="30" fill="#ffb02e"/><ellipse rx="30" ry="14" fill="#ffe08a"/><g fill="#3b2a2a" ${o(2)}><path d="M-54 -12 l18 -6 l10 8 l-14 10 z"/><path d="M30 18 l16 -4 l8 10 l-18 6 z"/><path d="M40 -30 l12 -2 l4 8 l-12 4 z"/></g></g>`,
    volcano: (x, y) => `<g transform="translate(${x} ${y + 40})"><ellipse cx="0" cy="2" rx="62" ry="10" fill="#000" opacity=".25"/><path d="M-62 0 L-18 -92 L18 -92 L62 0 Z" fill="#5a3a33" ${o(3)}/><path d="M-18 -92 L-8 -70 L4 -84 L10 -66 L18 -92 Z" fill="#ff6a2b" ${o(2.4)}/><path d="M-6 -70 Q-14 -40 -30 -20 M8 -66 Q14 -36 30 -14" fill="none" stroke="#ff8a3d" stroke-width="4" stroke-linecap="round"/><g fill="#7a6a72" opacity=".85" ${o(2)}><circle cx="-6" cy="-108" r="12"/><circle cx="12" cy="-118" r="14"/><circle cx="-4" cy="-130" r="10"/></g></g>`,
    obsidian: (x, y) => `<g transform="translate(${x} ${y + 30})">${[[-30, 0, 1.2], [6, -6, 1.7], [36, 4, 1.1]].map(([a, b, s]) => `<g transform="translate(${a} ${b}) scale(${s})"><ellipse cx="0" cy="2" rx="14" ry="4" fill="#000" opacity=".25"/><path d="M-10 0 L-4 -40 L4 -30 L10 0 Z" fill="#2a2030" ${o(2)}/><path d="M-4 -40 L-2 -6" stroke="#ff8a3d" stroke-width="2" opacity=".8"/></g>`).join("")}</g>`,
    lavafall: (x, y) => `<g transform="translate(${x} ${y + 30})"><ellipse cx="0" cy="4" rx="70" ry="10" fill="#000" opacity=".25"/><path d="M-66 2 L-58 -40 Q-50 -70 -20 -72 L20 -72 Q50 -70 58 -40 L66 2 L36 2 L32 -30 Q24 -48 0 -48 Q-24 -48 -32 -30 L-36 2 Z" fill="#5a3a33" ${o(3)}/><path d="M-32 2 L-30 -26 Q-22 -42 0 -42 Q22 -42 30 -26 L32 2 Z" fill="#ff6a2b"/><path d="M-20 2 Q-18 -24 0 -26 Q18 -24 20 2 Z" fill="#ffb02e"/><path d="M-50 -50 l10 -4 M40 -60 l12 4" ${o(2)}/></g>`,
    moonpool: (x, y) => `<g transform="translate(${x} ${y})"><ellipse rx="98" ry="60" fill="#122a44" ${o(3)}/><ellipse rx="86" ry="50" fill="#1f5a7a"/><path d="M-6 -24 a20 20 0 1 0 22 26 a15 15 0 1 1 -22 -26 Z" fill="#fff3c4" opacity=".9"/><path d="M-60 10 q20 -6 40 0 M20 26 q18 -6 36 0" fill="none" stroke="#8fd3ff" stroke-width="2.6" stroke-linecap="round" opacity=".7"/><g fill="#3f8f7f" ${o(2)}><path d="M-56 -16 a11 7 0 1 0 11 -5 l-9 3 z"/><path d="M48 4 a10 6 0 1 0 10 -4 l-8 3 z"/></g><circle cx="52" cy="4" r="3" fill="#fff"/>${P.firefly(-70, -40, 1)}${P.firefly(70, -36, 1.2)}</g>`,
    willowbig: (x, y) => `<g transform="translate(${x} ${y + 30}) scale(2)">${P.willow(0, 0, 1)}</g>`,
    stones: (x, y) => `<g transform="translate(${x} ${y + 10})">${[[-40, 0], [-14, -24], [16, -24], [40, 0]].map(([a, b]) => `<g transform="translate(${a} ${b})"><ellipse cx="0" cy="2" rx="10" ry="3" fill="#000" opacity=".25"/><rect x="-8" y="-34" width="16" height="36" rx="6" fill="#7e94b5" ${o(2.4)}/><path d="M-3 -24 h6" stroke="#bfe7ff" stroke-width="2.4" stroke-linecap="round"/></g>`).join("")}<circle cx="0" cy="-6" r="10" fill="#bfe7ff" opacity=".3"/></g>`,
    lanterns: (x, y) => `<g transform="translate(${x} ${y + 20})">${[[-40, 0], [0, -12], [40, 0]].map(([a, b]) => `<g transform="translate(${a} ${b})"><circle cx="0" cy="-36" r="16" fill="#ffd36b" opacity=".18"/><path d="M0 0 V-30" ${o(3)}/><rect x="-7" y="-44" width="14" height="16" rx="3" fill="#ffd36b" ${o(2.2)}/></g>`).join("")}</g>`,
    spire: (x, y) => `<g transform="translate(${x} ${y + 50})"><ellipse cx="0" cy="2" rx="70" ry="12" fill="#000" opacity=".28"/><path d="M-60 0 L-40 -40 L-20 -30 L-6 -120 L14 -40 L30 -60 L60 0 Z" fill="#8de0ff" ${o(3)}/><path d="M-6 -120 L-2 -10 M30 -60 L24 -6 M-40 -40 L-34 -4" stroke="#fff" stroke-width="2.4" opacity=".6"/><path d="M-20 -30 L-6 -120 L14 -40 Z" fill="#c9a8ff" opacity=".55"/></g>`,
    stormcloud: (x, y) => `<g transform="translate(${x} ${y})"><path d="M10 -6 L-4 22 L8 22 L-6 50" fill="none" stroke="#ffd23f" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><g fill="#8b86b8" ${o(2.6)}><path d="M-46 0 Q-56 -24 -30 -26 Q-24 -50 4 -42 Q24 -56 38 -34 Q60 -32 52 -6 Q50 4 38 4 L-36 4 Q-48 4 -46 0 Z"/></g></g>`,
    crystals: (x, y, t, r) => `<g transform="translate(${x} ${y + 20})">${P.crystal(-30, 0, 1.6, t, r)}${P.crystal(10, -10, 2.2, t, r)}${P.crystal(40, 6, 1.4, t, r)}</g>`,
    floaters: (x, y) => `<g transform="translate(${x} ${y})">${P.floatrock(-50, 0, 1.6)}${P.floatrock(10, -24, 1.2)}${P.floatrock(56, 6, 1.4)}</g>`
  };

  const ICON = {
    boost: `<path d="M-9 4 L0 -5 L9 4 M-9 11 L0 2 L9 11" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -6)"/>`,
    setback: `<path d="M-9 -4 L0 5 L9 -4 M-9 -11 L0 -2 L9 -11" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 6)"/>`,
    trip: `<path d="M0 0 m-2 0 a2 2 0 1 1 4 0 a5 5 0 1 1 -9 -1 a8 8 0 1 1 15 4" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`
  };
  const SPECIAL = { boost: "#21a873", setback: "#d6402f", trip: "#f5b82e" };

  function scenery(theme, view, seed) {
    const rand = rng(seed);
    const out = [];
    const placed = Object.values(ZONES).map(([x, y]) => [x, y, 105]);
    let attempts = 0;
    while (out.length < 46 && attempts < 1600) {
      attempts += 1;
      const x = 20 + rand() * (W - 40);
      const y = 30 + rand() * (H - 50);
      if (distToPath(x, y) < 54) continue;
      if (placed.some(([px, py, pr]) => Math.hypot(px - x, py - y) < pr)) continue;
      placed.push([x, y, 30]);
      const kind = theme.scatter[Math.floor(rand() * theme.scatter.length)];
      const scale = 0.85 + rand() * 0.5;
      out.push({ kind, x, y, scale });
    }
    const [vx, vy] = [view.p, null];
    const sorted = out.map((item) => ({ ...item, pt: vx(item.x, item.y) })).sort((a, b) => a.pt[1] - b.pt[1]);
    return sorted.map((item) => P[item.kind](item.pt[0].toFixed(1), item.pt[1].toFixed(1), item.scale.toFixed(2), theme, rand)).join("");
  }

  function boardSvg(themeIndex, options = {}) {
    const theme = THEMES[themeIndex % THEMES.length];
    const portrait = Boolean(options.portrait);
    const chaosSpaces = options.chaosSpaces || {};
    const prefix = options.idPrefix || "m";
    const view = orient(portrait);
    const pts = SPACES.map(([x, y]) => view.p(x, y));
    const route = smoothPath(pts);
    const rand = rng(17 + themeIndex * 101);
    const patches = [];
    for (let i = 0; i < 9; i += 1) {
      const [x, y] = view.p(rand() * W, rand() * H);
      patches.push(`<path d="${blob(x, y, 70 + rand() * 90, rand)}" fill="${i % 3 === 0 ? theme.patchDark : theme.patchLight}" opacity=".7"/>`);
    }
    const landmarks = Object.entries(theme.landmarks).map(([zone, kind]) => {
      const [x, y] = view.p(...ZONES[zone]);
      return LANDMARK[kind](x, y, theme, rand);
    }).join("");

    const spaces = pts.map(([x, y], index) => {
      const effect = chaosSpaces[index];
      if (index === 0) {
        return `<g transform="translate(${x} ${y})" class="map-space"><circle r="34" fill="${theme.stone}" ${o(3)}/><circle r="27" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="4 4" opacity=".5"/><text y="5" class="map-label">START</text></g>`;
      }
      if (index === pts.length - 1) {
        return `<g transform="translate(${x} ${y})" class="map-space"><circle r="36" fill="#fff" ${o(3)}/><clipPath id="${prefix}-fin"><circle r="34"/></clipPath><g clip-path="url(#${prefix}-fin)">${Array.from({ length: 64 }, (_, k) => { const cx = (k % 8) * 10 - 40; const cy = Math.floor(k / 8) * 10 - 40; return (k + Math.floor(k / 8)) % 2 ? `<rect x="${cx}" y="${cy}" width="10" height="10" fill="${INK}"/>` : ""; }).join("")}</g><circle r="36" fill="none" ${o(3)}/><rect x="-30" y="-9" width="60" height="18" rx="4" fill="#ffd23f" ${o(2.4)}/><text y="5" class="map-label">FINISH</text></g>`;
      }
      if (effect) {
        const fill = SPECIAL[effect.type];
        return `<g transform="translate(${x} ${y})" class="map-space special ${effect.type}"><circle r="27" fill="${fill}" ${o(3)}/>${ICON[effect.type]}<g transform="translate(19 -19)"><circle r="12" fill="#fff" ${o(2)}/><text y="4.5" class="map-badge">${effect.type === "trip" ? "!" : effect.label}</text></g></g>`;
      }
      return `<g transform="translate(${x} ${y})" class="map-space"><circle r="24" fill="${theme.stone}" ${o(3)}/><text y="6" class="map-num" fill="${theme.stoneText}">${index}</text></g>`;
    }).join("");

    return `<svg class="map-svg" viewBox="0 0 ${view.w} ${view.h}" role="img" aria-label="${theme.name} race map" preserveAspectRatio="xMidYMid meet">
      <rect width="${view.w}" height="${view.h}" fill="${theme.ground}"/>
      ${patches.join("")}
      ${landmarks}
      ${scenery(theme, view, 99 + themeIndex * 7)}
      <path d="${route}" fill="none" stroke="${theme.roadShadow}" stroke-width="78" stroke-linecap="round" stroke-linejoin="round" opacity=".55" transform="translate(0 6)"/>
      <path d="${route}" fill="none" stroke="${INK}" stroke-width="72" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${route}" fill="none" stroke="${theme.roadEdge}" stroke-width="66" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${route}" fill="none" stroke="${theme.road}" stroke-width="56" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${route}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-dasharray="2 16" stroke-linecap="round" opacity=".35"/>
      ${spaces}
    </svg>`;
  }

  window.ArcaneMaps = {
    THEMES,
    SPACE_COUNT: SPACES.length,
    themeFor: (raceNumber) => THEMES[raceNumber % THEMES.length],
    boardSvg,
    spacePoint,
    size: (portrait) => (portrait ? { w: H, h: W } : { w: W, h: H })
  };
})();
