import React from "react";
import { interpolate, Easing } from "remotion";
import { C, Colosseum, Crowd, Ground, Sky, Sprite, Wall } from "./art";

export type SceneProps = { f: number; n: number };

const ease = Easing.bezier(0.33, 1, 0.68, 1);
const prog = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

// ---------- pinheiros romanos ----------
const Pine: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-8" y="-220" width="16" height="220" fill="#5b3b27" />
    <ellipse cx="0" cy="-250" rx="120" ry="46" fill={C.greenDark} />
    <ellipse cx="-30" cy="-268" rx="86" ry="34" fill={C.green} />
    <ellipse cx="40" cy="-240" rx="70" ry="26" fill={C.green} />
  </g>
);

// ---------- 1. Abertura ----------
export const Abertura: React.FC<SceneProps> = ({ f }) => {
  const rise = prog(f, 0, 50);
  return (
    <g>
      <Sky top="#f7c27a" mid="#f1a566" bottom="#f6dba0" sunX={560} sunY={760} sunR={130} sun="#fff4cc" t={f} />
      <Ground y={1320} color="#a0a050" shade="#7d8440" />
      <g opacity={rise} transform={`translate(0 ${(1 - rise) * 60})`}>
        <Colosseum x={30} y={1330} w={1020} />
      </g>
      <Pine x={90} y={1420} s={1.15} />
      <Pine x={990} y={1400} s={0.95} />
      <rect x="-200" y="1330" width="1480" height="40" fill={C.sandDark} opacity="0.5" />
      <Sprite name="cidadao_homem" x={150} y={1660} h={340} bob={Math.sin(f * 0.12) * 3} />
      <Sprite name="cidadao_mulher" x={300} y={1690} h={350} bob={Math.sin(f * 0.12 + 1) * 3} />
      <Sprite name="cidadao_crianca" x={420} y={1700} h={230} bob={Math.sin(f * 0.16 + 2) * 4} />
      <Sprite name="vespasiano_full" x={790} y={1740} h={900} bob={Math.sin(f * 0.07) * 3} />
    </g>
  );
};

// ---------- 2. Vespasiano ----------
export const Vespasiano: React.FC<SceneProps> = ({ f }) => {
  const p = prog(f, 0, 28);
  return (
    <g>
      <Wall c1="#6a4a35" c2="#4c3324" />
      {/* janela em arco com céu */}
      <g transform="translate(190 300)">
        <path d="M0 520 L0 130 A350 130 0 0 1 700 130 L700 520Z" fill="#8ec1df" />
        <path d="M0 520 L0 130 A350 130 0 0 1 700 130 L700 520Z" fill="none" stroke={C.stoneShade} strokeWidth="26" />
        <g opacity="0.85">
          <Colosseum x={80} y={520} w={540} builtTiers={0} />
        </g>
        <g fill="#fff" opacity="0.7">
          <ellipse cx="200" cy="200" rx="90" ry="24" />
          <ellipse cx="480" cy="290" rx="70" ry="20" />
        </g>
      </g>
      {/* colunas */}
      {[-30, 980].map((x) => (
        <g key={x}>
          <rect x={x} y="260" width="130" height="1400" fill={C.stone} />
          <rect x={x - 20} y="240" width="170" height="40" fill={C.stoneLight} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={x + 22 + i * 36} y="300" width="12" height="1300" fill={C.stoneShade} opacity="0.5" />
          ))}
        </g>
      ))}
      <g transform={`translate(${(1 - p) * -120} 0)`} opacity={p}>
        <Sprite name="vespasiano_meio" x={540} y={1950} h={1250} shadow={false} bob={Math.sin(f * 0.06) * 3} />
      </g>
    </g>
  );
};

