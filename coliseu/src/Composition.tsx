import React, { useEffect, useState } from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useDelayRender, useVideoConfig, Easing } from "remotion";
import { Audio } from "@remotion/media";
import timeline from "./timeline.json";
import { SCENES } from "./scenes";
import { C, Vignette } from "./art";

type Word = { w: string; s: number; e: number };
type SceneData = { id: string; title: string; sub: string; audio: string; from: number; frames: number; words: Word[] };
const scenes = timeline.scenes as SceneData[];

const useFonts = () => {
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const defs: [string, string, string][] = [
      ["Cinzel", "fonts/cinzel-latin-800-normal.woff2", "800"],
      ["Fira Sans Condensed", "fonts/fira-sans-condensed-latin-700-normal.woff2", "700"],
      ["Fira Sans Condensed", "fonts/fira-sans-condensed-latin-600-normal.woff2", "600"],
    ];
    Promise.all(
      defs.map(async ([family, file, weight]) => {
        const ff = new FontFace(family, `url(${staticFile(file)})`, { weight });
        await ff.load();
        document.fonts.add(ff);
      }),
    ).then(() => continueRender(handle));
  }, [handle, continueRender]);
};

// agrupa palavras em blocos curtos (até 3 palavras / 22 letras)
const chunkWords = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 22 || /[.,:;]$/.test(cur[cur.length - 1].w))) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) out.push(cur);
  return out;
};

const Title: React.FC<{ title: string; sub: string; f: number }> = ({ title, sub, f }) => {
  const p = interpolate(f, [4, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const line = interpolate(f, [12, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 150, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * -30}px)` }}>
      <div
        style={{
          fontFamily: "Cinzel",
          fontWeight: 800,
          fontSize: 104,
          lineHeight: 1.04,
          color: C.gold,
          textWrap: "balance",
          textShadow: "0 4px 0 #6b4310, 0 10px 28px rgba(20,10,4,0.65)",
        }}
      >
        {title}
      </div>
      <div style={{ margin: "18px auto 14px", height: 5, width: 520 * line, background: C.gold, borderRadius: 3, boxShadow: "0 3px 10px rgba(20,10,4,0.5)" }} />
      <div style={{ fontFamily: "Fira Sans Condensed", fontWeight: 600, fontSize: 44, letterSpacing: 7, color: "#f7efe0", textShadow: "0 3px 12px rgba(20,10,4,0.8)", opacity: line }}>{sub}</div>
    </div>
  );
};

const Captions: React.FC<{ words: Word[]; f: number; fps: number }> = ({ words, f, fps }) => {
  const t = f / fps;
  const chunks = chunkWords(words);
  let idx = -1;
  chunks.forEach((c, i) => {
    if (t >= c[0].s) idx = i;
  });
  if (idx < 0) return null;
  const c = chunks[idx];
  const pop = interpolate(t - c[0].s, [0, 0.12], [0.86, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) });
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1470, textAlign: "center", transform: `scale(${pop})` }}>
      {c.map((w, i) => {
        const active = t >= w.s && t < w.e;
        return (
          <span
            key={i}
            style={{
              fontFamily: "Fira Sans Condensed",
              fontWeight: 700,
              fontSize: 98,
              textTransform: "uppercase",
              color: active ? C.gold : "#fff7e6",
              WebkitTextStroke: "12px #24150c",
              paintOrder: "stroke fill",
              textShadow: "0 8px 18px rgba(20,10,4,0.55)",
              marginRight: 22,
              display: "inline-block",
            }}
          >
            {w.w.replace(/[.,:;]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

const SceneView: React.FC<{ d: SceneData; i: number }> = ({ d, i }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Art = SCENES[d.id];
  const p = f / d.frames;
  // câmera: push-in lento com deriva; alterna direção por cena
  const dir = i % 2 ? -1 : 1;
  const scale = 1.02 + p * 0.1;
  const tx = dir * (p - 0.5) * 50;
  const ty = (0.5 - p) * 24;
  const shake = d.id === "queda" ? Math.sin(f * 1.3) * 7 * (f < 90 ? 1 : 0.35) : 0;
  const fadeIn = interpolate(f, [0, 8], [1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#1a0f08" }}>
      <AbsoluteFill style={{ transform: `translate(${tx + shake}px, ${ty}px) scale(${scale})` }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920">
          <Art f={f} n={d.frames} />
        </svg>
      </AbsoluteFill>
      <Vignette />
      <Title title={d.title} sub={d.sub} f={f} />
      <Captions words={d.words} f={f} fps={fps} />
      <AbsoluteFill style={{ background: "#1a0f08", opacity: fadeIn }} />
      <Audio src={staticFile(d.audio)} />
    </AbsoluteFill>
  );
};

export const MyComposition: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const total = timeline.total;
  const out = interpolate(frame, [total - 24, total], [0, 1], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#1a0f08" }}>
      {scenes.map((d, i) => (
        <Sequence key={d.id} name={d.id} from={d.from} durationInFrames={d.frames} layout="none">
          <SceneView d={d} i={i} />
        </Sequence>
      ))}
      <Audio src={staticFile("audio/music.mp3")} volume={(f) => 0.16 * interpolate(f, [total - 60, total], [1, 0], { extrapolateLeft: "clamp" })} loop />
      <AbsoluteFill style={{ background: "#1a0f08", opacity: out }} />
    </AbsoluteFill>
  );
};
