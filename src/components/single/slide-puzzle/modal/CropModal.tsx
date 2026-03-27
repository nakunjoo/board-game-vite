import { useEffect, useRef, useState } from "react";
import { ModalOverlay } from "../../../../styles/single/slide-puzzle/modal";
import {
  CropArea,
  CropBox,
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
interface DragState { startX: number; startY: number; startBox: Rect; }

export default function CropModal({ imageUrl, aspectRatio, onConfirm, onCancel }: Props) {
  const areaRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [areaSize, setAreaSize] = useState({ w: 0, h: 0 });
  const [displayRect, setDisplayRect] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [cropBox, setCropBox] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });

  const dragRef = useRef<DragState | null>(null);
  const cropBoxRef = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const displayRectRef = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => { cropBoxRef.current = cropBox; }, [cropBox]);
  useEffect(() => { displayRectRef.current = displayRect; }, [displayRect]);

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

    // 크롭박스: aspectRatio 유지하며 최대 크기
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

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragRef.current) return;
    const { startX, startY, startBox } = dragRef.current;
    const dr = displayRectRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const x = Math.max(dr.x, Math.min(dr.x + dr.w - startBox.w, startBox.x + dx));
    const y = Math.max(dr.y, Math.min(dr.y + dr.h - startBox.h, startBox.y + dy));
    const next = { x, y, w: startBox.w, h: startBox.h };
    cropBoxRef.current = next;
    setCropBox({ ...next });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  const startDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...cropBoxRef.current },
    };
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
              {/* 이미지 (z-index 없음, 가장 아래) */}
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

              {/* SVG 오버레이 — 크롭 영역만 뚫린 어두운 마스크 (z-index: 2) */}
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

              {/* 크롭 박스 테두리 + 드래그 (z-index: 3) */}
              <CropBox
                style={{ left: cropBox.x, top: cropBox.y, width: cropBox.w, height: cropBox.h }}
                onPointerDown={startDrag}
              />
            </>
          )}
        </CropArea>
        <CropHint>드래그하여 위치를 조정하세요</CropHint>
        <CropButtonRow>
          <CropBtn onClick={onCancel}>취소</CropBtn>
          <CropBtn $primary onClick={handleConfirm} disabled={!loaded}>적용</CropBtn>
        </CropButtonRow>
      </CropModalBox>
    </ModalOverlay>
  );
}
