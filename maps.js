"use strict";

// Compact race boards. The track is a closed loop of square tiles around the board
// edge (31 spaces plus a start/finish gate), like a printed board game. The infield
// carries the track name and a pixel-art scene. Landscape is 10x8 tiles; portrait
// (phones) is 8x10 so the board fills a narrow screen.
(function () {
  const INK = "#221d33";
  const CELL = 10; // one pixel-art pixel, in board units
  const TILE_CELLS = 9;
  const TILE = CELL * TILE_CELLS; // 90 units
  const MARGIN_CELLS = 2;
  const SPACE_COUNT = 31;

  const THEMES = [
    {
      key: "grove", name: "Whisper Grove", mood: "Calm", blurb: "Soft meadow, no tricks on the road.",
      ground: "#4f9a49", groundLight: "#61ad55", groundDark: "#418340",
      tile: "#f6ecd2", tileAlt: "#ecdcb6", tileHi: "#fffaf0", tileLo: "#c9b282",
      plaque: "#7a4b2e", plaqueText: "#fff4d8",
      feature: "pond",
      scatter: ["pine", "pine", "bush", "flowers", "flowers", "rock", "mushroom"]
    },
    {
      key: "ember", name: "Ember Ridge", mood: "Chaos", blurb: "Lava rocks, boosts and nasty setbacks.",
      ground: "#4b2d2a", groundLight: "#5d3a33", groundDark: "#3a2120",
      tile: "#efe2d6", tileAlt: "#e2cfbf", tileHi: "#fff6ee", tileLo: "#b89c88",
      plaque: "#2a1a1a", plaqueText: "#ffb25e",
      feature: "lava",
      scatter: ["rock", "rock", "ember", "ember", "deadtree", "volcanito"]
    },
    {
      key: "moon", name: "Moon Pool", mood: "Calm", blurb: "A quiet night run by the water.",
      ground: "#203f5e", groundLight: "#2a4f72", groundDark: "#18324c",
      tile: "#eef3fb", tileAlt: "#dce5f3", tileHi: "#ffffff", tileLo: "#9fb2cf",
      plaque: "#122638", plaqueText: "#fff3c4",
      feature: "moonpool",
      scatter: ["willow", "glowshroom", "glowshroom", "firefly", "firefly", "stone"]
    },
    {
      key: "storm", name: "Storm Spire", mood: "Chaos", blurb: "The finale. Crystal cliffs and wild weather.",
      ground: "#36315a", groundLight: "#443d6d", groundDark: "#2a2646",
      tile: "#f4f1ff", tileAlt: "#e4def8", tileHi: "#ffffff", tileLo: "#a99fd0",
      plaque: "#1b1930", plaqueText: "#ffd23f",
      feature: "spire",
      scatter: ["crystal", "crystal", "floatrock", "spark", "spark", "cloud"]
    }
  ];

  // ---------- Layout ----------

  function grid(portrait) {
    const cols = portrait ? 8 : 10;
    const rows = portrait ? 10 : 8;
    return { cols, rows, w: (cols * TILE_CELLS + MARGIN_CELLS * 2) * CELL, h: (rows * TILE_CELLS + MARGIN_CELLS * 2) * CELL };
  }

  const layoutCache = new Map();
  function layout(portrait) {
    const key = portrait ? "p" : "l";
    if (layoutCache.has(key)) return layoutCache.get(key);
    const { cols, rows } = grid(portrait);
    const gate = Math.floor(cols / 2) - 1;
    const slots = [];
    for (let c = gate + 1; c < cols; c += 1) slots.push([c, rows - 1]);
    for (let r = rows - 2; r >= 0; r -= 1) slots.push([cols - 1, r]);
    for (let c = cols - 2; c >= 0; c -= 1) slots.push([c, 0]);
    for (let r = 1; r < rows; r += 1) slots.push([0, r]);
    for (let c = 1; c < gate; c += 1) slots.push([c, rows - 1]);
    if (slots.length !== SPACE_COUNT) throw new Error(`Board layout has ${slots.length} spaces`);
    const result = { slots, gate: [gate, rows - 1] };
    layoutCache.set(key, result);
    return result;
  }

  function slotCenter([c, r]) {
    return [(MARGIN_CELLS + c * TILE_CELLS) * CELL + TILE / 2, (MARGIN_CELLS + r * TILE_CELLS) * CELL + TILE / 2];
  }

  function spacePoint(index, portrait) {
    const { slots } = layout(Boolean(portrait));
    return slotCenter(slots[Math.max(0, Math.min(SPACE_COUNT - 1, index))]);
  }

  // ---------- Pixel canvas ----------

  function rng(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function canvas(cols, rows) {
    const cells = new Array(cols * rows).fill(null);
    const api = {
      cols,
      rows,
      set(x, y, color) {
        if (color && x >= 0 && y >= 0 && x < cols && y < rows) cells[y * cols + x] = color;
      },
      rect(x, y, w, h, color) {
        for (let j = 0; j < h; j += 1) for (let i = 0; i < w; i += 1) api.set(x + i, y + j, color);
      },
      ellipse(cx, cy, rx, ry, color) {
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
          for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
            const dx = (x + 0.5 - cx) / rx;
            const dy = (y + 0.5 - cy) / ry;
            if (dx * dx + dy * dy <= 1) api.set(x, y, color);
          }
        }
      },
      stamp(sprite, x, y, palette) {
        sprite.forEach((row, j) => [...row].forEach((char, i) => {
          if (char !== "." && palette[char]) api.set(x + i, y + j, palette[char]);
        }));
      },
      svg() {
        let out = "";
        for (let y = 0; y < rows; y += 1) {
          let x = 0;
          while (x < cols) {
            const color = cells[y * cols + x];
            let run = 1;
            while (x + run < cols && cells[y * cols + x + run] === color) run += 1;
            if (color) out += `<rect x="${x * CELL}" y="${y * CELL}" width="${run * CELL}" height="${CELL}" fill="${color}"/>`;
            x += run;
          }
        }
        return out;
      }
    };
    return api;
  }

  // Small scenery sprites. Keys map to the palette passed at stamp time.
  const STAMPS = {
    pine: ["...d...", "..ddd..", "..dLd..", ".ddddd.", ".dLddd.", "ddddddd", "dLddddd", "...t...", "...t..."],
    bush: [".dLd..", "dLddd.", "dddddd", ".dddd."],
    flowers: ["y.p", ".w.", "p.y"],
    rock: [".ll.", "lggg", "gggs", ".ss."],
    mushroom: [".rrr.", "rwrwr", ".ccc.", "..c.."],
    ember: [".y.", "yoy", ".o."],
    deadtree: [".t.t", ".tt.", "t.t.", ".t..", ".t..", ".t.."],
    volcanito: ["...o...", "..ooo..", "..sgs..", ".sgggs.", "sgggggs"],
    willow: ["..ddd..", ".dLdLd.", "dLdddLd", "d.d.d.d", "d..t..d", "...t..."],
    glowshroom: [".bbb.", "bBbBb", ".www.", "..w.."],
    firefly: [".y.", "yYy", ".y."],
    stone: [".gg.", "gLgg", "gggg", "gggg", "ssss"],
    crystal: ["..c..", ".cCc.", ".cCc.", "ccCcc", "cCccc", ".ccc."],
    floatrock: ["dLLdd", "dddds", ".dds.", "..c.."],
    spark: ["..y..", ".yYy.", "yYYYy", ".yYy.", "..y.."],
    cloud: [".www..", "wwwwww", "wwwwww", "..y...", ".y....", "y....."]
  };

  const SCATTER_PALETTE = {
    grove: { d: "#2f6f3a", L: "#4c9a52", t: "#6b4630", y: "#ffd23f", p: "#ff8fb8", w: "#ffffff", l: "#c3cbc0", g: "#9aa59a", s: "#6f7a6f", r: "#e8513b", c: "#fff4e6" },
    ember: { l: "#8a7370", g: "#6b5552", s: "#4a3836", y: "#ffd23f", o: "#ff6a2b", t: "#2a1a1a" },
    moon: { d: "#2f7f70", L: "#4fae98", t: "#4a3a3a", b: "#7fe3ff", B: "#d6f8ff", w: "#e9f2ff", y: "#fff3a6", Y: "#ffffff", g: "#6f88aa", L2: "#8aa3c3", s: "#4a5f7d" },
    storm: { c: "#8de0ff", C: "#e6fbff", d: "#6f6a9a", L: "#7cc36b", s: "#4e4a78", y: "#ffd23f", Y: "#fff6c4", w: "#9b96c4" }
  };
  SCATTER_PALETTE.moon.L = "#4fae98";

  function drawFeature(theme, pc, cx, cy, size) {
    const rx = size * 1.35;
    const ry = size * 0.8;
    if (theme.feature === "pond") {
      pc.ellipse(cx, cy + 1, rx + 1, ry + 1, "#2e6f2c");
      pc.ellipse(cx, cy, rx, ry, "#2f6fa3");
      pc.ellipse(cx - 1, cy - 1, rx - 2, ry - 2, "#4aa3d8");
      pc.rect(Math.round(cx - rx / 2), Math.round(cy - ry / 3), 5, 1, "#bfe7ff");
      pc.rect(Math.round(cx + 2), Math.round(cy + ry / 4), 4, 1, "#bfe7ff");
      pc.ellipse(cx - rx / 2, cy + ry / 3, 2.2, 1.4, "#5fae5a");
      pc.set(Math.round(cx - rx / 2), Math.round(cy + ry / 3) - 1, "#ff8fb8");
      pc.ellipse(cx + rx / 2, cy - ry / 3, 1.8, 1.2, "#5fae5a");
    } else if (theme.feature === "lava") {
      pc.ellipse(cx, cy, rx + 1, ry + 1, "#2a1a1a");
      pc.ellipse(cx, cy, rx, ry, "#ff6a2b");
      pc.ellipse(cx, cy, rx * 0.66, ry * 0.6, "#ffb02e");
      pc.ellipse(cx, cy, rx * 0.3, ry * 0.28, "#ffe08a");
      [[-0.55, -0.2, 3, 2], [0.4, 0.35, 4, 2], [0.5, -0.5, 2, 1], [-0.2, 0.55, 3, 1]].forEach(([dx, dy, w, h]) => pc.rect(Math.round(cx + dx * rx), Math.round(cy + dy * ry), w, h, "#3b2a2a"));
      const vx = Math.round(cx - rx - 5);
      const vy = Math.round(cy - ry - 4);
      for (let i = 0; i < 11; i += 1) {
        const left = vx - i;
        const width = 4 + i * 2;
        pc.rect(left, vy + i, width, 1, i < 2 ? "#ff6a2b" : "#7a5048");
        if (i >= 2) pc.rect(left + 1, vy + i, Math.floor(width / 2) - 1, 1, "#9a6a5f");
        pc.set(left - 1, vy + i, "#1e1212");
        pc.set(left + width, vy + i, "#1e1212");
        if (i >= 2 && i < 7) pc.set(vx + 1 + (i % 2), vy + i, "#ff8a3d");
      }
      pc.rect(vx - 1, vy - 1, 6, 1, "#1e1212");
      pc.rect(vx + 1, vy - 4, 2, 2, "#a89aa2");
      pc.rect(vx + 3, vy - 7, 3, 2, "#a89aa2");
      pc.rect(vx, vy - 9, 2, 2, "#8a7a82");
    } else if (theme.feature === "moonpool") {
      pc.ellipse(cx, cy, rx + 1, ry + 1, "#0e2236");
      pc.ellipse(cx, cy, rx, ry, "#1f5a7a");
      pc.ellipse(cx, cy, rx * 0.8, ry * 0.75, "#246a8c");
      pc.ellipse(cx + 1, cy - 1, 3.6, 3.6, "#fff3c4");
      pc.ellipse(cx + 2.6, cy - 2.2, 3.2, 3.2, "#246a8c");
      pc.rect(Math.round(cx - rx / 2), Math.round(cy + ry / 3), 5, 1, "#8fd3ff");
      pc.ellipse(cx + rx * 0.6, cy + ry * 0.3, 1.8, 1.2, "#3f8f7f");
      pc.set(Math.round(cx + rx * 0.6), Math.round(cy + ry * 0.3) - 1, "#ffffff");
    } else if (theme.feature === "spire") {
      const h = Math.round(size * 2);
      const base = Math.round(cy + size * 0.8);
      pc.ellipse(cx, base, size * 1.3, 1.6, "#1e1b33");
      for (let i = 0; i < h; i += 1) {
        const half = Math.max(0, Math.round((i / h) * size * 0.55));
        pc.rect(Math.round(cx - half), base - h + i, half * 2 + 1, 1, i < 2 ? "#e6fbff" : "#8de0ff");
        pc.set(Math.round(cx - half), base - h + i, "#5fb8e0");
        if (half > 0) pc.set(Math.round(cx) + 1, base - h + i, "#e6fbff");
      }
      [[-1, 0.7], [1, 0.6]].forEach(([side, scale]) => {
        const sh = Math.round(h * scale * 0.55);
        const sx = Math.round(cx + side * size * 0.8);
        for (let i = 0; i < sh; i += 1) {
          const half = Math.round((i / sh) * size * 0.3);
          pc.rect(sx - half, base - sh + i, half * 2 + 1, 1, "#c9a8ff");
          pc.set(sx, base - sh + i, "#efe2ff");
        }
      });
    }
  }

  function boardPixels(themeIndex, portrait) {
    const theme = THEMES[themeIndex % THEMES.length];
    const { cols, rows, w, h } = grid(portrait);
    const pc = canvas(w / CELL, h / CELL);
    const rand = rng(31 + themeIndex * 97 + (portrait ? 5 : 0));

    pc.rect(0, 0, pc.cols, pc.rows, theme.ground);
    for (let i = 0; i < pc.cols * pc.rows * 0.07; i += 1) {
      pc.set(Math.floor(rand() * pc.cols), Math.floor(rand() * pc.rows), rand() < 0.55 ? theme.groundLight : theme.groundDark);
    }

    // Infield scene
    const inX = MARGIN_CELLS + TILE_CELLS;
    const inY = MARGIN_CELLS + TILE_CELLS;
    const inW = (cols - 2) * TILE_CELLS;
    const inH = (rows - 2) * TILE_CELLS;
    const plaqueH = 9;
    const featureSize = Math.min(inW, inH) * 0.2;
    const fcx = inX + inW / 2;
    const fcy = inY + plaqueH + 4 + (inH - plaqueH - 4) / 2;
    const keepOut = [[fcx, fcy, featureSize * 1.9]];
    drawFeature(theme, pc, fcx, fcy, featureSize);
    if (theme.feature === "lava") keepOut.push([fcx - featureSize * 1.35 - 5, fcy - featureSize * 0.8, 14]);

    const palette = SCATTER_PALETTE[theme.key];
    let placed = 0;
    for (let attempt = 0; attempt < 600 && placed < 14; attempt += 1) {
      const kind = theme.scatter[Math.floor(rand() * theme.scatter.length)];
      const sprite = STAMPS[kind];
      const sw = sprite[0].length;
      const sh = sprite.length;
      const x = Math.round(inX + 2 + rand() * (inW - sw - 4));
      const y = Math.round(inY + plaqueH + 7 + rand() * (inH - plaqueH - sh - 9));
      const mx = x + sw / 2;
      const my = y + sh / 2;
      if (keepOut.some(([kx, ky, kr]) => Math.hypot(kx - mx, (ky - my) * 1.2) < kr)) continue;
      keepOut.push([mx, my, Math.max(sw, sh) * 1.4]);
      pc.stamp(sprite, x, y, palette);
      placed += 1;
    }

    // Track tiles
    const { slots, gate } = layout(portrait);
    const drawTile = (c, r, face, alt) => {
      const x = MARGIN_CELLS + c * TILE_CELLS;
      const y = MARGIN_CELLS + r * TILE_CELLS;
      pc.rect(x, y, TILE_CELLS, TILE_CELLS, INK);
      pc.rect(x + 1, y + 1, TILE_CELLS - 2, TILE_CELLS - 2, face);
      pc.rect(x + 1, y + 1, TILE_CELLS - 2, 1, alt.hi);
      pc.rect(x + 1, y + 1, 1, TILE_CELLS - 2, alt.hi);
      pc.rect(x + 1, y + TILE_CELLS - 2, TILE_CELLS - 2, 1, alt.lo);
      pc.rect(x + TILE_CELLS - 2, y + 1, 1, TILE_CELLS - 2, alt.lo);
    };
    return { pc, theme, slots, gate, drawTile, cols, rows, w, h, infield: { x: inX * CELL, y: inY * CELL, w: inW * CELL, h: inH * CELL, plaqueH: plaqueH * CELL } };
  }

  const SPECIAL = {
    boost: { face: "#21a873", hi: "#5fe0a8", lo: "#137a52", text: "#ffffff", icon: ["..w..", ".www.", "ww.ww"] },
    setback: { face: "#d6402f", hi: "#ff7b6b", lo: "#9c2a1f", text: "#ffffff", icon: ["ww.ww", ".www.", "..w.."] },
    trip: { face: "#f5b82e", hi: "#ffe08a", lo: "#c08a12", text: "#221d33", icon: ["k.k.k", ".kkk.", "k.k.k"] }
  };

  function boardSvg(themeIndex, options = {}) {
    const portrait = Boolean(options.portrait);
    const chaosSpaces = options.chaosSpaces || {};
    const { pc, theme, slots, gate, drawTile, w, h, infield } = boardPixels(themeIndex, portrait);
    const plain = { hi: theme.tileHi, lo: theme.tileLo };
    const text = [];

    slots.forEach(([c, r], index) => {
      const effect = chaosSpaces[index];
      const [x, y] = slotCenter([c, r]);
      if (effect) {
        const s = SPECIAL[effect.type];
        drawTile(c, r, s.face, s);
        pc.stamp(s.icon, MARGIN_CELLS + c * TILE_CELLS + 2, MARGIN_CELLS + r * TILE_CELLS + 1, { w: "#ffffff", k: INK });
        text.push(`<g class="map-space special ${effect.type}"><text x="${x}" y="${y + 30}" class="map-badge" fill="${s.text}">${effect.type === "trip" ? "TRIP" : effect.label}</text></g>`);
      } else if (index === 0) {
        drawTile(c, r, "#ffd23f", { hi: "#ffe98a", lo: "#c99a0f" });
        text.push(`<g class="map-space start"><text x="${x}" y="${y + 9}" class="map-label">START</text></g>`);
      } else if (index === SPACE_COUNT - 1) {
        drawTile(c, r, "#ffffff", { hi: "#ffffff", lo: "#c9c9d6" });
        const ox = MARGIN_CELLS + c * TILE_CELLS + 1;
        const oy = MARGIN_CELLS + r * TILE_CELLS + 1;
        for (let j = 0; j < TILE_CELLS - 2; j += 1) for (let i = 0; i < TILE_CELLS - 2; i += 1) if ((i + j) % 2) pc.set(ox + i, oy + j, INK);
        text.push(`<g class="map-space finish"><rect x="${x - 38}" y="${y - 13}" width="76" height="26" rx="4" fill="#ffd23f" stroke="${INK}" stroke-width="3"/><text x="${x}" y="${y + 8}" class="map-label">FINISH</text></g>`);
      } else {
        drawTile(c, r, index % 2 ? theme.tile : theme.tileAlt, plain);
        text.push(`<g class="map-space"><text x="${x}" y="${y + 12}" class="map-num">${index}</text></g>`);
      }
    });

    // Start/finish gate between space 30 and space 0
    const gx = MARGIN_CELLS + gate[0] * TILE_CELLS;
    const gy = MARGIN_CELLS + gate[1] * TILE_CELLS;
    pc.rect(gx, gy + 1, TILE_CELLS, TILE_CELLS - 2, theme.groundDark);
    for (let j = 0; j < TILE_CELLS; j += 1) {
      pc.set(gx + 3, gy + j, j % 2 ? "#ffffff" : INK);
      pc.set(gx + 4, gy + j, j % 2 ? INK : "#ffffff");
      pc.set(gx + 5, gy + j, j % 2 ? "#ffffff" : INK);
    }
    pc.rect(gx + 1, gy + 1, 1, TILE_CELLS - 2, "#ffd23f");
    pc.rect(gx + TILE_CELLS - 2, gy + 1, 1, TILE_CELLS - 2, "#ffd23f");

    // Infield plaque with the track name
    const px = infield.x + 30;
    const pw = infield.w - 60;
    const py = infield.y + 20;
    const ph = infield.plaqueH;
    const nameSize = Math.min(52, (pw / theme.name.length) * 1.55);
    const mood = theme.mood === "Chaos" ? "CHAOS TRACK" : "CALM TRACK";

    return `<svg class="map-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${theme.name}, ${theme.mood.toLowerCase()} track, 30 spaces" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges">
      ${pc.svg()}
      <g shape-rendering="auto">
        <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="8" fill="${theme.plaque}" stroke="${INK}" stroke-width="4"/>
        <text x="${px + pw / 2}" y="${py + ph / 2 + nameSize * 0.18}" class="map-title" fill="${theme.plaqueText}" font-size="${nameSize.toFixed(0)}">${theme.name.toUpperCase()}</text>
        <text x="${px + pw / 2}" y="${py + ph + 30}" class="map-mood" fill="#ffffff">${mood}</text>
        ${text.join("")}
      </g>
    </svg>`;
  }

  window.ArcaneMaps = {
    THEMES,
    TILE,
    SPACE_COUNT,
    themeFor: (raceNumber) => THEMES[raceNumber % THEMES.length],
    boardSvg,
    spacePoint,
    size: (portrait) => {
      const { w, h } = grid(Boolean(portrait));
      return { w, h };
    }
  };
})();
