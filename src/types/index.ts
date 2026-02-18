import type { MagickFormat } from "@imagemagick/magick-wasm";

export interface Image {
  name: string;
  size: number;
  content: ArrayBuffer;
  type: string;
  link: string;
  loading: boolean;
}

export type Data = {
  id: string;
  fileBuffer: ArrayBuffer;
  format: MagickFormat;
};
