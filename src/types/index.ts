import type { MagickFormat } from "@imagemagick/magick-wasm";
import { SUPPORTED_FORMATS } from "@/constants";

export type FORMATS = (typeof SUPPORTED_FORMATS)[number] | "";

export interface Image {
  name: string;
  size: number;
  content: ArrayBuffer;
  type: string;
  link: string;
  toFormat: FORMATS;
  loading: boolean;
}

export type Data = {
  id: string;
  fileBuffer: ArrayBuffer;
  format: MagickFormat;
};
