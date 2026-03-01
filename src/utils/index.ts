import type { ImageFormat } from "@/types";

export async function detectImageType(file: File | Blob): Promise<ImageFormat> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // WebP
  if (
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46 && // F
    bytes[8] === 0x57 && // W
    bytes[9] === 0x45 && // E
    bytes[10] === 0x42 && // B
    bytes[11] === 0x50 // P
  ) {
    return "WEBP";
  }

  // SVG (XML text)
  const textStart = new TextDecoder().decode(bytes.slice(0, 100));
  if (textStart.includes("<svg")) {
    return "SVG";
  }

  // TIFF
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x49) || // little endian
    (bytes[0] === 0x4d && bytes[1] === 0x4d) // big endian
  ) {
    return "TIFF";
  }

  // PNG
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "PNG";
  }

  // JPEG
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "JPEG";
  }

  // JPEG
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return "GIF";
  }

  return "";
}

export function createDownloadLink(blob: Blob) {
  return URL.createObjectURL(blob);
}

export function truncatedName(imageName: string, truncatedLength = 4) {
  let filename = imageName.split(".")[0];
  if (!filename) return imageName;

  if (filename.length <= truncatedLength) return imageName;

  const nameLength = filename.length;
  return `${imageName.substring(0, truncatedLength)}...${imageName.substring(nameLength - truncatedLength, nameLength)}.${imageName.split(".")[1]}`;
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 Bytes";
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unitIndex = Math.min(i, sizes.length - 1);

  const value = bytes / Math.pow(k, unitIndex);

  return `${parseFloat(value.toFixed(decimals))} ${sizes[unitIndex]}`;
}

export function compareSize(oldSize: number, newSize: number): string {
  if (oldSize === 0) return "N/A";
  return (((newSize - oldSize) / oldSize) * 100).toPrecision(4);
}
