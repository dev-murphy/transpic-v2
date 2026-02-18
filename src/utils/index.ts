export async function detechImageType(file: File | Blob) {
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
    return "webp";
  }

  // SVG (XML text)
  const textStart = new TextDecoder().decode(bytes.slice(0, 100));
  if (textStart.includes("<svg")) {
    return "svg";
  }

  // TIFF
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x49) || // little endian
    (bytes[0] === 0x4d && bytes[1] === 0x4d) // big endian
  ) {
    return "tiff";
  }

  // PNG
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }

  // JPEG
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }

  // JPEG
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return "gif";
  }

  return "unknown";
}

export function createDownloadLink(blob: Blob) {
  return URL.createObjectURL(blob);
}