// ---------- 3. A obra ----------
export const Obra: React.FC<SceneProps> = ({ f, n }) => {
  const tiers = interpolate(f, [10, n - 20], [0.25, 3.0], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const blockY = 560 + Math.sin(f * 0.06) * 40 + (f % 120) * 0;
  return (
    <g>
      <Sky top="#7bb7d9" bottom="#e9e0c0" sunX={180} sunY={700} sunR={90} t={f} />
      <Ground y={1330} color="#a9a35a" shade="#8b8445" />
      <Colosseum x={60} y={1340} w={960} builtTiers={tiers} />
      {/* andaime */}
      <g stroke="#8a5a34" strokeWidth="12" strokeLinecap="round">
        {[60, 180, 300, 780, 900, 1020].map((x) => (
          <line key={x} x1={x} y1="1340" x2={x} y2={1340 - 420 - tiers * 200} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="40" y1={1250 - i * 170} x2="1040" y2={1250 - i * 170} opacity={i * 170 < tiers * 230 + 120 ? 1 : 0} />
        ))}
      </g>
      {/* guindaste */}
      <g>
        <rect x="885" y="640" width="30" height="740" fill="#7b4f2d" />
        <rect x="620" y="640" width="400" height="22" fill="#7b4f2d" />
        <line x1="900" y1="640" x2="660" y2="662" stroke="#7b4f2d" strokeWidth="10" />
        <line x1="700" y1="662" x2="700" y2={blockY + 60} stroke="#4a3426" strokeWidth="5" />
        <rect x="660" y={blockY + 58} width="80" height="56" fill={C.stoneShade} stroke={C.stoneDark} strokeWidth="5" />
      </g>
      {/* trabalhadores carregando blocos */}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = ((f * (1.4 + i * 0.25) + i * 230) % 1300) - 140;
        return <Sprite key={i} name="trabalhador" x={x} y={1500 + (i % 3) * 60} h={300 + (i % 3) * 30} hue={(i - 2) * 8} bob={Math.abs(Math.sin((f + i * 7) * 0.25)) * -10} />;
      })}
      {/* pilha de blocos */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={760 + i * 90} y={1430 + (i % 2) * -0} width="84" height="56" fill={C.stoneShade} stroke={C.stoneDark} strokeWidth="4" />
      ))}
    </g>
  );
};

// ---------- 4. Um gigante ----------
export const Gigante: React.FC<SceneProps> = ({ f }) => {
  const k = prog(f, 20, 90);
  const people = Math.round(50000 * prog(f, 40, 120));
  return (
    <g>
      <Sky top="#68a8d2" bottom="#f3e6c4" sunX={900} sunY={560} sunR={80} t={f} />
      <Ground y={1360} color="#9aa254" shade="#79803f" />
      <Colosseum x={100} y={1370} w={880} />
      {/* medidas */}
      <g stroke="#fff4d6" strokeWidth="6" fill="none" opacity={k}>
        <line x1="62" y1="1370" x2="62" y2={1370 - 880 * 0.75} />
        <line x1="46" y1="1370" x2="78" y2="1370" />
        <line x1="46" y1={1370 - 880 * 0.75} x2="78" y2={1370 - 880 * 0.75} />
      </g>
      <g opacity={k}>
        <rect x="-4" y="1000" width="146" height="64" rx="12" fill={C.ink} opacity="0.75" transform="rotate(-90 69 1032)" />
        <text x="62" y="1052" fontFamily="Fira Sans Condensed" fontWeight={700} fontSize="46" fill="#fff4d6" textAnchor="middle" transform="rotate(-90 62 1032)">
          48 m
        </text>
      </g>
      <g stroke="#fff4d6" strokeWidth="6" opacity={k}>
        <line x1="100" y1="1420" x2={100 + 880 * k} y2="1420" />
        <line x1="100" y1="1404" x2="100" y2="1436" />
        <line x1={100 + 880 * k} y1="1404" x2={100 + 880 * k} y2="1436" />
      </g>
      <Sprite name="cidadao_homem" x={1000} y={1560} h={210} />
      <Sprite name="cidadao_mulher" x={920} y={1580} h={205} />
      {/* contador */}
      <g transform="translate(540 1130)" opacity={prog(f, 36, 60)}>
        <rect x="-300" y="-90" width="600" height="150" rx="28" fill={C.ink} opacity="0.78" />
        <text x="0" y="12" fontFamily="Cinzel" fontWeight={800} fontSize="100" fill={C.gold} textAnchor="middle">
          {people.toLocaleString("pt-BR").replace(/\./g, " ")}
        </text>
        <text x="0" y="48" fontFamily="Fira Sans Condensed" fontWeight={600} fontSize="34" fill="#f7efe0" textAnchor="middle" letterSpacing="6">
          PESSOAS SENTADAS
        </text>
      </g>
    </g>
  );
};

