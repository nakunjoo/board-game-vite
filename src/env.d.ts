declare const __BUILD_DATE__: string;

interface ImportMetaEnv {
  readonly VITE_WS_URL: string;
  readonly VITE_CARD_IMAGE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
