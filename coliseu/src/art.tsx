import React from "react";
import { staticFile } from "remotion";

// ---------- paleta (flat, quente, estilo documentário) ----------
export const C = {
  gold: "#f0b94a",
  goldDark: "#b9822a",
  ink: "#2a1b14",
  stone: "#dcc39a",
  stoneLight: "#ecd9b4",
  stoneShade: "#b69a6c",
  stoneDark: "#8d7350",
  arch: "#3a281c",
  archDeep: "#21150e",
  terra: "#c4553a",
  terraDark: "#8e3524",
  purple: "#7a2e4d",
  skin: "#e3a77b",
  skinDark: "#c98a60",
  hair: "#3b2a22",
  green: "#6f8f3d",
  greenDark: "#506b2c",
  sand: "#e6c98f",
  sandDark: "#cfa968",
  blue: "#5f9ec7",
  white: "#f7efe0",
};

// ---------- céu ----------
export const Sky: React.FC<{
  top: string;
  mid?: string;
  bottom: string;
  sunX?: number;
  sunY?: number;
  sunR?: number;
  sun?: string;
  clouds?: boolean;
  t?: number;
}> = ({ top, mid, bottom, sunX = 800, sunY = 520, sunR = 120, sun = "#fff1c2", clouds = true, t = 0 }) => (
  <g>
    <defs>
      <linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        {mid ? <stop offset="0.5" stopColor={mid} /> : null}
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
      <radialGradient id="sung">
        <stop offset="0" stopColor={sun} stopOpacity="1" />
        <stop offset="0.45" stopColor={sun} stopOpacity="0.35" />
        <stop offset="1" stopColor={sun} stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect x="-200" y="-200" width="1480" height="2400" fill="url(#skyg)" />
    <circle cx={sunX} cy={sunY} r={sunR * 3} fill="url(#sung)" />
    <circle cx={sunX} cy={sunY} r={sunR} fill={sun} />
    {clouds ? (
      <g fill="#ffffff" opacity="0.55">
        <Cloud x={140 + t * 0.6} y={420} s={1.2} />
        <Cloud x={620 - t * 0.4} y={300} s={0.9} />
        <Cloud x={900 + t * 0.3} y={700} s={0.7} />
      </g>
    ) : null}
  </g>
);

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="0" rx="120" ry="34" />
    <ellipse cx="-50" cy="-22" rx="52" ry="34" />
    <ellipse cx="25" cy="-34" rx="62" ry="44" />
  </g>
);

// ---------- chão ----------
export const Ground: React.FC<{ y: number; color?: string; shade?: string }> = ({ y, color = "#8fa04a", shade = "#6f8438" }) => (
  <g>
    <rect x="-200" y={y} width="1480" height={2000 - y} fill={color} />
    <path d={`M-200 ${y + 30} Q 300 ${y - 20} 700 ${y + 20} T 1300 ${y + 10} L1300 ${y + 80} L-200 ${y + 80}Z`} fill={shade} opacity="0.6" />
  </g>
);

