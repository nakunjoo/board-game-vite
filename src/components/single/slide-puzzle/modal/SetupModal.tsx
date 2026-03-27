import {
  ModalOverlay,
  SetupModalBox,
  ControlBar,
  SizeButton,
  ImageSection,
  ImageSectionLabel,
  ImageRow,
  ImageThumb,
  ThumbCheck,
  UploadThumb,
  UploadPreview,
  ModalButtons,
  ModalButton,
} from "../../../../styles/single/slide-puzzle/modal";
import { DEFAULT_IMAGES } from "../utils";
import type { GridSize, TileShape } from "../types";

interface Props {
  size: GridSize;
  selectedIdx: number;
  customImageUrl: string | null;
  hasSnapshot: boolean;
  tileShape: TileShape;
  onSizeChange: (s: GridSize) => void;
  onSelectImage: (idx: number) => void;
  onUploadClick: () => void;
  onTileShapeChange: (s: TileShape) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SetupModal({
  size,
  selectedIdx,
  customImageUrl,
  hasSnapshot,
  tileShape,
  onSizeChange,
  onSelectImage,
  onUploadClick,
  onTileShapeChange,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <ModalOverlay onClick={hasSnapshot ? onCancel : undefined}>
      <SetupModalBox onClick={(e) => e.stopPropagation()}>
        <h2>게임 설정</h2>
        <ControlBar>
          {([3, 4, 5, 6, 7] as GridSize[]).map((s) => (
            <SizeButton key={s} $active={size === s} onClick={() => onSizeChange(s)}>
              {s}×{s}
            </SizeButton>
          ))}
        </ControlBar>
        <ControlBar>
          <SizeButton $active={tileShape === "fit"} onClick={() => onTileShapeChange("fit")}>
            화면 맞춤
          </SizeButton>
          <SizeButton $active={tileShape === "square"} onClick={() => onTileShapeChange("square")}>
            정사각형
          </SizeButton>
        </ControlBar>
        <ImageSection>
          <ImageSectionLabel>이미지</ImageSectionLabel>
          <ImageRow>
            {DEFAULT_IMAGES.map((img, idx) => (
              <ImageThumb
                key={idx}
                $active={selectedIdx === idx}
                style={{ backgroundImage: `url(${img.url})` }}
                onClick={() => onSelectImage(idx)}
                title={img.label}
              >
                {selectedIdx === idx && <ThumbCheck>✓</ThumbCheck>}
              </ImageThumb>
            ))}
            <UploadThumb
              $active={selectedIdx === -1}
              onClick={onUploadClick}
              title="이미지 업로드"
            >
              {customImageUrl && selectedIdx === -1 ? (
                <>
                  <UploadPreview $url={customImageUrl} />
                  <ThumbCheck>✓</ThumbCheck>
                </>
              ) : (
                "+"
              )}
            </UploadThumb>
          </ImageRow>
        </ImageSection>
        <ModalButtons>
          {hasSnapshot && (
            <ModalButton onClick={onCancel}>취소</ModalButton>
          )}
          <ModalButton $primary onClick={onConfirm}>
            시작
          </ModalButton>
        </ModalButtons>
      </SetupModalBox>
    </ModalOverlay>
  );
}
