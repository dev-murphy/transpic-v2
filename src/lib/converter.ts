import { initializeImageMagick, ImageMagick } from "@imagemagick/magick-wasm";
import type { Data } from "@/types";

let initPromise: Promise<void> | null = null;

function getInitPromise() {
  if (!initPromise) {
    initPromise = fetch("/magick.wasm")
      .then((res) => res.arrayBuffer())
      .then((wasm) => initializeImageMagick(wasm));
  }
  return initPromise;
}

self.onmessage = async (event: MessageEvent<Data>) => {
  const { id, fileBuffer, format } = event.data;
  await getInitPromise();

  ImageMagick.read(new Uint8Array(fileBuffer), (image) => {
    image.write(format, (output) => {
      self.postMessage({ id, output });
    });
  });
};
