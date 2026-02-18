import { initializeImageMagick, ImageMagick } from "@imagemagick/magick-wasm";
import type { Data } from "../types";

let initialized = false;

self.onmessage = async (event: MessageEvent<Data>) => {
  const { fileBuffer, format } = event.data;

  if (!initialized) {
    const res = await fetch("/magick.wasm");
    const wasm = await res.arrayBuffer();
    await initializeImageMagick(wasm);
    initialized = true;
  }

  ImageMagick.read(new Uint8Array(fileBuffer), (image) => {
    image.write(format, (output) => {
      self.postMessage({ output });
    });
  });
};
