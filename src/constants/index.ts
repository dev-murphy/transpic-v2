import { MagickFormat } from "@imagemagick/magick-wasm";

const Compression = Object.freeze({
  QUALITY: "quality",        // numeric quality (lossy control)
  LOSSLESS: "lossless",      // toggle flag (webp, avif, jxl)

  ZIP: "zip",                // deflate
  LZW: "lzw",
  RLE: "rle",
  JPEG: "jpeg",              // jpeg-in-tiff
  JPEG2000: "jpeg2000",
  JPEGXL: "jpegxl",
  HEVC: "hevc",              // HEIC
  AV1: "av1",                // AVIF
  GZIP: "gzip"               // svgz
});

export const ImageFormats = [
  {
    name: "Web Picture Format",
    format: MagickFormat.WebP,
    ext: ".webp",
    type: "image/webp",
    lossy: [Compression.QUALITY],
    lossless: [Compression.LOSSLESS]
  },
  {
    name: "Joint Photographic Experts Group",
    format: MagickFormat.Jpeg,
    ext: ".jpg",
    type: "image/jpeg",
    lossy: [Compression.QUALITY],
    lossless: []
  },
  {
    name: "Portable Network Graphics",
    format: MagickFormat.Png,
    ext: ".png",
    type: "image/png",
    lossy: [],
    lossless: [Compression.ZIP]
  },
  {
    name: "Graphics Interchange Format",
    format: MagickFormat.Gif,
    ext: ".gif",
    type: "image/gif",
    lossy: [],
    lossless: [Compression.LZW]
  },
  {
    name: "Windows Icon",
    format: MagickFormat.Ico,
    ext: ".ico",
    type: "image/x-icon",
    lossy: [],
    lossless: [Compression.ZIP]
  },
  {
    name: "Tagged Image File Format",
    format: MagickFormat.Tiff,
    ext: ".tiff",
    type: "image/tiff",
    lossy: [Compression.JPEG],
    lossless: [Compression.LZW, Compression.ZIP, Compression.RLE]
  },
  {
    name: "Adobe Photoshop Document",
    format: MagickFormat.Psd,
    ext: ".psd",
    type: "image/vnd.adobe.photoshop",
    lossy: [],
    lossless: [Compression.RLE, Compression.ZIP]
  },
  {
    name: "Scalable Vector Graphics",
    format: MagickFormat.Svg,
    ext: ".svg",
    type: "image/svg+xml",
    lossy: [],
    lossless: [Compression.GZIP]
  },
  {
    name: "Encapsulated PostScript",
    format: MagickFormat.Eps,
    ext: ".eps",
    type: "application/postscript",
    lossy: [],
    lossless: [Compression.ZIP]
  },
  {
    name: "Truevision TARGA",
    format: MagickFormat.Tga,
    ext: ".tga",
    type: "image/x-tga",
    lossy: [],
    lossless: [Compression.RLE]
  },

  // 🔥 Modern Formats

  {
    name: "AV1 Image File Format",
    format: MagickFormat.Avif,
    ext: ".avif",
    type: "image/avif",
    lossy: [Compression.QUALITY],
    lossless: [Compression.LOSSLESS]
  },
  {
    name: "High Efficiency Image Coding",
    format: MagickFormat.Heic,
    ext: ".heic",
    type: "image/heic",
    lossy: [Compression.QUALITY],
    lossless: []
  },
  {
    name: "JPEG XL",
    format: MagickFormat.Jxl,
    ext: ".jxl",
    type: "image/jxl",
    lossy: [Compression.QUALITY],
    lossless: [Compression.LOSSLESS]
  },
  {
    name: "JPEG 2000",
    format: MagickFormat.Jp2,
    ext: ".jp2",
    type: "image/jp2",
    lossy: [Compression.QUALITY],
    lossless: [Compression.LOSSLESS]
  }
] as const;