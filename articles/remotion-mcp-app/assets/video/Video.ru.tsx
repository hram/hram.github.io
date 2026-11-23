import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { CSSProperties, ReactNode } from "react";

const paper = "#edf1f7";
const ink = "#142035";
const muted = "#536580";
const border = "#c8d5e7";
const blue = "#194cbf";
const rust = "#984116";
const navy = "#182944";
const mint = "#a0f3d3";
const mono = '"DejaVu Sans Mono", monospace';
const canvas: CSSProperties = { position: "absolute", inset: 0 };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const progress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], clamp);
const smooth = (value: number) => value * value * (3 - 2 * value);
const between = (frame: number, a: number, b: number) => frame >= a && frame < b;

function Header({ phase, title }: { phase: string; title: string }) {
  return <>
    <div style={{ position: "absolute", left: 90, right: 90, top: 61, paddingBottom: 17, borderBottom: `2px solid ${border}`,
      display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: mono, fontSize: 28, letterSpacing: 0.8 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 15 }}>
        <span style={{ display: "inline-block", background: blue, width: 13, height: 13, transform: "rotate(45deg)" }} />
        REMOTION MCP APP
      </span>
      <span style={{ color: blue }}>{phase}</span>
    </div>
    <h1 style={{ position: "absolute", left: 90, right: 90, top: 139, margin: 0, fontSize: 79, lineHeight: 1.08, letterSpacing: -3.2 }}>
      {title}
    </h1>
  </>;
}

function Panel({ side, dark = false, children }: { side: "left" | "right"; dark?: boolean; children: ReactNode }) {
  const agent = side === "right";
  return <div style={{ position: "absolute", top: 277, left: agent ? 1205 : 90, width: 625, height: 594,
    boxSizing: "border-box", borderRadius: 27, border: `2px solid ${dark ? "#324c6a" : border}`,
    background: dark ? navy : "#fff", color: dark ? "#f4f7ff" : ink }}>
    <div style={{ position: "absolute", left: 29, top: 28, display: "flex", alignItems: "center", gap: 15, fontWeight: 800 }}>
      <span style={{ display: "grid", placeItems: "center", width: 46, height: 46, background: dark ? "#31496b" : "#e1eafa",
        color: dark ? mint : blue, borderRadius: 11, fontFamily: mono, fontSize: 23 }}>{agent ? "A" : "Я"}</span>
      <span style={{ fontSize: 40 }}>{agent ? "Агент" : "Я"}</span>
    </div>
    {children}
  </div>;
}

function Card({ y, text, hint, active = false, dark = false, compact = false }: {
  y: number; text: string; hint?: string; active?: boolean; dark?: boolean; compact?: boolean;
}) {
  return <div style={{ position: "absolute", top: y, left: 29, width: compact ? 495 : 563, height: compact ? 74 : 133,
    boxSizing: "border-box", borderRadius: 15, padding: compact ? "14px 18px" : "18px 22px",
    border: `2px solid ${dark ? active ? mint : "#445e81" : active ? blue : border}`,
    background: dark ? active ? "#254650" : "#203552" : active ? "#e7efff" : "#f6f8fc",
    whiteSpace: "nowrap" }}>
    <div style={{ lineHeight: 1.16, fontSize: compact ? 34 : 40, letterSpacing: -0.9, fontWeight: 780,
      color: dark && active ? mint : undefined }}>{text}</div>
    {hint && <div style={{ color: dark ? "#b5c9e4" : muted, fontSize: 27, marginTop: 8 }}>{hint}</div>}
  </div>;
}

