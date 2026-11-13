import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CanvasBox, CanvasFrame } from "../../../styles/game/drawing/board";
import type { Stroke, StrokeOp } from "../types";
import type { DrawingModel, QueuedItem } from "./drawingModel";

/** 그리는 사람의 되돌리기·전체 지우기. 받은 그림은 DrawingModel로 넣는다 */
export interface DrawingCanvasHandle {
  undo(): void;
  clear(): void;
}

interface Props {
  model: DrawingModel;
  canDraw: boolean;
  color: string;
  size: number;
  /** 내가 그린 조각을 50ms마다 묶어서 넘긴다 */
  onOps: (ops: StrokeOp[]) => void;
  children?: ReactNode;
}

const FLUSH_MS = 50;
/** 받은 조각을 이 정도 시간에 걸쳐 그린다 (원래 그린 속도 흉내) */
const PLAYBACK_MS = 100;
/** 이보다 많이 밀리면 기다리지 않고 한 번에 따라잡는다 */
const CATCH_UP = 400;
/** 거의 같은 자리의 점은 버린다 (0~1000 좌표 기준) */
const MIN_STEP = 4;
const MAX_POINTS_PER_OP = 400;
/** 제시어를 고른 터치가 그림판에 점으로 찍히지 않게, 그리기가 시작된 직후 잠깐은 무시한다 */
const START_GUARD_MS = 400;
/** 그림판 세로/가로. 기기마다 같아야 그림이 찌그러지지 않는다 (휴대폰 세로 화면에 맞춘 3:4) */
const ASPECT = 4 / 3;

