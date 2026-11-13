import type { Stroke, StrokeOp } from "../types";

export type QueuedItem = { op: StrokeOp } | { id: number; x: number; y: number };

/**
 * 이번 턴의 그림 데이터. 화면 모드를 바꾸거나 그리는 사람 화면으로 바뀌어
 * 그림판이 새로 만들어져도 그림이 남도록 그림판 바깥(방 페이지)에 둔다.
 */
export class DrawingModel {
  strokes: Stroke[] = [];
  /** 받았지만 아직 화면에 안 그린 조각 */
  queue: QueuedItem[] = [];
  /** 지금 붙어 있는 그림판 */
  private view: { play: () => void; redraw: () => void } | null = null;

  attach(view: { play: () => void; redraw: () => void }) {
    this.view = view;
    view.redraw();
    if (this.queue.length) view.play();
    return () => {
      if (this.view === view) this.view = null;
    };
  }

  applyRemote(ops: StrokeOp[]) {
    const q = this.queue;
    for (const op of ops) {
      if (op.t === "b") {
        q.push({ op });
        for (let i = 2; i + 1 < op.p.length; i += 2) q.push({ id: op.id, x: op.p[i], y: op.p[i + 1] });
      } else if (op.t === "m") {
        for (let i = 0; i + 1 < op.p.length; i += 2) q.push({ id: op.id, x: op.p[i], y: op.p[i + 1] });
      } else {
        q.push({ op });
      }
    }
    this.view?.play();
  }

  reset(strokes: Stroke[]) {
    this.queue = [];
    this.strokes = strokes.map((s) => ({ ...s, points: [...s.points] }));
    this.view?.redraw();
  }
}