function Arrow({ y, label, direction, active, amount, warm = false }: {
  y: number; label: string; direction: "left" | "right"; active: boolean; amount: number; warm?: boolean;
}) {
  const right = direction === "right";
  const start = right ? 735 : 1185;
  const stop = right ? 1185 : 735;
  const color = active ? warm ? rust : blue : "#a7b8d1";
  const x = start + (stop - start) * amount;
  return <>
    <div style={{ position: "absolute", top: y - 66, left: 723, width: 474, textAlign: "center", color: active ? color : muted,
      fontSize: 33, fontWeight: 740 }}>{label}</div>
    <svg width={1920} height={1080} style={{ ...canvas, pointerEvents: "none" }} aria-hidden="true">
      <path d={`M ${start} ${y} H ${stop}`} stroke={color} strokeWidth={active ? 6 : 3} />
      <path d={`M ${stop + (right ? -19 : 19)} ${y - 13} L ${stop} ${y} L ${stop + (right ? -19 : 19)} ${y + 13}`}
        stroke={color} strokeWidth={active ? 6 : 3} strokeLinecap="round" fill="none" />
      {active && <circle cx={x} cy={y} r={10} fill={color} stroke={paper} strokeWidth={3} />}
    </svg>
  </>;
}

function Original({ frame }: { frame: number }) {
  const round = frame < 108 ? 1 : 2;
  const f = round === 1 ? frame : frame - 108 + 9;
  const sending = between(f, 16, 49);
  const watching = between(f, 49, 66);
  const feedback = between(f, 66, 91);
  const editing = f >= 91;
  return <>
    <Header phase="ИСХОДНЫЙ REMOTION MCP" title="Я проверяю каждую версию" />
    <Panel side="left">
      <Card y={155} text="Смотрю ролик" hint="Нахожу замечания" active={watching} />
      <Card y={360} text="Отправляю замечания" hint="Объясняю, что исправить" active={feedback} />
    </Panel>
    <Panel side="right">
      <Card y={155} text={round === 1 ? "Делает ролик" : "Возвращает черновик"} active={f < 49} />
      <Card y={360} text="Вносит правки" active={editing} />
    </Panel>
    <svg width={1920} height={1080} style={{ ...canvas, pointerEvents: "none" }} aria-hidden="true">
      <path d="M 402 583 V 625 m -9 -10 9 10 9 -10" fill="none" stroke={watching || feedback ? rust : "#a7b8d1"} strokeWidth={4} />
      <path d="M 1518 625 V 583 m -9 10 9 -10 9 10" fill="none" stroke={editing ? blue : "#a7b8d1"} strokeWidth={4} />
    </svg>
    <Arrow y={488} label={`Черновик ${round}`} direction="left" active={sending} amount={smooth(progress(f, 16, 49))} />
    <Arrow y={693} label="Замечания" direction="right" active={feedback} amount={smooth(progress(f, 66, 91))} warm />
    <div style={{ position: "absolute", top: 923, left: 90, display: "flex", gap: 15, alignItems: "center",
      color: muted, fontFamily: mono, fontSize: 31 }}>
      <span style={{ fontWeight: 800, color: blue }}>КРУГ {round}</span>
      <span>·</span><span>Снова смотрю и даю обратную связь</span>
    </div>
  </>;
}

function AgentLoop({ frame, final }: { frame: number; final: boolean }) {
  const reviewing = between(frame, 53, 158);
  const round = frame < 105 ? 1 : 2;
  const f = frame - (round === 1 ? 53 : 105);
  const reveal = final || frame >= 53;
  const active = reviewing ? f < 17 ? 0 : f < 33 ? 1 : 2 : -1;
  const marker = reviewing ? progress(f, 35, 52) : 0;
  return <Panel side="right" dark>
    <Card y={103} text="Делает ролик" dark compact active={between(frame, 23, 53)} />
    <Card y={211} text="Смотрит кадры" dark compact active={active === 0} />
    <Card y={308} text="Находит ошибку" dark compact active={active === 1} />
    <Card y={405} text="Исправляет" dark compact active={active === 2} />
    <div style={{ position: "absolute", left: 29, top: 527, fontFamily: mono, fontSize: 25, color: mint }}>
      {reviewing ? `КРУГ ${round} · inspect_frames` : reveal ? "↳  inspect_frames" : "↳  цикл проверки"}
    </div>
    <svg width={625} height={594} style={{ ...canvas, opacity: reveal ? 1 : 0.28, pointerEvents: "none" }} aria-hidden="true">
      <path d="M 536 441 H 577 Q 591 441 591 425 V 263 Q 591 247 577 247 H 538"
        fill="none" stroke={mint} strokeWidth={3} />
      <path d="M 550 236 L 538 247 L 550 258" fill="none" stroke={mint} strokeWidth={3} strokeLinecap="round" />
      <path d="M 96 288 v 15 m -5 -5 5 5 5 -5 M 96 385 v 15 m -5 -5 5 5 5 -5" fill="none" stroke={mint} strokeWidth={3} />
      {reviewing && f > 35 && <circle cx={591} cy={442 - 194 * marker} r={8} fill={mint} />}
    </svg>
  </Panel>;
}