// ---------- 5. Oitenta portões ----------
export const Portoes: React.FC<SceneProps> = ({ f }) => {
  const pan = interpolate(f, [0, 140], [0, -180]);
  return (
    <g>
      <Sky top="#6fb0d6" bottom="#f4e8c8" sunX={200} sunY={600} sunR={70} t={f} />
      <Ground y={1380} color="#d4b783" shade="#b99a62" />
      <g transform={`translate(${pan} 0)`}>
        <Colosseum x={-420} y={1400} w={1900} nums />
        {Array.from({ length: 16 }).map((_, i) => {
          const speed = 1.2 + (i % 4) * 0.35;
          const x = ((f * speed + i * 200) % 2300) - 380;
          const kinds = ["cidadao_homem", "cidadao_mulher", "cidadao_crianca", "cidadao_senador", "trabalhador"] as const;
          const hs = [340, 335, 235, 360, 320];
          const k = i % 5;
          return <Sprite key={i} name={kinds[k]} x={x} y={1540 + (i % 3) * 50} h={hs[k]} hue={((i * 7) % 5) - 2} bob={Math.abs(Math.sin((f + i * 6) * 0.22)) * -9} />;
        })}
      </g>
    </g>
  );
};

// ---------- 6. Ano 80 / inauguração ----------
export const Inauguracao: React.FC<SceneProps> = ({ f }) => {
  const p = prog(f, 0, 26);
  const colors = [C.terra, C.gold, C.blue, C.white, C.purple];
  return (
    <g>
      <Sky top="#ee9b62" mid="#f2b878" bottom="#f9e2a8" sunX={540} sunY={900} sunR={120} sun="#fff1c0" t={f} />
      <Ground y={1360} color="#a7a156" shade="#827e42" />
      <g opacity="0.95">
        <Colosseum x={-120} y={1370} w={1320} />
      </g>
      {/* bandeirolas */}
      <path d="M-20 480 Q 540 620 1100 480" stroke="#4a3426" strokeWidth="5" fill="none" />
      {Array.from({ length: 11 }).map((_, i) => {
        const x = 40 + i * 100;
        const y = 480 + Math.sin((x / 1080) * Math.PI) * 112;
        return <polygon key={i} points={`${x - 28},${y} ${x + 28},${y} ${x},${y + 66}`} fill={colors[i % 5]} />;
      })}
      <g transform={`translate(0 ${(1 - p) * 120})`} opacity={p}>
        <Sprite name="tito" x={470} y={1840} h={1230} bob={Math.sin(f * 0.08) * 4} />
      </g>
      {/* confete */}
      {Array.from({ length: 46 }).map((_, i) => {
        const sx = (i * 197) % 1080;
        const sp = 2.4 + (i % 5) * 0.8;
        const y = ((f * sp + i * 63) % 1500) + 200;
        return <rect key={i} x={sx + Math.sin((f + i * 13) * 0.08) * 24} y={y} width="14" height="22" fill={colors[i % 5]} transform={`rotate(${f * 4 + i * 30} ${sx} ${y})`} />;
      })}
      {/* selo 100 dias */}
      <g transform="translate(900 1150) rotate(8)" opacity={prog(f, 40, 62)}>
        <circle r="110" fill={C.gold} stroke={C.goldDark} strokeWidth="10" />
        <text y="-6" fontFamily="Cinzel" fontWeight={800} fontSize="88" fill={C.ink} textAnchor="middle">
          100
        </text>
        <text y="52" fontFamily="Fira Sans Condensed" fontWeight={700} fontSize="40" fill={C.ink} textAnchor="middle" letterSpacing="4">
          DIAS
        </text>
      </g>
    </g>
  );
};

// ---------- 7. Espetáculo ----------
export const Espetaculo: React.FC<SceneProps> = ({ f }) => {
  const clash = Math.sin(f * 0.22);
  const lionX = 780 + Math.sin(f * 0.05) * 60;
  return (
    <g>
      <Sky top="#79b4d6" bottom="#f1e4c1" sunX={880} sunY={420} sunR={80} clouds={false} />
      {/* arquibancadas */}
      <g>
        <rect x="-100" y="500" width="1300" height="640" fill={C.stoneShade} />
        <Crowd x={-20} y={560} w={1120} rows={4} seed={3} wave={f} />
        <rect x="-100" y="700" width="1300" height="14" fill={C.stoneDark} />
        <Crowd x={-20} y={730} w={1120} rows={4} seed={9} wave={f + 20} />
        <rect x="-100" y="880" width="1300" height="14" fill={C.stoneDark} />
        <Crowd x={-20} y={910} w={1120} rows={4} seed={5} wave={f + 40} />
        <rect x="-100" y="1060" width="1300" height="80" fill={C.stoneDark} />
        <rect x="-100" y="1060" width="1300" height="14" fill={C.stoneLight} />
      </g>
      {/* areia */}
      <rect x="-200" y="1140" width="1480" height="900" fill={C.sand} />
      <ellipse cx="540" cy="1400" rx="620" ry="120" fill={C.sandDark} opacity="0.4" />
      {/* gladiadores */}
      <Sprite name="gladiador_vermelho" x={290 + clash * 12} y={1450} h={640} rot={4} bob={Math.abs(clash) * -8} />
      <Sprite name="gladiador_azul" x={600 - clash * 12} y={1470} h={640} rot={-4} bob={Math.abs(clash) * -8} />
      <Sprite name="leao" x={lionX + 90} y={1400} h={320} />
    </g>
  );
};

