"use strict";

// Original character portraits for every runner. Each portrait is a 100x100 SVG,
// drawn with one shared ink outline, eye style and light direction so the cast reads as a set.
(function () {
  const INK = "#221d33";
  const o = (w = 2.6) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  function eye(x, y, r = 5, opts = {}) {
    const lx = opts.lx ?? 0.7;
    const ly = opts.ly ?? 0.5;
    const iris = opts.iris || INK;
    const px = x + lx;
    const py = y + ly;
    return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${(r * 1.14).toFixed(2)}" fill="#fff" ${o(2.2)}/>`
      + `<circle cx="${px}" cy="${py}" r="${(r * 0.6).toFixed(2)}" fill="${iris}"/>`
      + (iris !== INK ? `<circle cx="${px}" cy="${py}" r="${(r * 0.3).toFixed(2)}" fill="${INK}"/>` : "")
      + `<circle cx="${(px - r * 0.24).toFixed(2)}" cy="${(py - r * 0.3).toFixed(2)}" r="${(r * 0.24).toFixed(2)}" fill="#fff"/>`;
  }
  const shut = (x, y, w = 4.5) => `<path d="M${x - w} ${y} q${w} ${w * 0.75} ${w * 2} 0" fill="none" ${o(2.4)}/>`;
  const blush = (x, y, c = "#ff7d93") => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.3" fill="${c}" opacity=".6"/>`;
  const smile = (x, y, w = 3.6) => `<path d="M${x - w} ${y} q${w} ${w * 0.95} ${w * 2} 0" fill="none" ${o(2.2)}/>`;
  const grin = (x, y, w = 5) => `<path d="M${x - w} ${y} q${w} ${w * 1.2} ${w * 2} 0 z" fill="#7a2d3c" ${o(2.2)}/>`;
  const spark = (x, y, s = 3, c = "#fff", op = 0.9) => `<path d="M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z" fill="${c}" opacity="${op}"/>`;

  function frame(id, bg, bgLight, body) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">`
      + `<defs><clipPath id="d"><circle cx="50" cy="50" r="48"/></clipPath></defs>`
      + `<circle cx="50" cy="50" r="48" fill="${bg}"/>`
      + `<g clip-path="url(#d)"><circle cx="34" cy="26" r="40" fill="${bgLight}" opacity=".35"/>${body}</g>`
      + `<circle cx="50" cy="50" r="47" fill="none" stroke="${INK}" stroke-width="2.4"/>`
      + `</svg>`;
  }

  const ART = {
    "clockwork-hare": () => frame("hare", "#2b6f8c", "#5fb3cf", `
      <path d="M18 104 Q22 80 50 78 Q78 80 82 104 Z" fill="#c98f3a" ${o()}/>
      <circle cx="50" cy="92" r="6" fill="#e5b65c" stroke="#7a5420" stroke-width="2.4" stroke-dasharray="3 2"/><circle cx="50" cy="92" r="2" fill="#7a5420"/>
      <path d="M38 50 Q26 26 32 8 Q44 14 46 44 Z" fill="#e5b65c" ${o()}/>
      <path d="M36 42 Q31 26 34 15 Q40 22 42 40 Z" fill="#f4a3a8"/>
      <path d="M58 46 Q64 22 78 12 Q82 28 66 50 Z" fill="#e5b65c" ${o()}/>
      <path d="M62 44 Q68 28 75 20 Q76 30 67 46 Z" fill="#f4a3a8"/>
      <path d="M80 60 h10" ${o(3.2)}/><path d="M90 52 q8 0 8 8 q0 8 -8 8 z" fill="#c98f3a" ${o(2.4)}/>
      <ellipse cx="50" cy="62" rx="27" ry="23" fill="#e5b65c" ${o()}/>
      <path d="M70 50 Q80 66 66 82 Q74 64 66 52 Z" fill="#c98f3a" opacity=".55"/>
      ${eye(41, 59, 5.4)}${eye(59, 59, 5.4)}
      <path d="M47 67 h6 l-3 3.4 z" fill="#e46b82" ${o(1.8)}/>
      <path d="M50 70.5 v3 M50 73.5 q-3 2.5 -6 0 M50 73.5 q3 2.5 6 0" fill="none" ${o(2)}/>
      ${blush(34, 68)}${blush(66, 68)}
      <path d="M28 70 h-9 M28 74 h-8 M72 70 h9 M72 74 h8" ${o(1.6)}/>`),

    "moss-golem": () => frame("golem", "#c46f2c", "#f0a55c", `
      <path d="M8 104 Q8 78 30 74 L70 74 Q92 78 92 104 Z" fill="#7d8896" ${o()}/>
      <path d="M24 86 l8 -3 l3 6 M70 84 l7 4" fill="none" ${o(2)}/>
      <path d="M22 50 Q22 30 40 28 L62 28 Q80 30 80 50 L80 70 Q80 86 62 86 L38 86 Q20 86 20 70 Z" fill="#a1abb7" ${o()}/>
      <path d="M72 34 Q82 54 74 82 Q70 58 62 40 Z" fill="#7d8896" opacity=".75"/>
      <path d="M28 76 l6 -4 l2 5 M64 36 l6 4" fill="none" ${o(1.8)}/>
      <path d="M18 46 Q18 22 50 20 Q82 22 82 46 Q76 42 72 48 Q66 40 60 46 Q54 38 48 46 Q42 38 36 46 Q30 40 24 48 Q20 44 18 46 Z" fill="#5fa046" ${o()}/>
      <path d="M30 32 q6 -4 12 -2 M56 28 q6 -2 10 2" fill="none" stroke="#8fd16b" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M62 22 v-6" ${o(2)}/><path d="M55 17 Q62 6 69 17 Z" fill="#e8553a" ${o(2)}/><circle cx="60" cy="13" r="1.3" fill="#fff"/><circle cx="64.5" cy="14" r="1" fill="#fff"/>
      <circle cx="32" cy="24" r="2.8" fill="#ffd8e6" ${o(1.4)}/>
      <path d="M26 54 Q38 48 48 54 M52 54 Q62 48 74 54" fill="none" stroke="#6c7684" stroke-width="5" stroke-linecap="round"/>
      ${eye(38, 61, 4.6, { iris: "#2f9a6f" })}${eye(62, 61, 4.6, { iris: "#2f9a6f" })}
      <path d="M43 75 q7 3 14 0" fill="none" ${o(2.4)}/>
      ${blush(29, 70, "#e8865a")}${blush(71, 70, "#e8865a")}`),

    "comet-kid": () => frame("comet", "#1f2c5c", "#4964b8", `
      ${spark(80, 22, 4)}${spark(18, 70, 3, "#ffd23f")}${spark(86, 76, 2.4)}
      <path d="M50 30 Q70 6 98 2 Q86 18 90 22 Q80 26 82 34 Q70 30 62 40 Z" fill="#ff7a2f" ${o()}/>
      <path d="M56 32 Q72 16 90 12 Q80 22 80 28 Q72 28 66 36 Z" fill="#ffd23f"/>
      <path d="M20 104 Q22 80 50 78 Q78 80 80 104 Z" fill="#e8463c" ${o()}/>
      <path d="M44 80 l6 10 l6 -10" fill="none" ${o(2.2)}/>
      <ellipse cx="50" cy="58" rx="23" ry="24" fill="#f4c49e" ${o()}/>
      <path d="M26 52 Q26 28 50 28 Q72 28 76 50 Q68 40 58 44 Q54 36 44 42 Q36 38 26 52 Z" fill="#ff7a2f" ${o()}/>
      <path d="M24 48 h52" stroke="#3b3a55" stroke-width="5" stroke-linecap="round"/>
      <circle cx="40" cy="48" r="7.5" fill="#9fe4ff" ${o(2.4)}/><circle cx="60" cy="48" r="7.5" fill="#9fe4ff" ${o(2.4)}/>
      <path d="M36 45 l4 -3 M56 45 l4 -3" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      ${eye(41, 62, 4.4)}${eye(59, 62, 4.4)}
      ${grin(50, 70, 5.5)}
      ${blush(33, 69)}${blush(67, 69)}`),

    "bubble-witch": () => frame("witch", "#2f8d84", "#7fd8c9", `
      <circle cx="50" cy="56" r="40" fill="#d9fff8" opacity=".22" ${o(2)}/>
      <path d="M26 30 q4 -6 10 -6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/>
      <circle cx="82" cy="30" r="6" fill="#e9fffb" opacity=".5" ${o(1.8)}/><circle cx="16" cy="66" r="4" fill="#e9fffb" opacity=".5" ${o(1.6)}/>
      <path d="M22 104 Q24 82 50 80 Q76 82 78 104 Z" fill="#5a3e8a" ${o()}/>
      <path d="M30 56 Q26 76 34 86 L38 66 Z M70 56 Q74 76 66 86 L62 66 Z" fill="#ff8fb8" ${o(2.2)}/>
      <ellipse cx="50" cy="62" rx="20" ry="20" fill="#f6d2b8" ${o()}/>
      <path d="M22 46 Q50 38 78 46 Q74 52 50 50 Q26 52 22 46 Z" fill="#5a3e8a" ${o()}/>
      <path d="M34 46 Q42 22 56 8 Q60 6 60 12 Q58 28 66 46 Z" fill="#5a3e8a" ${o()}/>
      <path d="M38 40 h28" stroke="#ff8fb8" stroke-width="4"/>
      <circle cx="58" cy="10" r="3.2" fill="#ffd23f" ${o(1.6)}/>
      ${eye(42, 62, 4.6, { iris: "#2f8d84" })}${eye(58, 62, 4.6, { iris: "#2f8d84" })}
      ${smile(50, 71, 3.2)}
      ${blush(35, 69)}${blush(65, 69)}`),

    "echo-fox": () => frame("fox", "#355779", "#6f9cc8", `
      <path d="M12 34 q-6 14 0 28 M6 28 q-9 20 0 40 M88 34 q6 14 0 28 M94 28 q9 20 0 40" fill="none" stroke="#bfe0ff" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>
      <path d="M24 104 Q26 84 50 82 Q74 84 76 104 Z" fill="#f08a3c" ${o()}/>
      <path d="M40 84 Q50 96 60 84 Q56 104 50 104 Q44 104 40 84 Z" fill="#fff4e6"/>
      <path d="M26 46 L20 10 L44 32 Z" fill="#f08a3c" ${o()}/><path d="M27 38 L24 18 L37 31 Z" fill="#4b2a2a"/>
      <path d="M74 46 L80 10 L56 32 Z" fill="#f08a3c" ${o()}/><path d="M73 38 L76 18 L63 31 Z" fill="#4b2a2a"/>
      <path d="M18 54 Q22 30 50 28 Q78 30 82 54 Q82 66 68 74 L50 84 L32 74 Q18 66 18 54 Z" fill="#f08a3c" ${o()}/>
      <path d="M22 60 Q36 56 50 70 Q64 56 78 60 Q74 72 50 84 Q26 72 22 60 Z" fill="#fff4e6" ${o(2)}/>
      ${eye(38, 54, 4.8, { iris: "#3d2a1f" })}${eye(62, 54, 4.8, { iris: "#3d2a1f" })}
      <ellipse cx="50" cy="71" rx="4.4" ry="3.2" fill="${INK}"/>
      <path d="M50 74 v3 q-3 3 -6 1 M50 77 q3 3 6 1" fill="none" ${o(1.8)}/>
      ${blush(30, 64)}${blush(70, 64)}`),

    "anchor-knight": () => frame("knight", "#b0453c", "#e5806f", `
      <path d="M14 104 Q16 80 50 78 Q84 80 86 104 Z" fill="#8da0b6" ${o()}/>
      <path d="M50 84 v16 M44 88 h12 M42 96 q8 8 16 0" fill="none" ${o(2.4)}/>
      <path d="M58 14 Q66 4 74 14 Q66 12 62 20 Z" fill="#ffd23f" ${o(2)}/>
      <path d="M24 60 Q22 24 50 20 Q78 24 76 60 Q76 76 50 80 Q24 76 24 60 Z" fill="#c3cfdc" ${o()}/>
      <path d="M66 26 Q78 42 72 70 Q66 48 58 32 Z" fill="#8da0b6" opacity=".7"/>
      <path d="M50 20 v14" ${o(2.2)}/>
      <rect x="28" y="46" width="44" height="20" rx="9" fill="#2a2840" ${o()}/>
      ${eye(41, 56, 4.4, { iris: "#ffcf5a" })}${eye(59, 56, 4.4, { iris: "#ffcf5a" })}
      <path d="M36 72 h28 M40 76 h20" ${o(1.8)}/>
      <circle cx="30" cy="36" r="2" fill="${INK}"/><circle cx="70" cy="36" r="2" fill="${INK}"/>`),

    "lantern-sprite": () => frame("lantern", "#2a2142", "#5a4a8c", `
      <circle cx="50" cy="56" r="34" fill="#ffd36b" opacity=".18"/>
      ${spark(18, 30, 3, "#ffd36b")}${spark(84, 70, 2.6, "#ffd36b")}${spark(82, 24, 2)}
      <path d="M50 4 v12" ${o(2.4)}/>
      <rect x="38" y="14" width="24" height="8" rx="3" fill="#3b2f5e" ${o(2.2)}/>
      <path d="M30 26 Q22 54 30 82 L70 82 Q78 54 70 26 Z" fill="#e8553a" ${o()}/>
      <path d="M34 30 Q30 54 34 78 M66 30 Q70 54 66 78 M50 26 v56" fill="none" stroke="#b83a26" stroke-width="2"/>
      <path d="M30 26 h40 M30 82 h40" ${o(2.6)}/>
      <path d="M50 38 Q66 52 60 68 Q56 76 50 76 Q42 76 40 68 Q36 54 50 38 Z" fill="#ffd36b" ${o(2.2)}/>
      <path d="M50 52 Q58 60 55 68 Q53 72 50 72 Q46 72 45 68 Q43 60 50 52 Z" fill="#fff6d0"/>
      ${eye(46, 63, 3, { lx: 0.4 })}${eye(55, 63, 3, { lx: 0.4 })}
      <rect x="40" y="82" width="20" height="7" rx="3" fill="#3b2f5e" ${o(2.2)}/>
      <path d="M44 89 l-2 8 M50 89 v9 M56 89 l2 8" stroke="#e8553a" stroke-width="2.4" stroke-linecap="round"/>`),

    "prism-slime": () => frame("slime", "#27665d", "#55b3a3", `
      <path d="M12 96 Q10 70 26 52 Q34 24 50 22 Q66 24 74 52 Q90 70 88 96 Q50 104 12 96 Z" fill="#9be7ff" opacity=".9" ${o()}/>
      <path d="M50 22 L36 60 L58 66 Z" fill="#ffc6f1" opacity=".75"/>
      <path d="M58 66 L74 52 L88 96 Z" fill="#c8ff9e" opacity=".7"/>
      <path d="M36 60 L12 96 L44 98 Z" fill="#fff2a6" opacity=".75"/>
      <path d="M58 66 L44 98 L88 96 Z" fill="#b6c8ff" opacity=".6"/>
      <path d="M36 60 L58 66 L50 22 M58 66 L44 98" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7"/>
      <path d="M30 40 q4 -10 12 -12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      ${eye(40, 62, 5.4)}${eye(60, 62, 5.4)}
      ${grin(50, 74, 6)}
      ${blush(30, 72)}${blush(70, 72)}
      <circle cx="20" cy="92" r="3" fill="#9be7ff" ${o(1.6)}/>`),

    "storm-crow": () => frame("crow", "#5b6a8f", "#9aaccf", `
      <path d="M14 30 Q20 18 34 22 Q38 10 54 14 Q70 6 78 20 Q92 20 90 32 Z" fill="#dfe5f2" ${o(2.2)}/>
      <path d="M60 30 L50 52 L60 52 L48 74" fill="none" stroke="#ffd23f" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M18 104 Q18 74 50 70 Q82 74 82 104 Z" fill="#2c2c42" ${o()}/>
      <path d="M50 70 Q30 76 26 96 M50 70 Q70 76 74 96" fill="none" stroke="#45466a" stroke-width="2.4"/>
      <path d="M44 36 L40 22 L50 30 L54 18 L58 34 Z" fill="#2c2c42" ${o(2.2)}/>
      <ellipse cx="50" cy="56" rx="24" ry="22" fill="#2c2c42" ${o()}/>
      <path d="M30 50 Q40 44 46 52 M70 50 Q60 44 54 52" fill="none" stroke="#ffd23f" stroke-width="2.4" stroke-linecap="round"/>
      ${eye(39, 56, 5, { iris: "#ffd23f" })}${eye(61, 56, 5, { iris: "#ffd23f" })}
      <path d="M44 63 L56 63 L50 78 Z" fill="#ffb02e" ${o(2.2)}/>
      <path d="M45 67 h10" ${o(1.6)}/>`),

    "moon-moth": () => frame("moth", "#1d385a", "#3f6b9c", `
      ${spark(50, 12, 3)}${spark(16, 86, 2.4)}${spark(86, 88, 2.4)}
      <path d="M46 52 Q20 20 6 34 Q2 52 18 60 Q4 74 18 86 Q34 90 46 64 Z" fill="#cfe8b9" ${o()}/>
      <path d="M54 52 Q80 20 94 34 Q98 52 82 60 Q96 74 82 86 Q66 90 54 64 Z" fill="#cfe8b9" ${o()}/>
      <path d="M22 40 a8 8 0 1 0 8 10 a6 6 0 1 1 -8 -10 Z M78 40 a8 8 0 1 1 -8 10 a6 6 0 1 0 8 -10 Z" fill="#f6d36b" ${o(1.8)}/>
      <circle cx="22" cy="76" r="4" fill="#9cc7e8" ${o(1.6)}/><circle cx="78" cy="76" r="4" fill="#9cc7e8" ${o(1.6)}/>
      <path d="M44 28 Q36 10 28 12 M56 28 Q64 10 72 12" fill="none" ${o(2.2)}/>
      <circle cx="28" cy="12" r="3" fill="#f6d36b" ${o(1.6)}/><circle cx="72" cy="12" r="3" fill="#f6d36b" ${o(1.6)}/>
      <ellipse cx="50" cy="74" rx="9" ry="20" fill="#eef4f8" ${o()}/>
      <path d="M42 70 h16 M43 78 h14 M45 86 h10" stroke="#b9c9d6" stroke-width="2"/>
      <ellipse cx="50" cy="42" rx="14" ry="13" fill="#eef4f8" ${o()}/>
      ${eye(44, 42, 4)}${eye(56, 42, 4)}
      ${smile(50, 49, 2.6)}`),

    "gear-goblin": () => frame("goblin", "#6f4d2f", "#b07a4a", `
      <circle cx="82" cy="24" r="8" fill="#c7cfd9" stroke="#c7cfd9" stroke-width="5" stroke-dasharray="3.2 3"/><circle cx="82" cy="24" r="7" fill="#c7cfd9" ${o(2)}/><circle cx="82" cy="24" r="2.6" fill="#6f4d2f" ${o(1.4)}/>
      <path d="M18 104 Q20 80 50 78 Q80 80 82 104 Z" fill="#8c5a33" ${o()}/>
      <path d="M30 84 h40" stroke="#5b3a20" stroke-width="3"/><rect x="58" y="86" width="12" height="14" rx="2" fill="#c7cfd9" ${o(2)}/>
      <path d="M28 54 L2 40 Q8 60 28 66 Z" fill="#7cc36b" ${o()}/>
      <path d="M72 54 L98 40 Q92 60 72 66 Z" fill="#7cc36b" ${o()}/>
      <ellipse cx="50" cy="58" rx="24" ry="22" fill="#7cc36b" ${o()}/>
      <path d="M68 44 Q78 60 66 76 Q68 60 60 48 Z" fill="#5a9c4b" opacity=".7"/>
      <path d="M26 44 h48" stroke="#5b3a20" stroke-width="5" stroke-linecap="round"/>
      <circle cx="40" cy="42" r="8" fill="#ffcf5a" ${o(2.4)}/><circle cx="60" cy="42" r="8" fill="#ffcf5a" ${o(2.4)}/>
      <circle cx="40" cy="42" r="4.2" fill="#fff" ${o(1.6)}/><circle cx="60" cy="42" r="4.2" fill="#fff" ${o(1.6)}/>
      ${eye(41, 60, 4.2, { iris: "#b2381f" })}${eye(59, 60, 4.2, { iris: "#b2381f" })}
      <path d="M40 70 q10 7 20 0" fill="#fff" ${o(2.2)}/><path d="M45 70.8 v2.6 M55 70.8 v2.6" ${o(1.4)}/>
      <ellipse cx="50" cy="65" rx="3" ry="2" fill="#5a9c4b"/>`),

    "frost-yak": () => frame("yak", "#3f7dbd", "#82b6e8", `
      ${spark(50, 10, 3.4)}${spark(88, 66, 2.6)}${spark(12, 84, 2.4)}
      <path d="M28 40 Q8 44 6 22 Q4 14 10 12 Q12 28 30 30 Z" fill="#e2d1a8" ${o()}/>
      <path d="M72 40 Q92 44 94 22 Q96 14 90 12 Q88 28 70 30 Z" fill="#e2d1a8" ${o()}/>
      <path d="M12 104 Q8 74 22 56 Q24 30 50 26 Q76 30 78 56 Q92 74 88 104 Z" fill="#f1f4fb" ${o()}/>
      <path d="M20 66 q4 8 0 16 M28 78 q4 8 0 14 M80 66 q-4 8 0 16 M72 78 q-4 8 0 14" fill="none" stroke="#b9c8e2" stroke-width="2.2" stroke-linecap="round"/>
      ${eye(40, 56, 4.4, { iris: "#2d5d93" })}${eye(60, 56, 4.4, { iris: "#2d5d93" })}
      <path d="M24 50 Q26 34 36 34 Q40 28 46 34 Q50 26 54 34 Q60 28 64 34 Q74 34 76 50 Q70 46 66 52 Q62 44 58 52 Q54 44 50 52 Q46 44 42 52 Q38 44 34 52 Q30 46 24 50 Z" fill="#dfe7f6" ${o(2.2)}/>
      <path d="M38 68 Q38 62 50 62 Q62 62 62 68 Q62 78 50 78 Q38 78 38 68 Z" fill="#6f84ad" ${o(2.2)}/>
      <ellipse cx="45" cy="68" rx="1.8" ry="2.4" fill="${INK}"/><ellipse cx="55" cy="68" rx="1.8" ry="2.4" fill="${INK}"/>
      <path d="M46 73.5 q4 2.4 8 0" fill="none" stroke="#dfe7f6" stroke-width="1.8" stroke-linecap="round"/>
      ${blush(30, 64, "#9fc4ff")}${blush(70, 64, "#9fc4ff")}`),

    "portal-pup": () => frame("pup", "#5a3a8c", "#9a73d6", `
      <circle cx="50" cy="50" r="40" fill="none" stroke="#c9a8ff" stroke-width="4" stroke-dasharray="18 10" opacity=".8"/>
      <circle cx="50" cy="50" r="31" fill="none" stroke="#8de0ff" stroke-width="3" stroke-dasharray="12 8" opacity=".7"/>
      <path d="M20 104 Q22 82 50 80 Q78 82 80 104 Z" fill="#d9a066" ${o()}/>
      <path d="M36 82 q14 10 28 0" fill="none" stroke="#e8553a" stroke-width="4.5"/><circle cx="50" cy="90" r="3.4" fill="#ffd23f" ${o(1.6)}/>
      <path d="M28 40 Q12 40 14 66 Q20 74 28 66 Z" fill="#8a5a3b" ${o()}/>
      <path d="M72 40 Q88 40 86 66 Q80 74 72 66 Z" fill="#8a5a3b" ${o()}/>
      <ellipse cx="50" cy="58" rx="23" ry="22" fill="#d9a066" ${o()}/>
      <path d="M50 40 Q58 44 58 56 Q50 52 42 56 Q42 44 50 40 Z" fill="#fff1dd"/>
      <ellipse cx="38" cy="54" rx="7" ry="6" fill="#8a5a3b" opacity=".55"/>
      ${eye(39, 55, 4.8)}${eye(61, 55, 4.8)}
      <ellipse cx="50" cy="66" rx="9" ry="7" fill="#fff1dd" ${o(2)}/>
      <ellipse cx="50" cy="63.5" rx="3.6" ry="2.6" fill="${INK}"/>
      <path d="M50 66 v2 q-3 3 -6 1 M50 68 q3 3 6 1" fill="none" ${o(1.8)}/>
      <path d="M47 71 q3 6 6 0 z" fill="#ff7d93" ${o(1.6)}/>`),

    "quake-beetle": () => frame("beetle", "#b8963d", "#e6c873", `
      <path d="M4 88 l14 -6 l6 8 l10 -10 l8 12 M96 88 l-14 -6 l-6 8 l-10 -10 l-8 12" fill="none" stroke="#7a5f22" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M26 92 l-10 8 M36 96 l-4 8 M74 92 l10 8 M64 96 l4 8" ${o(2.6)}/>
      <ellipse cx="50" cy="74" rx="32" ry="24" fill="#2f6b4c" ${o()}/>
      <path d="M50 52 v46" ${o(2.4)}/>
      <path d="M26 64 Q32 56 44 56 M74 64 Q68 56 56 56" fill="none" stroke="#7fd1a0" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <path d="M44 34 Q44 14 54 8 Q52 22 58 30 Z" fill="#3e4a3f" ${o()}/>
      <ellipse cx="50" cy="46" rx="20" ry="15" fill="#3e4a3f" ${o()}/>
      ${eye(42, 46, 4.6)}${eye(58, 46, 4.6)}
      <path d="M45 55 q5 3 10 0" fill="none" stroke="#e6c873" stroke-width="2" stroke-linecap="round"/>
      <path d="M32 40 l-8 -8 M68 40 l8 -8" ${o(2.2)}/>`),

    "lucky-turnip": () => frame("turnip", "#5f9e47", "#97d07a", `
      <path d="M44 32 Q30 8 18 14 Q24 30 44 34 Z" fill="#4c8f3a" ${o()}/>
      <path d="M56 32 Q70 8 84 12 Q78 30 56 34 Z" fill="#4c8f3a" ${o()}/>
      <path d="M50 34 Q48 14 54 4 Q62 16 54 34 Z" fill="#6cbf55" ${o()}/>
      <path d="M50 30 Q78 32 80 60 Q80 82 54 92 L50 100 L46 92 Q20 82 20 60 Q22 32 50 30 Z" fill="#f6eef4" ${o()}/>
      <path d="M50 30 Q74 32 78 50 Q64 40 50 42 Q36 40 22 50 Q26 32 50 30 Z" fill="#c45ba0" ${o(2.2)}/>
      <path d="M66 58 Q74 70 62 84 Q66 70 60 60 Z" fill="#e2d2df" />
      ${eye(41, 62, 4.8)}${eye(59, 62, 4.8)}
      ${grin(50, 72, 4.6)}
      ${blush(32, 70)}${blush(68, 70)}
      <g transform="translate(80 80)"><circle cx="-3" cy="-3" r="3.6" fill="#7ed957" ${o(1.6)}/><circle cx="3" cy="-3" r="3.6" fill="#7ed957" ${o(1.6)}/><circle cx="-3" cy="3" r="3.6" fill="#7ed957" ${o(1.6)}/><circle cx="3" cy="3" r="3.6" fill="#7ed957" ${o(1.6)}/></g>`),

    "shadow-cat": () => frame("cat", "#d9a92f", "#ffd76b", `
      <path d="M78 104 Q96 70 84 46 Q80 40 84 34" fill="none" stroke="#2a2638" stroke-width="7" stroke-linecap="round"/>
      <path d="M8 70 q8 -4 14 2 M10 82 q8 -4 14 2" fill="none" stroke="#6a5a2a" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>
      <path d="M22 104 Q24 80 50 78 Q76 80 78 104 Z" fill="#2a2638" ${o()}/>
      <path d="M24 46 L22 14 L44 32 Z" fill="#2a2638" ${o()}/><path d="M27 38 L26 22 L37 31 Z" fill="#6b4a7a"/>
      <path d="M76 46 L78 14 L56 32 Z" fill="#2a2638" ${o()}/><path d="M73 38 L74 22 L63 31 Z" fill="#6b4a7a"/>
      <ellipse cx="50" cy="56" rx="28" ry="25" fill="#2a2638" ${o()}/>
      <path d="M30 40 Q40 34 50 34" fill="none" stroke="#4a4560" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="38" cy="54" rx="7" ry="7.6" fill="#d7ff5a" ${o(2)}/><ellipse cx="62" cy="54" rx="7" ry="7.6" fill="#d7ff5a" ${o(2)}/>
      <ellipse cx="39" cy="54.5" rx="2.2" ry="5.6" fill="${INK}"/><ellipse cx="63" cy="54.5" rx="2.2" ry="5.6" fill="${INK}"/>
      <circle cx="36.5" cy="51" r="1.6" fill="#fff"/><circle cx="60.5" cy="51" r="1.6" fill="#fff"/>
      <path d="M47 65 h6 l-3 3 z" fill="#ff8fb8"/>
      <path d="M50 68 q-3 3 -6 1 M50 68 q3 3 6 1" fill="none" stroke="#bdb5d6" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M26 64 h-12 M27 68 l-11 3 M74 64 h12 M73 68 l11 3" stroke="#bdb5d6" stroke-width="1.6" stroke-linecap="round"/>`),

    "crown-crab": () => frame("crab", "#2683a6", "#64c1e2", `
      <circle cx="16" cy="84" r="3" fill="none" stroke="#bfefff" stroke-width="2"/><circle cx="86" cy="80" r="2.4" fill="none" stroke="#bfefff" stroke-width="2"/>
      <path d="M22 60 Q6 50 8 34 Q2 24 12 20 Q20 26 16 34 Q22 30 24 22 Q32 30 22 40 Q26 50 32 54 Z" fill="#e8513b" ${o()}/>
      <path d="M78 60 Q94 50 92 34 Q98 24 88 20 Q80 26 84 34 Q78 30 76 22 Q68 30 78 40 Q74 50 68 54 Z" fill="#e8513b" ${o()}/>
      <path d="M24 84 l-14 10 M30 90 l-8 12 M76 84 l14 10 M70 90 l8 12" ${o(3)}/>
      <ellipse cx="50" cy="70" rx="30" ry="22" fill="#e8513b" ${o()}/>
      <path d="M70 58 Q82 72 70 88 Q72 72 64 62 Z" fill="#b8392a" opacity=".7"/>
      <path d="M38 44 v-10 M62 44 v-10" ${o(2.4)}/>
      ${eye(38, 32, 5.2)}${eye(62, 32, 5.2)}
      <path d="M34 22 L36 8 L44 16 L50 4 L56 16 L64 8 L66 22 Z" fill="#ffd23f" ${o(2.2)}/>
      <circle cx="50" cy="15" r="2" fill="#e8513b"/>
      ${smile(50, 70, 6)}
      ${blush(34, 70)}${blush(66, 70)}`),

    "nap-dragon": () => frame("dragon", "#30406c", "#5f78b8", `
      <text x="76" y="30" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="#dfe8ff" stroke="${INK}" stroke-width="1.3">z</text>
      <text x="86" y="18" font-family="Arial, sans-serif" font-weight="900" font-size="9" fill="#dfe8ff" stroke="${INK}" stroke-width="1.1">z</text>
      <path d="M18 104 Q20 80 50 78 Q80 80 82 104 Z" fill="#4f9a6c" ${o()}/>
      <path d="M38 80 Q50 92 62 80 Q60 104 50 104 Q40 104 38 80 Z" fill="#f4e7a8" ${o(2)}/>
      <path d="M40 86 h20 M42 93 h16" stroke="#d8c47a" stroke-width="2"/>
      <path d="M26 46 Q18 34 20 24 Q28 32 34 40 Z M74 46 Q82 34 80 24 Q72 32 66 40 Z" fill="#f4e7a8" ${o(2.2)}/>
      <ellipse cx="50" cy="57" rx="27" ry="22" fill="#6cc08b" ${o()}/>
      <path d="M70 44 Q80 60 68 76 Q70 60 62 48 Z" fill="#4f9a6c" opacity=".7"/>
      <path d="M30 40 Q34 18 56 16 Q70 16 76 26 Q84 30 84 40 Q80 34 74 36 Q66 30 30 40 Z" fill="#4a6fd1" ${o()}/>
      <path d="M40 30 Q52 24 66 26 M36 36 Q50 30 70 32" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/>
      <circle cx="84" cy="42" r="4.6" fill="#ffd23f" ${o(2)}/>
      ${shut(39, 56, 5)}${shut(61, 56, 5)}
      <path d="M33 55 l-3 -2 M67 55 l3 -2" ${o(1.6)}/>
      <path d="M33 70 Q34 62 50 62 Q66 62 67 70 Q66 78 50 78 Q34 78 33 70 Z" fill="#9bdcb0" ${o(2.2)}/>
      <path d="M43 67 q2 -2 3 1 M57 67 q-2 -2 -3 1" fill="none" ${o(1.8)}/>
      <path d="M45 74 q5 2 10 0" fill="none" ${o(1.8)}/>
      <path d="M14 66 q-4 -4 0 -8 q4 -4 8 0 q3 -3 6 1" fill="#dfe8ff" opacity=".8" ${o(1.6)}/>
      ${blush(30, 64)}${blush(70, 64)}`),

    "spark-snail": () => frame("snail", "#2b3a57", "#566f9c", `
      <path d="M10 92 Q30 86 90 92" fill="none" stroke="#7fb0ff" stroke-width="2" opacity=".5"/>
      <path d="M14 98 Q14 82 30 80 L70 80 Q86 80 88 98 Z" fill="#a8d86f" ${o()}/>
      <path d="M22 80 Q18 60 22 46 Q26 34 34 36 Q42 38 40 52 L40 80 Z" fill="#a8d86f" ${o()}/>
      <path d="M26 38 L20 22 M34 36 L36 20" ${o(2.4)}/><circle cx="20" cy="20" r="3.2" fill="#ffd23f" ${o(1.8)}/><circle cx="36" cy="18" r="3.2" fill="#ffd23f" ${o(1.8)}/>
      ${eye(26, 50, 3.8)}${eye(36, 50, 3.8)}
      ${smile(31, 60, 3)}
      <circle cx="64" cy="58" r="25" fill="#ffd23f" ${o()}/>
      <path d="M64 58 m-15 0 a15 15 0 1 1 15 15 a10 10 0 1 1 -10 -10 a5 5 0 1 1 5 5" fill="none" stroke="#e39a1f" stroke-width="3" stroke-linecap="round"/>
      <path d="M68 40 L58 58 L66 58 L58 76" fill="none" stroke="#fff" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/>
      ${spark(86, 30, 3, "#ffd23f")}${spark(90, 50, 2.2, "#ffd23f")}`),

    "wisp-twins": () => frame("wisps", "#1f2e48", "#3f5a88", `
      ${spark(50, 14, 3)}${spark(14, 30, 2)}${spark(88, 84, 2.4)}
      <path d="M8 76 Q6 40 30 34 Q50 34 50 58 Q50 76 42 80 Q36 90 26 82 Q18 92 8 76 Z" fill="#eafcff" ${o()}/>
      <path d="M92 70 Q96 36 72 30 Q52 32 52 56 Q52 74 60 78 Q66 88 76 80 Q84 90 92 70 Z" fill="#9f93c9" ${o()}/>
      <path d="M16 44 q6 -6 14 -6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
      ${eye(24, 54, 4.2, { iris: "#2b8fb3" })}${eye(38, 54, 4.2, { iris: "#2b8fb3" })}
      ${grin(31, 63, 4)}
      ${shut(65, 52, 3.6)}${shut(79, 52, 3.6)}
      <path d="M68 63 q4 -2 8 0" fill="none" ${o(2)}/>
      ${blush(20, 62)}${blush(84, 60, "#c9a8ff")}
      <path d="M44 26 q6 -8 12 0" fill="none" stroke="#ffd23f" stroke-width="2.4" stroke-linecap="round"/>`),

    "river-otter": () => frame("otter", "#3a8cad", "#7cc8e3", `
      <path d="M22 104 Q22 76 50 74 Q78 76 78 104 Z" fill="#6b4630" ${o()}/>
      <path d="M38 80 Q50 88 62 80 L62 104 L38 104 Z" fill="#e9d2ae"/>
      <circle cx="22" cy="44" r="5.4" fill="#6b4630" ${o(2.2)}/><circle cx="78" cy="44" r="5.4" fill="#6b4630" ${o(2.2)}/>
      <ellipse cx="50" cy="52" rx="30" ry="22" fill="#7b5236" ${o()}/>
      <path d="M66 36 q8 4 10 12" fill="none" stroke="#a87652" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M24 60 Q30 50 42 54 Q50 50 58 54 Q70 50 76 60 Q74 74 50 74 Q26 74 24 60 Z" fill="#efdcbc" ${o(2.2)}/>
      ${eye(40, 46, 4.2)}${eye(60, 46, 4.2)}
      <path d="M44 56 Q50 53 56 56 Q55 61 50 62 Q45 61 44 56 Z" fill="${INK}"/>
      <path d="M50 62 v3 M50 65 q-4 3 -7 0 M50 65 q4 3 7 0" fill="none" ${o(1.8)}/>
      <circle cx="36" cy="62" r="1" fill="${INK}"/><circle cx="33" cy="65" r="1" fill="${INK}"/><circle cx="64" cy="62" r="1" fill="${INK}"/><circle cx="67" cy="65" r="1" fill="${INK}"/>
      <path d="M30 63 h-16 M31 67 l-15 4 M70 63 h16 M69 67 l15 4" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M0 92 Q12 84 25 92 Q38 100 50 92 Q62 84 75 92 Q88 100 100 92 L100 104 L0 104 Z" fill="#9fdcf2" ${o(2.2)}/>
      <circle cx="84" cy="30" r="3" fill="#d7f4ff" ${o(1.6)}/><circle cx="14" cy="28" r="2.2" fill="#d7f4ff" ${o(1.4)}/>`),

    "meteor-mouse": () => frame("mouse", "#1b2443", "#3d4f8a", `
      ${spark(20, 20, 2.6)}${spark(86, 26, 2.2)}
      <path d="M4 60 Q20 44 40 58 L26 74 Q14 64 4 60 Z" fill="#ffb02e" opacity=".9"/>
      <path d="M10 76 Q24 64 40 72 L30 84 Q20 78 10 76 Z" fill="#ff7a2f" opacity=".9"/>
      <ellipse cx="52" cy="80" rx="32" ry="20" fill="#7a6a8a" ${o()}/>
      <circle cx="40" cy="80" r="5" fill="#5e5070"/><circle cx="62" cy="88" r="4" fill="#5e5070"/><circle cx="70" cy="74" r="3" fill="#5e5070"/>
      <circle cx="34" cy="30" r="12" fill="#c9c2d8" ${o()}/><circle cx="34" cy="30" r="6" fill="#ff9fb8"/>
      <circle cx="72" cy="28" r="12" fill="#c9c2d8" ${o()}/><circle cx="72" cy="28" r="6" fill="#ff9fb8"/>
      <ellipse cx="53" cy="48" rx="19" ry="17" fill="#c9c2d8" ${o()}/>
      <path d="M34 44 Q52 26 72 44" fill="none" stroke="#e8553a" stroke-width="5" stroke-linecap="round"/>
      ${eye(46, 48, 4.2)}${eye(60, 48, 4.2)}
      <circle cx="53" cy="56" r="2.6" fill="#ff7d93" ${o(1.6)}/>
      <path d="M44 58 h-10 M44 61 l-9 3 M62 58 h10 M62 61 l9 3" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>`),

    "mirror-owl": () => frame("owl", "#6c4c86", "#a985c7", `
      ${spark(84, 22, 3)}${spark(16, 80, 2.4)}
      <path d="M18 104 Q16 70 26 52 L74 52 Q84 70 82 104 Z" fill="#a8774a" ${o()}/>
      <path d="M36 78 q6 4 0 8 M50 76 q6 4 0 8 M64 78 q-6 4 0 8 M43 90 q6 4 0 8 M57 90 q-6 4 0 8" fill="none" stroke="#7a5233" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 34 L20 14 L36 26 Z M78 34 L80 14 L64 26 Z" fill="#8a5f3a" ${o()}/>
      <ellipse cx="50" cy="46" rx="30" ry="24" fill="#a8774a" ${o()}/>
      <circle cx="37" cy="44" r="12" fill="#f3e3c8" ${o(2.2)}/><circle cx="63" cy="44" r="12" fill="#f3e3c8" ${o(2.2)}/>
      <circle cx="63" cy="44" r="13.5" fill="none" stroke="#ffd23f" stroke-width="3"/>
      <path d="M76 46 Q80 60 74 70" fill="none" stroke="#ffd23f" stroke-width="2"/>
      ${eye(37, 44, 6.2)}${eye(63, 44, 6.2)}
      <path d="M58 37 l4 -2" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <path d="M46 54 L54 54 L50 63 Z" fill="#ffb02e" ${o(2)}/>`),

    "pepper-pixie": () => frame("pixie", "#e6a52c", "#ffd77a", `
      <path d="M40 46 Q12 20 6 34 Q4 48 34 56 Z" fill="#dff7ff" opacity=".85" ${o(2.2)}/>
      <path d="M60 46 Q88 20 94 34 Q96 48 66 56 Z" fill="#dff7ff" opacity=".85" ${o(2.2)}/>
      <path d="M14 34 q8 4 18 14 M86 34 q-8 4 -18 14" fill="none" stroke="#9fd8ec" stroke-width="1.6"/>
      <path d="M42 26 Q40 12 52 8 Q50 18 56 22 Z" fill="#4c8f3a" ${o()}/>
      <path d="M36 26 Q48 18 64 26 Q60 32 50 30 Q40 32 36 26 Z" fill="#5fa046" ${o(2.2)}/>
      <path d="M36 28 Q28 54 40 78 Q48 96 58 98 Q52 84 60 72 Q70 52 64 28 Q50 34 36 28 Z" fill="#e23b2e" ${o()}/>
      <path d="M60 32 Q68 54 58 74 Q62 54 56 36 Z" fill="#b5261c" opacity=".7"/>
      <path d="M40 34 q2 10 0 18" fill="none" stroke="#ff8a7a" stroke-width="3" stroke-linecap="round"/>
      ${eye(44, 48, 4.2)}${eye(56, 48, 4.2)}
      ${grin(50, 57, 4)}
      ${blush(40, 56, "#ffb3a6")}${blush(61, 56, "#ffb3a6")}
      ${spark(80, 76, 3.4, "#ff7a2f")}${spark(22, 76, 2.6, "#ff7a2f")}`)
  };

  const TINT = {
    "clockwork-hare": "#2b6f8c", "moss-golem": "#c46f2c", "comet-kid": "#1f2c5c", "bubble-witch": "#2f8d84",
    "echo-fox": "#355779", "anchor-knight": "#b0453c", "lantern-sprite": "#2a2142", "prism-slime": "#27665d",
    "storm-crow": "#5b6a8f", "moon-moth": "#1d385a", "gear-goblin": "#6f4d2f", "frost-yak": "#3f7dbd",
    "portal-pup": "#5a3a8c", "quake-beetle": "#b8963d", "lucky-turnip": "#5f9e47", "shadow-cat": "#d9a92f",
    "crown-crab": "#2683a6", "nap-dragon": "#30406c", "spark-snail": "#2b3a57", "wisp-twins": "#1f2e48",
    "river-otter": "#3a8cad", "meteor-mouse": "#1b2443", "mirror-owl": "#6c4c86", "pepper-pixie": "#e6a52c"
  };

  const cache = new Map();
  function runnerArtUri(id) {
    if (!cache.has(id)) {
      const draw = ART[id];
      const svg = draw ? draw() : frame("x", "#555", "#888", "");
      cache.set(id, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, " "))}`);
    }
    return cache.get(id);
  }

  function runnerArt(id, className = "", alt = "") {
    return `<img class="runner-art ${className}" src="${runnerArtUri(id)}" alt="${alt}" draggable="false" />`;
  }

  window.RunnerArt = { uri: runnerArtUri, img: runnerArt, tint: (id) => TINT[id] || "#334", ids: Object.keys(ART) };
})();