function Fork({ frame, final = false }: { frame: number; final?: boolean }) {
  const request = frame < 28;
  const send = between(frame, 162, 194);
  const delivered = final || frame >= 194;
  return <>
    <Header phase="МОЙ ФОРК REMOTION MCP" title={final ? "Я смотрю уже исправленный ролик" : "Агент сам проходит цикл правок"} />
    <Panel side="left">
      <Card y={109} text="Отправляю задачу" active={!final && request} />
      {delivered ? <div style={{ position: "absolute", left: 29, right: 29, top: 311, height: 192, borderRadius: 18,
        padding: "24px 21px", background: "#e6edff", border: `2px solid ${blue}` }}>
        <span style={{ color: blue, fontFamily: mono, fontWeight: 800, fontSize: 40 }}>MP4</span>
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 14, fontSize: 38, fontWeight: 780, letterSpacing: -1 }}>
          <span style={{ width: 0, height: 0, borderTop: "11px solid transparent", borderBottom: "11px solid transparent", borderLeft: `17px solid ${blue}` }} />
          Готовый ролик
        </div>
      </div> : <Card y={340} text="Жду результат" />}
    </Panel>
    <AgentLoop frame={frame} final={final} />
    <Arrow y={445} label="Задача" direction="right" active={!final && request} amount={smooth(progress(frame, 0, 28))} />
    <Arrow y={698} label="Проверенный ролик" direction="left" active={send || delivered} amount={smooth(progress(frame, 162, 194))} />
    {final ? <div style={{ position: "absolute", left: 90, right: 90, top: 916, borderTop: `2px solid ${border}`, paddingTop: 23,
      display: "flex", alignItems: "center", gap: 24 }}>
      <span style={{ color: muted, fontSize: 29 }}>Код и запуск</span>
      <span style={{ color: blue, fontFamily: mono, fontSize: 38, letterSpacing: -1 }}>github.com/hram/remotion-mcp-app</span>
    </div> : <div style={{ position: "absolute", left: 90, top: 923, color: muted, fontSize: 31, fontWeight: 650 }}>
      {delivered ? "Получаю версию после проверки" : "Повторные проверки идут внутри агента"}
    </div>}
  </>;
}

export default function Video() {
  const frame = useCurrentFrame();
  const forkStart = 210;
  const finalStart = 420;
  const transition = frame < forkStart
    ? progress(frame, forkStart - 7, forkStart)
    : 1 - progress(frame, forkStart, forkStart + 7);
  return <AbsoluteFill style={{ background: paper, color: ink, fontFamily: '"DejaVu Sans", sans-serif', overflow: "hidden" }}>
    {frame < forkStart ? <Original frame={frame} /> : frame < finalStart
      ? <Fork frame={frame - forkStart} />
      : <Fork frame={210} final />}
    <div style={{ ...canvas, pointerEvents: "none", background: blue, opacity: transition * 0.16 }} />
    <div style={{ position: "absolute", bottom: 0, height: 7, width: `${100 * frame / 539}%`, background: blue }} />
  </AbsoluteFill>;
}