// ---------- 8. Subsolo ----------
export const Subsolo: React.FC<SceneProps> = ({ f }) => {
  const lift = 0.5 - 0.5 * Math.cos(f * 0.045);
  const platY = 1300 - lift * 700;
  const flame = (x: number, y: number, i: number) => (
    <g key={i} transform={`translate(${x} ${y}) scale(${1 + Math.sin(f * 0.4 + i) * 0.1})`}>
      <rect x="-5" y="0" width="10" height="46" fill="#6a4a35" />
      <ellipse cx="0" cy="-8" rx="14" ry="22" fill="#ff9a2a" />
      <ellipse cx="0" cy="-4" rx="7" ry="13" fill="#ffe08a" />
    </g>
  );
  return (
    <g>
      <rect x="-200" y="-200" width="1480" height="2400" fill="#1d130d" />
      {/* arena em cima */}
      <rect x="-200" y="540" width="1480" height="70" fill={C.sand} />
      {/* paredes do subsolo */}
      <Wall y={610} h={1300} c1="#5a3f2d" c2="#432e20" />
      {/* corredores */}
      {[0, 1].map((r) => (
        <g key={r}>
          <rect x="-40" y={760 + r * 330} width="1160" height="230" fill="#1f140d" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={20 + i * 210} y={760 + r * 330} width="14" height="230" fill="#7b4f2d" />
          ))}
        </g>
      ))}
      {/* jaulas com feras */}
      <g>
        <rect x="60" y="800" width="270" height="170" fill="none" stroke="#7b4f2d" strokeWidth="10" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={100 + i * 62} y1="800" x2={100 + i * 62} y2="970" stroke="#7b4f2d" strokeWidth="8" />
        ))}
        <Sprite name="leao" x={195} y={965} h={140} shadow={false} />
        <rect x="760" y="1130" width="270" height="170" fill="none" stroke="#7b4f2d" strokeWidth="10" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={800 + i * 62} y1="1130" x2={800 + i * 62} y2="1300" stroke="#7b4f2d" strokeWidth="8" />
        ))}
        <Sprite name="leao" x={895} y={1295} h={140} flip shadow={false} />
      </g>
      {/* elevador */}
      <g>
        <rect x="430" y="610" width="16" height="760" fill="#7b4f2d" />
        <rect x="634" y="610" width="16" height="760" fill="#7b4f2d" />
        <line x1="438" y1="610" x2="438" y2={platY} stroke="#d1b57a" strokeWidth="5" />
        <line x1="642" y1="610" x2="642" y2={platY} stroke="#d1b57a" strokeWidth="5" />
        <rect x="420" y={platY} width="240" height="24" fill="#9a6a3c" />
        <rect x="440" y={platY - 110} width="200" height="110" fill="none" stroke="#7b4f2d" strokeWidth="8" />
        <Sprite name="leao" x={565} y={platY} h={105} flip shadow={false} />
      </g>
      {flame(380, 1060, 0)}
      {flame(700, 1060, 1)}
      {flame(380, 730, 2)}
      {flame(700, 730, 3)}
      {/* operários */}
      {[0, 1, 2].map((i) => (
        <Sprite key={i} name={i === 1 ? "trabalhador" : "cidadao_homem"} x={110 + i * 110} y={1590} h={250} hue={i * 6} bob={Math.sin(f * 0.3 + i) * 3} />
      ))}
      <Sprite name="cidadao_senador" x={910} y={1590} h={270} bob={Math.sin(f * 0.3) * 3} />
    </g>
  );
};