const DrawingCanvas = forwardRef<DrawingCanvasHandle, Props>(function DrawingCanvas(
  { model, canDraw, color, size, onOps, children },
  ref,
) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const height = Math.round(width * ASPECT);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const pendingRef = useRef<StrokeOp[]>([]);
  const activeRef = useRef<Stroke | null>(null);
  const nextIdRef = useRef(Date.now() % 1_000_000_000);
  // 그리기가 시작되고 잠깐 지나야 true. 렌더 직후 effect보다 먼저 오는 터치도 막기 위해 시각이 아니라 타이머로 연다
  const readyRef = useRef(false);
  const onOpsRef = useRef(onOps);
  useEffect(() => {
    onOpsRef.current = onOps;
  }, [onOps]);

  // ── 그리기 ───────────────────────────────────────────────

  const getCtx = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return null;
    // 좌표는 가로·세로 모두 0~1000, 굵기는 가로 기준
    return { ctx, sx: canvas.width / 1000, sy: canvas.height / 1000 };
  };

  /** i번째 점이 추가됐을 때 이어지는 부분만 그린다 (점 사이는 곡선) */
  const drawSegment = (s: Stroke, i: number) => {
    const c = getCtx();
    if (!c) return;
    const { ctx, sx, sy } = c;
    const p = s.points;
    const x = (k: number) => p[k * 2] * sx;
    const y = (k: number) => p[k * 2 + 1] * sy;
    const mx = (a: number, b: number) => (x(a) + x(b)) / 2;
    const my = (a: number, b: number) => (y(a) + y(b)) / 2;
    const lineWidth = Math.max(1, s.size * sx);
    ctx.strokeStyle = s.color;
    ctx.fillStyle = s.color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (i === 0) {
      ctx.beginPath();
      ctx.arc(x(0), y(0), lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    if (i === 1) {
      ctx.moveTo(x(0), y(0));
      ctx.lineTo(mx(0, 1), my(0, 1));
    } else {
      ctx.moveTo(mx(i - 2, i - 1), my(i - 2, i - 1));
      ctx.quadraticCurveTo(x(i - 1), y(i - 1), mx(i - 1, i), my(i - 1, i));
    }
    ctx.stroke();
  };

  /** 선 끝 반 토막 (곡선은 다음 점이 와야 그려지므로 마지막에 마무리) */
  const drawTail = (s: Stroke) => {
    const n = s.points.length / 2;
    const c = getCtx();
    if (!c || n < 2) return;
    const { ctx, sx, sy } = c;
    const p = s.points;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = Math.max(1, s.size * sx);
    ctx.beginPath();
    ctx.moveTo(((p[(n - 2) * 2] + p[(n - 1) * 2]) / 2) * sx, ((p[(n - 2) * 2 + 1] + p[(n - 1) * 2 + 1]) / 2) * sy);
    ctx.lineTo(p[(n - 1) * 2] * sx, p[(n - 1) * 2 + 1] * sy);
    ctx.stroke();
  };

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const s of model.strokes) {
      const n = s.points.length / 2;
      for (let i = 0; i < n; i++) drawSegment(s, i);
      drawTail(s);
    }
    // drawSegment·drawTail은 ref만 다룬다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  // ── 받은 조각 재생 (0.1초쯤 늦춰 원래 속도대로 이어 그린다) ──

  const consume = (item: QueuedItem) => {
    const strokes = model.strokes;
    if ("op" in item) {
      const op = item.op;
      if (op.t === "b") {
        const s: Stroke = { id: op.id, color: op.c, size: op.s, points: op.p.slice(0, 2) };
        strokes.push(s);
        drawSegment(s, 0);
      } else if (op.t === "u") {
        strokes.pop();
        redrawAll();
      } else if (op.t === "x") {
        model.strokes = [];
        redrawAll();
      }
      return;
    }
    let s: Stroke | undefined;
    for (let i = strokes.length - 1; i >= 0; i--) {
      if (strokes[i].id === item.id) {
        s = strokes[i];
        break;
      }
    }
    if (!s) return;
    s.points.push(item.x, item.y);
    drawSegment(s, s.points.length / 2 - 1);
  };

  const tick = useCallback((now: number) => {
    const q = model.queue;
    const dt = lastFrameRef.current ? now - lastFrameRef.current : 16;
    lastFrameRef.current = now;
    const count = q.length > CATCH_UP ? q.length : Math.max(1, Math.ceil((q.length * dt) / PLAYBACK_MS));
    const items = q.splice(0, count);
    items.forEach(consume);
    if (q.length > 0) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = null;
      lastFrameRef.current = 0;
    }
    // consume은 model과 ref만 다룬다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  const startPlayback = useCallback(() => {
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  // ── 내가 그리기 ──────────────────────────────────────────

  const flush = useCallback(() => {
    if (pendingRef.current.length === 0) return;
    const ops = pendingRef.current;
    pendingRef.current = [];
    onOpsRef.current(ops);
  }, []);

  useEffect(() => {
    if (!canDraw) {
      activeRef.current = null;
      flush();
      return;
    }
    const ready = setTimeout(() => {
      readyRef.current = true;
    }, START_GUARD_MS);
    const id = setInterval(flush, FLUSH_MS);
    return () => {
      readyRef.current = false;
      clearTimeout(ready);
      clearInterval(id);
      flush();
    };
  }, [canDraw, flush]);

  const toPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clamp = (v: number) => Math.min(1000, Math.max(0, Math.round(v)));
    return [clamp(((e.clientX - rect.left) / rect.width) * 1000), clamp(((e.clientY - rect.top) / rect.height) * 1000)];
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canDraw || !readyRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [x, y] = toPoint(e);
    const s: Stroke = { id: nextIdRef.current++, color, size, points: [x, y] };
    model.strokes.push(s);
    activeRef.current = s;
    drawSegment(s, 0);
    pendingRef.current.push({ t: "b", id: s.id, c: color, s: size, p: [x, y] });
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = activeRef.current;
    if (!s || !canDraw) return;
    const [x, y] = toPoint(e);
    const n = s.points.length;
    if (Math.hypot(x - s.points[n - 2], y - s.points[n - 1]) < MIN_STEP) return;
    s.points.push(x, y);
    drawSegment(s, s.points.length / 2 - 1);
    const last = pendingRef.current[pendingRef.current.length - 1];
    if (last && (last.t === "b" || last.t === "m") && last.id === s.id && last.p.length < MAX_POINTS_PER_OP * 2) {
      last.p.push(x, y);
    } else {
      pendingRef.current.push({ t: "m", id: s.id, p: [x, y] });
    }
  };

  const handleUp = () => {
    const s = activeRef.current;
    if (!s) return;
    drawTail(s);
    activeRef.current = null;
    flush();
  };

  // ── 바깥에서 쓰는 동작 ───────────────────────────────────

  useImperativeHandle(
    ref,
    () => ({
      undo() {
        if (model.strokes.length === 0) return;
        activeRef.current = null;
        model.strokes.pop();
        redrawAll();
        pendingRef.current.push({ t: "u" });
        flush();
      },
      clear() {
        if (model.strokes.length === 0) return;
        activeRef.current = null;
        model.strokes = [];
        redrawAll();
        pendingRef.current.push({ t: "x" });
        flush();
      },
    }),
    [model, redrawAll, flush],
  );

  // 그림판이 새로 만들어지면 지금까지의 그림을 다시 그리고, 밀린 조각을 이어 재생한다
  useEffect(() => model.attach({ play: startPlayback, redraw: redrawAll }), [model, startPlayback, redrawAll]);

  // ── 크기 (자리에 들어가는 가장 큰 3:4) ───────────────────

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setWidth(Math.floor(Math.min(el.clientWidth, el.clientHeight / ASPECT)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    redrawAll();
  }, [width, height, redrawAll]);

  // 휴대폰은 백그라운드에서 그림판 내용을 버리기도 해서, 돌아오면 다시 그린다
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") redrawAll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [redrawAll]);

  return (
    <CanvasFrame ref={frameRef}>
      <CanvasBox style={{ width, height }}>
        <canvas
          ref={canvasRef}
          style={{ width, height, touchAction: "none", cursor: canDraw ? "crosshair" : "default" }}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          aria-label="그림판"
        />
        {children}
      </CanvasBox>
    </CanvasFrame>
  );
});

export default DrawingCanvas;
