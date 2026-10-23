"use strict";

// Original 16x16 pixel-art runners. Each sprite is a text grid: "." is transparent,
// "k" is the shared ink outline, "w" is white, and other letters come from the
// sprite's own palette. Rendered as crisp SVG on a round tinted badge.
(function () {
  const INK = "#221d33";
  const SIZE = 16;
  const BADGE = 20;

  const SPRITES = {
    "clockwork-hare": {
      palette: {y: "#e5b65c", o: "#b5832f", p: "#f49aa5", r: "#e46b82", g: "#c7cfd9"},
      grid: [
        "...kk....kk.....",
        "..kypk..kypk....",
        "..kypk..kypk....",
        "..kypk..kypk....",
        "..kyyk..kyyk....",
        "..kyykkkkyyk....",
        ".kyyyyyyyyyyk...",
        ".kyykwyyykwyk...",
        ".kyykkyyykkyk.kk",
        ".kyyyyyrryyyykgk",
        "..kyyykkkyyyokkk",
        "...kyyyyyyyok.gk",
        "..kyyyyyyyyyok..",
        "..kyoyyyyyyoyk..",
        "..kyyk.kk.kyyk..",
        "...kk......kk..."
      ]
    },
    "moss-golem": {
      palette: {s: "#a1abb7", d: "#717c8c", m: "#5fa046", M: "#8fd16b", r: "#e8553a", e: "#3ddc97"},
      grid: [
        "..........kkk...",
        ".........krwrk..",
        "..kkkkkkkkkwkk..",
        ".kmmMmmmmMmmmmk.",
        ".kmMmmmmmmmmMmk.",
        ".kmmmmmmmmmmmmk.",
        ".ksmssmmsssmssk.",
        ".kddddssssddddk.",
        ".ksskeksskeksk..",
        ".kssskssssksssk.",
        ".kssssssssssssk.",
        ".kssdkkkkkdsssk.",
        ".kdssssssssssdk.",
        "kddkddssssddkddk",
        "kddk.kkkkkk.kddk",
        ".kk..........kk."
      ]
    },
    "comet-kid": {
      palette: {f: "#f4c49e", o: "#ff7a2f", y: "#ffd23f", b: "#9fe4ff", g: "#3b3a55", r: "#e8463c"},
      grid: [
        "...........kyy..",
        ".........kooyk..",
        "....kkkkoooyk...",
        "...kooooooook...",
        "..kooyoooyooook.",
        "..kgggggggggggk.",
        "..kgbbbggbbbgk..",
        "..kgbkbggbkbgk..",
        "..kgggfffgggfk..",
        "..kffffffffffk..",
        "..kffkkkkkkffk..",
        "...kffkrrkffk...",
        "....kkkkkkkk....",
        "..kkrrrrrrrrkk..",
        ".krrrrryyrrrrrk.",
        ".krrrrrryrrrrrk."
      ]
    },
    "bubble-witch": {
      palette: {h: "#5a3e8a", H: "#7b5bb5", p: "#ff8fb8", f: "#f6d2b8", y: "#ffd23f", t: "#2f8d84", b: "#bff5ec"},
      grid: [
        "........ky......",
        ".......khk......",
        "......khHk....b.",
        ".....khhHk...b.b",
        ".....kpppk....b.",
        "...kkhhhhhkk....",
        "..khhhhhhhhhk...",
        "...kpffffffpk...",
        "...kpfkwfkwfpk..",
        "...kpfkkfkkfpk..",
        "...kpffffffppk..",
        "....kpfkkkfpk...",
        "....kkfffffkk...",
        "...khhhhhhhhhk..",
        "..khhhHhhhHhhhk.",
        "..kkkkkkkkkkkkk."
      ]
    },
    "echo-fox": {
      palette: {o: "#f08a3c", O: "#c2611f", c: "#fff4e6", d: "#4b2a2a", b: "#9fd0ff"},
      grid: [
        "..kk........kk..",
        "..kok......kok..",
        "..kodk....kdok..",
        "..koodkkkkdook..",
        ".kooooooooooook.",
        ".kooooooooooook.",
        ".koookwookwoook.",
        "bkoookkookkoookb",
        ".kcooooooooook..",
        ".kccooookkoocck.",
        "b.kcccckkcccck.b",
        "...kccckkccck...",
        "....kccccccck...",
        ".....kkcckkk....",
        "...kooookooook..",
        "...kkkkk.kkkkk.."
      ]
    },
    "anchor-knight": {
      palette: {s: "#c3cfdc", S: "#8da0b6", v: "#2a2840", y: "#ffcf5a", r: "#c8453a"},
      grid: [
        "..........kyyk..",
        ".........kyyk...",
        "....kkkkkkkk....",
        "...ksssssssSk...",
        "..kssssskssSSk..",
        "..kssssskssSSk..",
        "..kvvvvvvvvvvk..",
        "..kvykvvvvykvk..",
        "..kvvvvvvvvvvk..",
        "..ksssssssssSk..",
        "..kskskskskSSk..",
        "...kssssssSSk...",
        "..kkkkSkkSkkkk..",
        ".kSSSSkSSkSSSSk.",
        ".kSSSkSSSSkSSSk.",
        ".kkkkkkkkkkkkkk."
      ]
    },
    "lantern-sprite": {
      palette: {r: "#e8553a", R: "#b83a26", y: "#ffd36b", w: "#fff6d0", n: "#3b2f5e"},
      grid: [
        ".......kk.......",
        ".......kk.......",
        ".....kkkkkk.....",
        "....knnnnnnk....",
        "...kkkkkkkkkk...",
        "..krRrrrrrrRrk..",
        "..krRrryyrrRrk..",
        "..krRryyyyrRrk..",
        "..krRywkwkyRrk..",
        "..krRywkwkyRrk..",
        "..krRryyyyrRrk..",
        "..krRrrrrrrRrk..",
        "...kkkkkkkkkk...",
        "....knnnnnnk....",
        ".....krkrkr.....",
        ".....r.r..r....."
      ]
    },
    "prism-slime": {
      palette: {a: "#9be7ff", b: "#ffc6f1", c: "#c8ff9e", d: "#fff2a6", e: "#b6c8ff"},
      grid: [
        "................",
        ".......kk.......",
        "......kwbk......",
        ".....kwbbbk.....",
        "....kabbbbak....",
        "...kaabbbccak...",
        "...kaaaccccak...",
        "..kakwaaakwaak..",
        "..kakkaaakkaak..",
        ".kddaaaaaaaaeek.",
        ".kddaakkkkaaeek.",
        "kdddaaakkaaaeeek",
        "kddddaaaaaaeeeek",
        "kddddddaaeeeeeek",
        ".kkkkkkkkkkkkkk.",
        "................"
      ]
    },
    "storm-crow": {
      palette: {b: "#2c2c42", B: "#45466a", y: "#ffd23f", o: "#ffb02e", c: "#dfe5f2"},
      grid: [
        "...cccc..ccc....",
        "..cccccccccccc..",
        "....kk..k.......",
        "...kbbkkbk......",
        "..kbbbbbbbk.....",
        ".kbbbbbbbbbk....",
        ".kbykbbbykbk..y.",
        ".kbkkbbbkkbk.y..",
        ".kbbbbbbbbbk.yy.",
        ".kbbbkoookbbk.y.",
        "..kbbbkookbbbky.",
        "..kbbbbkkbbbBk..",
        ".kbBbbbbbbbBbbk.",
        ".kbbBbbbbbBbbbk.",
        "..kkkokkkokkkk..",
        "....kok..kok...."
      ]
    },
    "moon-moth": {
      palette: {g: "#cfe8b9", G: "#8fb87c", y: "#f6d36b", b: "#9cc7e8"},
      grid: [
        "..k..........k..",
        "...k........k...",
        "kkk.k......k.kkk",
        "kgggkk.kk.kkgggk",
        "kgyyggkwwkggyygk",
        "kgyggkwwwwkggygk",
        "kgggkwkwwkwkgggk",
        ".kggkwkwwkwkggk.",
        "..kkkwwwwwwkkk..",
        ".kbbbkwwwwkbbbk.",
        "kbGbbkwwwwkbbGbk",
        "kbbbbGkwwkGbbbbk",
        ".kbbbk.kk.kbbbk.",
        "..kkk......kkk..",
        "................",
        "................"
      ]
    },
    "gear-goblin": {
      palette: {g: "#7cc36b", G: "#5a9c4b", y: "#ffcf5a", b: "#5b3a20", r: "#b2381f", s: "#c7cfd9"},
      grid: [
        "...........ks.s.",
        "...........kssss",
        "....kkkkkk..ss.s",
        "k..kggggggk....k",
        "kk.kbbbbbbbk..kk",
        "kgkkywykywykkkgk",
        "kggkyyykyyykggk.",
        ".kgggggggggggk..",
        "..kgkrkggkrkgk..",
        "..kggggggggggk..",
        "..kggwkwkwkwgk..",
        "...kggkkkkggk...",
        "....kkkkkkkk....",
        "...kbbbbbbbbk...",
        "..kbbbsbbbbbbk..",
        "..kkkkkkkkkkkk.."
      ]
    },
    "frost-yak": {
      palette: {f: "#f1f4fb", F: "#c8d4ea", h: "#e2d1a8", m: "#6f84ad", b: "#2d5d93"},
      grid: [
        "kk............kk",
        "khk..........khk",
        ".khk.kkkkkk.khk.",
        "..khkFfFfFfkhk..",
        "...kfFfFfFffk...",
        "..kfFfFfFfFffk..",
        "..kffkbffkbffk..",
        "..kffkkffkkffk..",
        "..kfffffffffFk..",
        "..kffkmmmmkffk..",
        "..kfkmkmmkmkfk..",
        "..kffkmmmmkffk..",
        ".kfFfkkkkkkfFfk.",
        ".kFfFfFfFfFfFfk.",
        ".kFkFkFkFkFkFFk.",
        ".kk.k.k.k.k.kkk."
      ]
    },
    "portal-pup": {
      palette: {t: "#d9a066", T: "#8a5a3b", c: "#fff1dd", r: "#e8553a", y: "#ffd23f", v: "#c9a8ff", V: "#8a5ad6"},
      grid: [
        "...vvvv..vvvv...",
        "..vVk......kVv..",
        ".vkTTkkkkkkTTkv.",
        ".kTTktttttktTTk.",
        ".kTTkttccttkTTk.",
        ".kTkttccccttkTk.",
        "..kktkwttkwtkk..",
        "...ktkkttkktk...",
        "...kttcccctk....",
        "...ktccTTcctk...",
        "....kcckkcck....",
        "....kkcrrckk....",
        "...krrrkyrrrk...",
        "..ktttttttttk...",
        "v.ktkttttktk.v..",
        ".vvkk.kkk.kkvv.."
      ]
    },
    "quake-beetle": {
      palette: {s: "#6b7a6e", g: "#3f9a6a", G: "#9be8bd", y: "#e6c873", b: "#8a6a2a"},
      grid: [
        ".......kk.......",
        "......kssk......",
        "......kssk......",
        ".k....kssk....k.",
        "..k..kssssk..k..",
        "...kkssssssk.k..",
        "....kswkswkk....",
        "....kskkskskk...",
        "...kkkssssskkk..",
        "..kgGgggkggGggk.",
        ".kgGggggkgggGgk.",
        "kkggggggkggggggk",
        ".kgggggkkgggggk.",
        "k.kggggkkggggk.k",
        "...kkkkkkkkkk...",
        "..k..k....k..k.."
      ]
    },
    "lucky-turnip": {
      palette: {l: "#4c8f3a", L: "#7ed957", p: "#c45ba0", w: "#f6eef4", W: "#e2d2df", c: "#7ed957"},
      grid: [
        "....kk..kk......",
        "...kLLkkLLk.....",
        "....kLlLLk..kk..",
        ".....klllk.kLLk.",
        "....kkkkkkkkLk..",
        "...kpppppppppk..",
        "..kpppppppppppk.",
        "..kwwwwwwwwwwwk.",
        "..kwwkwwwwkwWwk.",
        "..kwwkkwwkkwWwk.",
        "..kwwwwwwwwwWwk.",
        "...kwwkkkkwWwk..",
        "....kwwkkwWwk...",
        ".....kwwwWwk....",
        "......kwWk......",
        ".......kk......."
      ]
    },
    "shadow-cat": {
      palette: {b: "#2a2638", B: "#4a4560", y: "#d7ff5a", p: "#ff8fb8", v: "#6b4a7a"},
      grid: [
        "..k.........k...",
        ".kbk.......kbk..",
        ".kvbk.....kbvk..",
        ".kbbbkkkkkbbbk..",
        ".kbbbbbbbbbbbk..",
        "kbbbbbbbbbbbbbk.",
        "kbbyykbbbyykbbk.",
        "kbbyykbbbyykbbk.",
        "kbbbbbbpbbbbbbk.",
        ".kbbbbbkbbbbbk..",
        "..kbbbbbbbbbk..k",
        "...kbbbbbbbk..kb",
        "..kbbBbbbBbbk.kb",
        "..kbbbbbbbbbbkbk",
        "..kbbkbbbkbbbbk.",
        "...kk.kkk.kkkk.."
      ]
    },
    "crown-crab": {
      palette: {r: "#e8513b", R: "#b8392a", y: "#ffd23f", w: "#ffffff"},
      grid: [
        ".....kkkkkk.....",
        ".....kykyky.....",
        ".....kyyyyk.....",
        "..kk.kwk.kwk.kk.",
        ".krrkkkk.kkkkrrk",
        "krrk.k......krrk",
        "krrrk.k....k.rrk",
        ".krrrkkkkkkkkrk.",
        "..kkrrrrrrrrrkk.",
        "...krrrrrrrrrk..",
        "..krrrkrrrrkrrk.",
        "..krrrrkkkkrrRk.",
        "..kRrrrrrrrrRRk.",
        "...kkkkkkkkkkk..",
        "..k.k.k...k.k.k.",
        ".k..k.......k..k"
      ]
    },
    "nap-dragon": {
      palette: {g: "#6cc08b", G: "#4f9a6c", c: "#f4e7a8", b: "#4a6fd1", y: "#ffd23f", m: "#9bdcb0"},
      grid: [
        ".....kkkkk...w..",
        "....kbbbybk..kw.",
        "...kbbbbbbbk.yk.",
        "..kbybbbbbbbkk..",
        ".kckkkkkkkkkck..",
        ".kcggggggggggck.",
        "..kggggggggggk..",
        "..kgkkkggkkkgk..",
        "..kggggggggggk..",
        "..kgmmmmmmmmgk..",
        "..kgmkmmmmkmgk..",
        "...kmmmkkmmmk...",
        "...kkkkkkkkkk...",
        "..kGgcccccgGgk..",
        ".kGggcccccggGk..",
        ".kkkkkkkkkkkkk.."
      ]
    },
    "spark-snail": {
      palette: {g: "#a8d86f", G: "#7fb04a", y: "#ffd23f", o: "#e39a1f", w: "#ffffff"},
      grid: [
        ".k..k...........",
        ".y..y...kkkkk...",
        ".k..k..kyyyyyk..",
        ".k..k.kyyooyyyk.",
        "kggggkyyowwoyyk.",
        "kgwkgkyowyyoyyk.",
        "kgkkgkyowyyoyyk.",
        "kggggkyyowoyyyk.",
        "kgkkgkyyyoyyyk..",
        "kggggkkyyyyykk..",
        "kggggggkkkkkggk.",
        "kgggggggggggggk.",
        ".kGGGGGGGGGGGk..",
        "..kkkkkkkkkkk...",
        "................",
        "................"
      ]
    },
    "wisp-twins": {
      palette: {a: "#eafcff", b: "#9f93c9", c: "#2b8fb3", B: "#7f73a9"},
      grid: [
        "................",
        "...kkkk.........",
        "..kaaaak..kkkk..",
        ".kaaaaaak.kbbbbk",
        ".kakwakwkkbbbbbk",
        ".kakkakkkkbkkbbk",
        ".kaaaaaakbbbbbbk",
        ".kaakkaakbbkkbbk",
        ".kaaaaaakbbbbbbk",
        ".kaaaaaakbbbbbbk",
        ".kaaaaaakbBbbBbk",
        ".kaakaakkbbkbbkk",
        "..kk.kk..kk.kk..",
        "................",
        "................",
        "................"
      ]
    },
    "river-otter": {
      palette: {b: "#7b5236", B: "#5c3a24", c: "#efdcbc", w: "#9fdcf2"},
      grid: [
        "................",
        "..kk........kk..",
        ".kbbkkkkkkkkbbk.",
        ".kbbbbbbbbbbbbk.",
        "kbbbbbbbbbbbbbbk",
        "kbbbkwbbbbkwbbbk",
        "kbbbkkbbbbkkbbbk",
        "kbbcccckkccccbbk",
        "kbcccckkkkccccbk",
        ".kccccckkccccck.",
        "..kcccckkcccck..",
        "...kkcccccckk...",
        "...kbbbbbbbbk...",
        "wwkbbBbbbbBbbkww",
        "wwwkwwkwwkwwkwww",
        "wwwwwwwwwwwwwwww"
      ]
    },
    "meteor-mouse": {
      palette: {g: "#c9c2d8", p: "#ff9fb8", r: "#e8553a", m: "#7a6a8a", M: "#5e5070", o: "#ff7a2f", y: "#ffd23f"},
      grid: [
        ".kkk......kkk...",
        "kgppk....kppgk..",
        "kgppgk..kgppgk..",
        ".kggrrrrrrggk...",
        "..krrkkkkkrrk...",
        "..kggggggggk....",
        ".kgkwggggkwgk...",
        ".kgkkggggkkgk...",
        "..kgggkpkgggk...",
        "...kkgggggkk....",
        "yo.kmmmmmmmk....",
        "oyokmMmmmMmmk...",
        "yoykmmmmmmmmmk..",
        ".ookmmMmmmmMmk..",
        "...kmmmmmmmmk...",
        "....kkkkkkkk...."
      ]
    },
    "mirror-owl": {
      palette: {b: "#a8774a", B: "#7a5233", c: "#f3e3c8", y: "#ffd23f", o: "#ffb02e"},
      grid: [
        ".kk..........kk.",
        ".kbk........kbk.",
        ".kbbkkkkkkkkbbk.",
        "kbbbbbbbbbbbbbbk",
        "kbkkkkbbbbkkkkbk",
        "kkcccckbbkyyyyyk",
        "kkcwkckbbkywkyyk",
        "kkckkckokkykkyyk",
        "kbkkkkbookyyyykk",
        "kbbbbbbbbkkkkkbk",
        ".kbbBbbbbbbBbbk.",
        ".kbBbBbbbbBbBbk.",
        ".kbbbbbbbbbbbbk.",
        "..kbBbbbbbbBbk..",
        "...kkokkkkokk...",
        "....kok..kok...."
      ]
    },
    "pepper-pixie": {
      palette: {r: "#e23b2e", R: "#b5261c", g: "#5fa046", G: "#4c8f3a", b: "#dff7ff", B: "#9fd8ec", s: "#ff8a7a"},
      grid: [
        "......kk........",
        ".....kGgk.......",
        "....kggggkk.....",
        ".kk.kkkkkkk..kk.",
        "kbbkkrrrrrrkkbbk",
        "kbBbkrsrrrrkbBbk",
        "kbbBkrsrrrRkBbbk",
        ".kbbkrkwrkwkbbk.",
        "..kkkrkkrkkkkk..",
        "....krrrrrRk....",
        "....krkkkrRk....",
        ".....krrrRk.....",
        ".....krrRRk.....",
        "......krRk......",
        "......krk.......",
        ".......k........"
      ]
    }
  };

  const TINT = {
    "clockwork-hare": "#2b6f8c",
    "moss-golem": "#c46f2c",
    "comet-kid": "#2a3a78",
    "bubble-witch": "#2f8d84",
    "echo-fox": "#355779",
    "anchor-knight": "#b0453c",
    "lantern-sprite": "#3a2d5c",
    "prism-slime": "#27665d",
    "storm-crow": "#5b6a8f",
    "moon-moth": "#2a4d75",
    "gear-goblin": "#7a5434",
    "frost-yak": "#3f7dbd",
    "portal-pup": "#5a3a8c",
    "quake-beetle": "#b8963d",
    "lucky-turnip": "#5f9e47",
    "shadow-cat": "#d9a92f",
    "crown-crab": "#2683a6",
    "nap-dragon": "#3a4a7c",
    "spark-snail": "#34466a",
    "wisp-twins": "#26385a",
    "river-otter": "#3a8cad",
    "meteor-mouse": "#24305a",
    "mirror-owl": "#6c4c86",
    "pepper-pixie": "#e6a52c"
  };

  function sprite(id) {
    const entry = SPRITES[id];
    if (!entry) return null;
    return { grid: entry.grid.slice(), palette: { k: INK, w: "#ffffff", ...entry.palette } };
  }

  function shade(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const mix = (c) => Math.max(0, Math.min(255, Math.round(c + (amount < 0 ? c * amount : (255 - c) * amount))));
    return `#${[n >> 16, (n >> 8) & 255, n & 255].map(mix).map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  }

  // Round badge rasterised on the same pixel grid as the sprite, so edges stay crisp.
  function badgeRects(tint) {
    const light = shade(tint, 0.18);
    const dark = shade(tint, -0.25);
    let out = "";
    const r = BADGE / 2;
    for (let y = 0; y < BADGE; y += 1) {
      let start = -1;
      for (let x = 0; x <= BADGE; x += 1) {
        const inside = x < BADGE && Math.hypot(x + 0.5 - r, y + 0.5 - r) <= r;
        if (inside && start < 0) start = x;
        if (!inside && start >= 0) {
          const color = y < r - 2 ? light : y > r + 4 ? dark : tint;
          out += `<rect x="${start}" y="${y}" width="${x - start}" height="1" fill="${color}"/>`;
          start = -1;
        }
      }
    }
    return out;
  }

  function spriteRects(id, ox, oy) {
    const { grid, palette } = sprite(id);
    let out = "";
    grid.forEach((row, y) => {
      let x = 0;
      while (x < SIZE) {
        const char = row[x];
        let run = 1;
        while (x + run < SIZE && row[x + run] === char) run += 1;
        if (char !== ".") out += `<rect x="${ox + x}" y="${oy + y}" width="${run}" height="1" fill="${palette[char]}"/>`;
        x += run;
      }
    });
    return out;
  }

  const cache = new Map();
  function runnerArtUri(id) {
    if (!SPRITES[id]) id = Object.keys(SPRITES)[0];
    if (!cache.has(id)) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BADGE} ${BADGE}" shape-rendering="crispEdges">${badgeRects(TINT[id] || "#334")}${spriteRects(id, 2, 3)}</svg>`;
      cache.set(id, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
    }
    return cache.get(id);
  }

  function runnerArt(id, className = "", alt = "") {
    return `<img class="runner-art ${className}" src="${runnerArtUri(id)}" alt="${alt}" draggable="false" />`;
  }

  window.RunnerArt = { uri: runnerArtUri, img: runnerArt, sprite, tint: (id) => TINT[id] || "#334", ids: Object.keys(SPRITES) };
})();