// ---------- 9. O toldo ----------
export const Toldo: React.FC<SceneProps> = ({ f }) => {
  const sag = Math.sin(f * 0.05) * 6;
  return (
    <g>
      <Sky top="#4b94c9" bottom="#f2e5bf" sunX={540} sunY={380} sunR={110} sun="#fff7da" t={f} />
      <Ground y={1360} color="#c8b27c" shade="#a79360" />
      <Colosseum x={40} y={1380} w={1000} />
      {/* toldo listrado nas bordas superiores */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x0 = 40 + i * 83;
        const topY = 1380 - 1000 * 0.2 * 3 - 1000 * 0.15;
        const col = i % 2 ? "#f6eadb" : C.terra;
        return <polygon key={i} points={`${x0},${topY} ${x0 + 83},${topY} ${540 + (i - 5.5) * 28},${topY - 250 + sag}`} fill={col} opacity="0.96" />;
      })}
      <ellipse cx="540" cy={1380 - 1000 * 0.2 * 3 - 1000 * 0.15 - 250 + sag} rx="180" ry="22" fill="#2a1b14" opacity="0.25" />
      {/* marinheiros no topo */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Sprite key={i} name="marinheiro" x={110 + i * 120} y={1380 - 1000 * 0.2 * 3 - 1000 * 0.15 + 8} h={150} flip={i % 2 === 1} bob={Math.sin(f * 0.3 + i) * 2} shadow={false} />
      ))}
      {/* sombra projetada na plateia */}
      <rect x="40" y="1380" width="1000" height="40" fill="#1a0f08" opacity="0.15" />
    </g>
  );
};

// ---------- 10. O fim dos jogos ----------
export const Queda: React.FC<SceneProps> = ({ f }) => {
  const stones = Array.from({ length: 14 });
  return (
    <g>
      <Sky top="#5f5d6e" mid="#b88a6a" bottom="#e9b783" sunX={260} sunY={900} sunR={100} sun="#ffd9a0" t={f} />
      <Ground y={1380} color="#8a7e52" shade="#6c6240" />
      <Colosseum x={30} y={1390} w={1020} ruin />
      {/* pedras caindo */}
      {stones.map((_, i) => {
        const t0 = (i * 11) % 60;
        const y = 760 + ((((f - t0) * 9) % 700) + 700) % 700;
        const x = 700 + ((i * 53) % 280);
        return <rect key={i} x={x} y={y} width={26 + (i % 3) * 12} height={22 + (i % 2) * 10} fill={C.stoneShade} stroke={C.stoneDark} strokeWidth="3" transform={`rotate(${f * 6 + i * 20} ${x} ${y})`} />;
      })}
      {/* poeira */}
      {Array.from({ length: 6 }).map((_, i) => {
        const r = 40 + ((f * 1.6 + i * 40) % 120);
        const o = 0.35 - ((f * 1.6 + i * 40) % 120) / 400;
        return <circle key={i} cx={760 + i * 36} cy={1360 - ((f + i * 20) % 100)} r={r} fill="#d9c7a3" opacity={Math.max(0, o)} />;
      })}
      {/* carroças levando pedra */}
      {[0, 1, 2].map((i) => {
        const x = ((f * (1.6 + i * 0.3) + i * 380) % 1400) - 200;
        return (
          <g key={i}>
            <Sprite name="trabalhador" x={x} y={1580 + i * 40} h={300} hue={i * 8} bob={Math.abs(Math.sin((f + i * 6) * 0.25)) * -10} />
          </g>
        );
      })}
    </g>
  );
};

// ---------- 11. Hoje ----------
export const Hoje: React.FC<SceneProps> = ({ f }) => {
  return (
    <g>
      <Sky top="#4a4a8c" mid="#d9708a" bottom="#f9c27a" sunX={300} sunY={1000} sunR={130} sun="#ffe9b0" t={f} />
      <Ground y={1400} color="#6e7c40" shade="#55632f" />
      <rect x="-200" y="1400" width="1480" height="120" fill="#a79360" opacity="0.7" />
      <Colosseum x={30} y={1410} w={1020} ruin />
      {/* aves */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d="M0 0 Q14 -14 28 0 Q42 -14 56 0" stroke={C.ink} strokeWidth="4" fill="none" transform={`translate(${(f * (2 + i * 0.4) + i * 300) % 1300 - 100} ${480 + i * 70 + Math.sin(f * 0.1 + i) * 10})`} />
      ))}
      {/* turistas */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Sprite key={i} name="turista" x={110 + i * 170 + Math.sin((f + i * 11) * 0.05) * 12} y={1640 + (i % 3) * 46} h={330 + (i % 3) * 25} flip={i % 2 === 1} bob={Math.abs(Math.sin((f + i * 5) * 0.1)) * -5} />
      ))}
    </g>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  abertura: Abertura,
  vespasiano: Vespasiano,
  obra: Obra,
  gigante: Gigante,
  portoes: Portoes,
  inauguracao: Inauguracao,
  espetaculo: Espetaculo,
  subsolo: Subsolo,
  toldo: Toldo,
  queda: Queda,
  hoje: Hoje,
};
