import { useEffect, useRef, useState } from "react";
import { ModalOverlay } from "../../../../styles/single/slide-puzzle/modal";
import {
  CropArea,
  CropBox,
  CropHandle,
  CropOverlaySvg,
  CropBtn,
  CropButtonRow,
  CropHint,
  CropLoading,
  CropModalBox,
} from "../../../../styles/single/slide-puzzle/cropModal";

interface Props {
  imageUrl: string;
  aspectRatio: number;
  onConfirm: (url: string) => void;
  onCancel: () => void;
}

interface Rect { x: number; y: number; w: number; h: number; }
type Corner = "nw" | "ne" | "sw" | "se";
type ActionState =
  | { kind: "move"; startX: number; startY: number; startBox: Rect }
  | { kind: "resize"; corner: Corner; anchorX: number; anchorY: number };

const MIN_SIZE = 40;
const CORNERS: Corner[] = ["nw", "ne", "sw", "se"];

export default function CropModal({ imageUrl, aspectRatio, onConfirm, onCancel }: Props) {
  const areaRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [areaSize, setAreaSize] = useState({ w: 0, h: 0 });
  const [displayRect, setDisplayRect] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [cropBox, setCropBox] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });

  const actionRef = useRef<ActionState | null>(null);
  const cropBoxRef = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const displayRectRef = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const aspectRatioRef = useRef(aspectRatio);

  useEffect(() => { cropBoxRef.current = cropBox; }, [cropBox]);
  useEffect(() => { displayRectRef.current = displayRect; }, [displayRect]);
  useEffect(() => { aspectRatioRef.current = aspectRatio; }, [aspectRatio]);

  // 이미지 로드
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // 영역 크기 측정
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setAreaSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // displayRect + cropBox 초기화
  useEffect(() => {
    if (!loaded || !imgRef.current || areaSize.w === 0) return;

    const { w: areaW, h: areaH } = areaSize;
    const natW = imgRef.current.naturalWidth;
    const natH = imgRef.current.naturalHeight;

    const scale = Math.min(areaW / natW, areaH / natH);
    const dispW = natW * scale;
    const dispH = natH * scale;
    const dispX = (areaW - dispW) / 2;
    const dispY = (areaH - dispH) / 2;
    const dr: Rect = { x: dispX, y: dispY, w: dispW, h: dispH };

    let cbW: number, cbH: number;
    if (dispW / dispH > aspectRatio) {
      cbH = dispH; cbW = cbH * aspectRatio;
    } else {
      cbW = dispW; cbH = cbW / aspectRatio;
    }
    const cb: Rect = {
      x: dr.x + (dr.w - cbW) / 2,
      y: dr.y + (dr.h - cbH) / 2,
      w: cbW, h: cbH,
    };

    setDisplayRect(dr);
    setCropBox(cb);
    cropBoxRef.current = cb;
    displayRectRef.current = dr;
  }, [loaded, areaSize, aspectRatio]);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const handlePointerMove = (e: PointerEvent) => {
    const action = actionRef.current;
    if (!action) return;
    const dr = displayRectRef.current;
    const ar = aspectRatioRef.current;

    if (action.kind === "move") {
      const { startX, startY, startBox } = action;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const x = clamp(startBox.x + dx, dr.x, dr.x + dr.w - startBox.w);
      const y = clamp(startBox.y + dy, dr.y, dr.y + dr.h - startBox.h);
      const next = { x, y, w: startBox.w, h: startBox.h };
      cropBoxRef.current = next;
      setCropBox({ ...next });
      return;
    }

    // resize
    const { corner, anchorX, anchorY } = action;

    let rawW: number, rawH: number;
    let maxW: number, maxH: number;

    if (corner === "se") {
      rawW = e.clientX - anchorX;
      rawH = e.clientY - anchorY;
      maxW = dr.x + dr.w - anchorX;
      maxH = dr.y + dr.h - anchorY;
    } else if (corner === "sw") {
      rawW = anchorX - e.clientX;
      rawH = e.clientY - anchorY;
      maxW = anchorX - dr.x;
      maxH = dr.y + dr.h - anchorY;
    } else if (corner === "ne") {
      rawW = e.clientX - anchorX;
      rawH = anchorY - e.clientY;
      maxW = dr.x + dr.w - anchorX;
      maxH = anchorY - dr.y;
    } else {
      // nw
      rawW = anchorX - e.clientX;
      rawH = anchorY - e.clientY;
      maxW = anchorX - dr.x;
      maxH = anchorY - dr.y;
    }

    const clampedW = clamp(rawW, MIN_SIZE, maxW);
    const clampedH = clamp(rawH, MIN_SIZE, maxH);
    const newW = Math.min(clampedW, clampedH * ar);
    const newH = newW / ar;

    let newX: number, newY: number;
    if (corner === "se") { newX = anchorX; newY = anchorY; }
    else if (corner === "sw") { newX = anchorX - newW; newY = anchorY; }
    else if (corner === "ne") { newX = anchorX; newY = anchorY - newH; }
    else { newX = anchorX - newW; newY = anchorY - newH; }

    const next = { x: newX, y: newY, w: newW, h: newH };
    cropBoxRef.current = next;
    setCropBox({ ...next });
  };

  const handlePointerUp = () => {
    actionRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  const startMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    actionRef.current = {
      kind: "move",
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...cropBoxRef.current },
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const startResize = (corner: Corner) => (e: React.PointerEvent) => {
    e.stopPropagation();
    const cb = cropBoxRef.current;
    let anchorX: number, anchorY: number;
    if (corner === "se") { anchorX = cb.x; anchorY = cb.y; }
    else if (corner === "sw") { anchorX = cb.x + cb.w; anchorY = cb.y; }
    else if (corner === "ne") { anchorX = cb.x; anchorY = cb.y + cb.h; }
    else { anchorX = cb.x + cb.w; anchorY = cb.y + cb.h; }

    actionRef.current = { kind: "resize", corner, anchorX, anchorY };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = () => {
    if (!imgRef.current) return;
    const dr = displayRectRef.current;
    const cb = cropBoxRef.current;
    const natW = imgRef.current.naturalWidth;
    const natH = imgRef.current.naturalHeight;

    const scaleX = natW / dr.w;
    const scaleY = natH / dr.h;
    const srcX = (cb.x - dr.x) * scaleX;
    const srcY = (cb.y - dr.y) * scaleY;
    const srcW = cb.w * scaleX;
    const srcH = cb.h * scaleY;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(srcW);
    canvas.height = Math.round(srcH);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(imgRef.current, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
    onConfirm(canvas.toDataURL("image/jpeg", 0.92));
  };

  return (
    <ModalOverlay>
      <CropModalBox>
        <h3>이미지 영역 선택</h3>
        <CropArea ref={areaRef}>
          {!loaded && <CropLoading>⏳ 이미지 불러오는 중...</CropLoading>}
          {loaded && (
            <>
              <img
                src={imageUrl}
                alt=""
                style={{
                  position: "absolute",
                  left: displayRect.x,
                  top: displayRect.y,
                  width: displayRect.w,
                  height: displayRect.h,
                  pointerEvents: "none",
                  userSelect: "none",
                  display: "block",
                  zIndex: 1,
                }}
                draggable={false}
              />

              <CropOverlaySvg>
                <defs>
                  <mask id="crop-hole">
                    <rect width="100%" height="100%" fill="white" />
                    <rect
                      x={cropBox.x} y={cropBox.y}
                      width={cropBox.w} height={cropBox.h}
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  width="100%" height="100%"
                  fill="rgba(0,0,0,0.55)"
                  mask="url(#crop-hole)"
                />
              </CropOverlaySvg>

              <CropBox
                style={{ left: cropBox.x, top: cropBox.y, width: cropBox.w, height: cropBox.h }}
                onPointerDown={startMove}
              >
                {CORNERS.map((corner) => (
                  <CropHandle
                    key={corner}
                    $corner={corner}
                    onPointerDown={startResize(corner)}
                  />
                ))}
              </CropBox>
            </>
          )}
        </CropArea>
        <CropHint>드래그로 이동, 모서리를 드래그하면 크기 조절 (비율 고정)</CropHint>
        <CropButtonRow>
          <CropBtn onClick={onCancel}>취소</CropBtn>
          <CropBtn $primary onClick={handleConfirm} disabled={!loaded}>적용</CropBtn>
        </CropButtonRow>
      </CropModalBox>
    </ModalOverlay>
  );
}
