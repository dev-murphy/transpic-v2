import type { MagickFormat } from "@imagemagick/magick-wasm";
import { ImageFormats } from "@/constants";

export type ImageExtension = (typeof ImageFormats)[number]['ext'] | "";
export type ImageType = (typeof ImageFormats)[number]['type'] | 'unknown';
export type ImageFormat = (typeof ImageFormats)[number]['format'] | '';

export interface Image {
  name: string;
  size: number;
  content: ArrayBuffer;
  link: string;
  type: ImageFormat ;
  toFormat: ImageFormat;
  loading: boolean;
  convertedName?: string;
  convertedSize?: number;
}

export type Data = {
  id: string;
  fileBuffer: ArrayBuffer;
  format: MagickFormat;
};