// ---------- Coliseu (vista frontal, em tiers de arcos) ----------
// ruin: recorta um pedaço do lado direito e mostra a parede interna
export const Colosseum: React.FC<{
  x: number;
  y: number; // base (chão)
  w: number;
  builtTiers?: number; // 0..4 (com fração para animação)
  ruin?: boolean;
  night?: boolean;
  nums?: boolean;
}> = ({ x, y, w, builtTiers = 4, ruin = false, nums = false }) => {
  const tierH = w * 0.2;
  const atticH = w * 0.15;
  const cols = 12;
  const archW = (w / cols) * 0.5;
  const rows = [
    { h: tierH, arch: "round" as const },
    { h: tierH, arch: "round" as const },
    { h: tierH, arch: "round" as const },
    { h: atticH, arch: "window" as const },
  ];
  let yy = y;
  const els: React.ReactNode[] = [];
  rows.forEach((r, ri) => {
    const frac = Math.max(0, Math.min(1, builtTiers - ri));
    if (frac <= 0) return;
    const top = yy - r.h * frac;
    const clipId = `cl-${ri}-${Math.round(x)}-${Math.round(w)}`;
    els.push(
      <g key={ri}>
        <defs>
          <clipPath id={clipId}>
            <rect x={x} y={top} width={w} height={r.h * frac} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect x={x} y={yy - r.h} width={w} height={r.h} fill={C.stone} />
          <rect x={x} y={yy - r.h} width={w} height={r.h * 0.12} fill={C.stoneLight} />
          <rect x={x} y={yy - r.h * 0.1} width={w} height={r.h * 0.1} fill={C.stoneShade} />
          {Array.from({ length: cols }).map((_, i) => {
            const cx = x + (i + 0.5) * (w / cols);
            const ah = r.h * 0.66;
            const ay = yy - r.h * 0.16;
            if (r.arch === "round") {
              return (
                <g key={i}>
                  <path
                    d={`M${cx - archW / 2} ${ay} L${cx - archW / 2} ${ay - ah + archW / 2} A${archW / 2} ${archW / 2} 0 0 1 ${cx + archW / 2} ${ay - ah + archW / 2} L${cx + archW / 2} ${ay}Z`}
                    fill={C.arch}
                  />
                  <path
                    d={`M${cx - archW / 2} ${ay} L${cx - archW / 2} ${ay - ah * 0.5} L${cx + archW / 2} ${ay - ah * 0.5} L${cx + archW / 2} ${ay}Z`}
                    fill={C.archDeep}
                    opacity="0.7"
                  />
                  <rect x={cx + archW / 2} y={ay - ah + archW / 2} width={(w / cols) * 0.06} height={ah - archW / 2} fill={C.stoneShade} />
                  {nums && ri === 0 ? (
                    <text x={cx} y={ay - ah - 6} fontFamily="Cinzel" fontWeight={800} fontSize={w * 0.026} fill={C.stoneDark} textAnchor="middle">
                      {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][i]}
                    </text>
                  ) : null}
                </g>
              );
            }
            return (
              <g key={i}>
                <rect x={cx - archW * 0.28} y={yy - r.h * 0.78} width={archW * 0.56} height={r.h * 0.46} fill={C.arch} />
                <rect x={cx - archW * 0.28} y={yy - r.h * 0.78} width={archW * 0.56} height={r.h * 0.08} fill={C.archDeep} />
              </g>
            );
          })}
          {/* pilastras */}
          {Array.from({ length: cols + 1 }).map((_, i) => (
            <rect key={i} x={x + i * (w / cols) - (w / cols) * 0.04} y={yy - r.h} width={(w / cols) * 0.08} height={r.h} fill={C.stoneShade} opacity="0.55" />
          ))}
          {/* cornija */}
          <rect x={x - w * 0.006} y={yy - r.h - 0} width={w * 1.012} height={r.h * 0.07} fill={C.stoneDark} opacity="0.55" />
        </g>
      </g>,
    );
    yy -= r.h;
  });

  if (ruin) {
    const topY = y - tierH * 3 - atticH;
    return (
      <g>
        <defs>
          <clipPath id={`ruin-${Math.round(x)}`}>
            {/* polígono: tudo, menos o canto direito rasgado */}
            <polygon
              points={`${x - 20},${topY - 40} ${x + w * 0.58},${topY - 40} ${x + w * 0.62},${topY + atticH * 0.7} ${x + w * 0.70},${topY + atticH * 0.9} ${x + w * 0.73},${topY + tierH * 1.1} ${x + w * 0.83},${topY + tierH * 1.4} ${x + w * 0.86},${y - tierH * 1.2} ${x + w + 20},${y - tierH * 0.9} ${x + w + 20},${y + 10} ${x - 20},${y + 10}`}
            />
          </clipPath>
        </defs>
        {/* parede interna (mais escura) atrás do corte */}
        <rect x={x + w * 0.6} y={topY + atticH * 0.5} width={w * 0.4} height={y - topY} fill={C.stoneShade} opacity="0.0" />
        <g clipPath={`url(#ruin-${Math.round(x)})`}>{els}</g>
        {/* bordas do corte (alvenaria exposta) */}
        <polyline
          points={`${x + w * 0.58},${topY} ${x + w * 0.62},${topY + atticH * 0.7} ${x + w * 0.70},${topY + atticH * 0.9} ${x + w * 0.73},${topY + tierH * 1.1} ${x + w * 0.83},${topY + tierH * 1.4} ${x + w * 0.86},${y - tierH * 1.2}`}
          fill="none"
          stroke={C.stoneDark}
          strokeWidth="6"
        />
      </g>
    );
  }
  return <g>{els}</g>;
};

// ---------- gente ----------
export const Person: React.FC<{
  x: number;
  y: number; // pés
  s?: number;
  tunic?: string;
  skin?: string;
  hair?: string;
  flip?: boolean;
  helmet?: boolean;
  shield?: boolean;
  sword?: boolean;
  carry?: boolean;
  bob?: number;
}> = ({ x, y, s = 1, tunic = C.terra, skin = C.skin, hair = C.hair, flip, helmet, shield, sword, carry, bob = 0 }) => (
  <g transform={`translate(${x} ${y + bob}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {/* pernas */}
    <rect x="-14" y="-62" width="12" height="62" rx="5" fill={skin} />
    <rect x="3" y="-62" width="12" height="62" rx="5" fill={skin} />
    <rect x="-16" y="-10" width="16" height="10" rx="4" fill={C.ink} />
    <rect x="2" y="-10" width="16" height="10" rx="4" fill={C.ink} />
    {/* túnica */}
    <path d="M-28 -150 Q0 -165 28 -150 L32 -60 L-32 -60Z" fill={tunic} />
    <rect x="-32" y="-72" width="64" height="8" fill={C.ink} opacity="0.35" />
    {/* braços */}
    {carry ? (
      <>
        <rect x="-44" y="-140" width="14" height="52" rx="7" fill={skin} transform="rotate(25 -37 -140)" />
        <rect x="30" y="-140" width="14" height="52" rx="7" fill={skin} transform="rotate(-25 37 -140)" />
        <rect x="-28" y="-130" width="56" height="34" rx="4" fill={C.stoneShade} />
        <rect x="-28" y="-130" width="56" height="6" fill={C.stoneLight} />
      </>
    ) : (
      <>
        <rect x="-44" y="-146" width="14" height="58" rx="7" fill={skin} />
        <rect x="30" y="-146" width="14" height="58" rx="7" fill={skin} />
      </>
    )}
    {shield ? (
      <g transform="translate(-48 -108)">
        <path d="M-22 -34 L22 -34 L22 10 Q22 36 0 46 Q-22 36 -22 10Z" fill={C.terra} stroke={C.ink} strokeWidth="4" />
        <circle cx="0" cy="-6" r="9" fill={C.gold} />
      </g>
    ) : null}
    {sword ? (
      <g transform="translate(48 -150) rotate(28)">
        <rect x="-3" y="-60" width="6" height="64" fill="#cfd6dc" />
        <rect x="-12" y="2" width="24" height="6" fill={C.goldDark} />
      </g>
    ) : null}
    {/* cabeça */}
    <circle cx="0" cy="-176" r="22" fill={skin} />
    {helmet ? (
      <g>
        <path d="M-24 -176 A24 24 0 0 1 24 -176 L24 -170 L-24 -170Z" fill="#aab2ba" stroke={C.ink} strokeWidth="3" />
        <rect x="-4" y="-206" width="8" height="12" fill={C.terra} />
        <rect x="-24" y="-172" width="48" height="6" fill="#8d959c" />
      </g>
    ) : (
      <path d="M-22 -182 Q0 -204 22 -182 Q16 -194 0 -196 Q-16 -194 -22 -182Z" fill={hair} />
    )}
    <circle cx="-8" cy="-174" r="2.6" fill={C.ink} />
    <circle cx="8" cy="-174" r="2.6" fill={C.ink} />
    <path d="M-6 -164 Q0 -160 6 -164" stroke={C.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </g>
);

// ---------- busto (retrato próximo, igual ao do vídeo de referência) ----------
export const Bust: React.FC<{
  x: number;
  y: number; // base do busto
  s?: number;
  robe?: string;
  cloak?: string;
  beard?: boolean;
  hair?: string;
  wreath?: boolean;
  age?: "old" | "young";
}> = ({ x, y, s = 1, robe = "#e9dfc9", cloak = C.terraDark, beard = false, hair = C.hair, wreath = true, age = "young" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* capa */}
    <path d="M-330 0 Q-320 -210 -150 -300 L150 -300 Q320 -210 330 0Z" fill={cloak} />
    {/* toga */}
    <path d="M-250 0 Q-240 -190 -110 -290 L110 -290 Q240 -190 250 0Z" fill={robe} />
    <path d="M-110 -290 Q-40 -200 -60 0 L-20 0 Q0 -200 -40 -296Z" fill={C.purple} opacity="0.9" />
    <path d="M110 -290 Q40 -200 60 0 L20 0 Q0 -200 40 -296Z" fill={C.purple} opacity="0.9" />
    {/* broche */}
    <circle cx="-230" cy="-170" r="26" fill={C.gold} stroke={C.goldDark} strokeWidth="6" />
    {/* pescoço */}
    <rect x="-52" y="-360" width="104" height="90" fill={C.skinDark} />
    {/* orelhas */}
    <ellipse cx="-142" cy="-470" rx="22" ry="34" fill={C.skinDark} />
    <ellipse cx="142" cy="-470" rx="22" ry="34" fill={C.skinDark} />
    {/* rosto */}
    <path d="M-135 -520 Q-135 -350 0 -330 Q135 -350 135 -520 Q135 -620 0 -630 Q-135 -620 -135 -520Z" fill={C.skin} />
    {/* cabelo */}
    <path d="M-148 -500 Q-170 -640 -20 -668 Q150 -664 148 -500 Q132 -590 40 -592 Q-60 -590 -148 -500Z" fill={hair} />
    {beard ? (
      <path d="M-134 -470 Q-134 -330 0 -308 Q134 -330 134 -470 Q120 -400 70 -392 Q0 -364 -70 -392 Q-120 -400 -134 -470Z" fill={hair} />
    ) : null}
    {/* sobrancelhas, olhos, nariz, boca */}
    <path d="M-92 -532 Q-62 -552 -30 -534" stroke={hair} strokeWidth="11" fill="none" strokeLinecap="round" />
    <path d="M92 -532 Q62 -552 30 -534" stroke={hair} strokeWidth="11" fill="none" strokeLinecap="round" />
    <ellipse cx="-62" cy="-505" rx="17" ry="12" fill="#fff" />
    <ellipse cx="62" cy="-505" rx="17" ry="12" fill="#fff" />
    <circle cx="-62" cy="-505" r="9" fill={C.ink} />
    <circle cx="62" cy="-505" r="9" fill={C.ink} />
    <path d="M0 -520 Q-16 -450 -22 -432 Q0 -420 22 -432" stroke={C.skinDark} strokeWidth="8" fill="none" strokeLinecap="round" />
    <path d="M-34 -388 Q0 -372 34 -388" stroke={beard ? C.hair : C.terraDark} strokeWidth="8" fill="none" strokeLinecap="round" />
    {age === "old" ? (
      <g stroke={C.skinDark} strokeWidth="5" fill="none" strokeLinecap="round">
        <path d="M-100 -560 Q-60 -574 -24 -562" />
        <path d="M100 -560 Q60 -574 24 -562" />
        <path d="M-70 -472 Q-60 -440 -44 -426" />
        <path d="M70 -472 Q60 -440 44 -426" />
      </g>
    ) : null}
    {wreath ? (
      <g>
        {Array.from({ length: 11 }).map((_, i) => {
          const a = Math.PI * (1.02 + (i / 10) * 0.96);
          const cx = Math.cos(a) * 146;
          const cy = -560 + Math.sin(a) * 100;
          return <ellipse key={i} cx={cx} cy={cy} rx="26" ry="11" fill={i % 2 ? C.green : C.greenDark} transform={`rotate(${(a * 180) / Math.PI + 90} ${cx} ${cy})`} />;
        })}
      </g>
    ) : null}
  </g>
);

// ---------- plateia (bolinhas coloridas em fileiras) ----------
export const Crowd: React.FC<{ x: number; y: number; w: number; rows: number; seed?: number; wave?: number }> = ({ x, y, w, rows, seed = 1, wave = 0 }) => {
  const cols = Math.floor(w / 30);
  const palette = [C.terra, C.white, C.gold, C.blue, C.purple, "#8fa04a", "#d98a5a"];
  const els: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const n = Math.sin((c + 1) * 12.9898 + (r + 1) * 78.233 + seed) * 43758.5453;
      const f = n - Math.floor(n);
      const cx = x + (c + 0.5 + (r % 2) * 0.5) * (w / cols);
      const cy = y + r * 34 + Math.sin(wave * 0.1 + c * 0.5 + r) * 2;
      els.push(
        <g key={`${r}-${c}`}>
          <rect x={cx - 11} y={cy} width="22" height="26" rx="9" fill={palette[Math.floor(f * palette.length)]} />
          <circle cx={cx} cy={cy - 6} r="9" fill={f > 0.5 ? C.skin : C.skinDark} />
        </g>,
      );
    }
  }
  return <g>{els}</g>;
};

// ---------- leão ----------
export const Lion: React.FC<{ x: number; y: number; s?: number; flip?: boolean }> = ({ x, y, s = 1, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <rect x="-100" y="-120" width="190" height="80" rx="40" fill="#d99a4e" />
    <rect x="-100" y="-60" width="22" height="60" rx="8" fill="#c1853c" />
    <rect x="-60" y="-60" width="22" height="60" rx="8" fill="#c1853c" />
    <rect x="40" y="-60" width="22" height="60" rx="8" fill="#c1853c" />
    <rect x="76" y="-60" width="22" height="60" rx="8" fill="#c1853c" />
    <path d="M-100 -90 Q-150 -100 -150 -40 Q-130 -66 -100 -60Z" fill="#8e5a22" />
    <circle cx="105" cy="-120" r="64" fill="#8e5a22" />
    <circle cx="112" cy="-116" r="42" fill="#e3ab5d" />
    <circle cx="100" cy="-126" r="6" fill={C.ink} />
    <circle cx="128" cy="-126" r="6" fill={C.ink} />
    <ellipse cx="124" cy="-106" rx="12" ry="8" fill={C.terraDark} />
    <path d="M114 -96 Q124 -86 136 -96" stroke={C.ink} strokeWidth="4" fill="none" strokeLinecap="round" />
  </g>
);

// ---------- Utilidades ----------
export const Wall: React.FC<{ y?: number; h?: number; c1?: string; c2?: string }> = ({ y = 0, h = 2000, c1 = "#4a3426", c2 = "#3a281c" }) => (
  <g>
    <rect x="-200" y={y} width="1480" height={h} fill={c1} />
    {Array.from({ length: 24 }).map((_, r) =>
      Array.from({ length: 7 }).map((__, c) => (
        <rect
          key={`${r}-${c}`}
          x={-120 + c * 200 + (r % 2) * 100}
          y={y + r * 90}
          width="190"
          height="80"
          rx="6"
          fill={c2}
          opacity={0.35 + ((r * 7 + c * 3) % 5) * 0.07}
        />
      )),
    )}
  </g>
);

export const Vignette: React.FC = () => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <defs>
      <radialGradient id="vg" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#1a0f08" stopOpacity="0.55" />
      </radialGradient>
      <linearGradient id="topg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a0f08" stopOpacity="0.55" />
        <stop offset="1" stopColor="#1a0f08" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="botg" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#1a0f08" stopOpacity="0.7" />
        <stop offset="1" stopColor="#1a0f08" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width="1080" height="1920" fill="url(#vg)" />
    <rect width="1080" height="520" fill="url(#topg)" />
    <rect y="1250" width="1080" height="670" fill="url(#botg)" />
  </svg>
);

// ---------- personagens (PNG recortados) ----------
export const SIZES: Record<string, [number, number]> = {
  vespasiano_full: [484, 1100],
  vespasiano_meio: [454, 740],
  tito: [440, 712],
  gladiador_vermelho: [387, 724],
  gladiador_azul: [391, 730],
  trabalhador: [316, 698],
  leao: [993, 665],
  turista: [449, 681],
  marinheiro: [257, 679],
  cidadao_homem: [228, 695],
  cidadao_mulher: [211, 657],
  cidadao_crianca: [136, 404],
  cidadao_senador: [283, 689],
};

// x = centro, y = pés, h = altura em px
export const Sprite: React.FC<{
  name: keyof typeof SIZES;
  x: number;
  y: number;
  h: number;
  flip?: boolean;
  rot?: number;
  hue?: number;
  bob?: number;
  shadow?: boolean;
}> = ({ name, x, y, h, flip, rot = 0, hue = 0, bob = 0, shadow = true }) => {
  const [iw, ih] = SIZES[name];
  const w = (iw / ih) * h;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${rot})`}>
      {shadow ? <ellipse cx="0" cy="0" rx={w * 0.42} ry={h * 0.03} fill="#1a0f08" opacity="0.28" transform={`translate(0 ${-bob})`} /> : null}
      <g transform={`scale(${flip ? -1 : 1} 1)`}>
        <image
          href={staticFile(`personagens/${name}.png`)}
          x={-w / 2}
          y={-h}
          width={w}
          height={h}
          preserveAspectRatio="xMidYMid meet"
          style={hue ? { filter: `hue-rotate(${hue}deg)` } : undefined}
        />
      </g>
    </g>
  );
};
