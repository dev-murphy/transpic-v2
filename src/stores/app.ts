import { defineStore } from "pinia";

import { detectImageType, compareSize } from "@/utils";
import type {  Image, ImageFormat } from "@/types";

export const useAppStore = defineStore("app", {
  state: () => ({
    isDarkMode: true,
    images: [] as Image[],
    format: "" as ImageFormat | "",
  }),
  getters: {
    noOfImages: (state) => state.images.length,
    formatToHide: (state) => [...new Set(state.images.map((i) => i.type))],
    hasImageFormats: (state) => state.images.every((i) => i.toFormat !== ""),
    hasDownloadLinks: (state) => state.images.every((i) => i.link),
    hasGlobalFormat: (state) =>
      state.images.every((i) => i.toFormat === state.images[0]?.toFormat),
  },
  actions: {
    async addImages(files: FileList | File[]) {
      let image: File | undefined | null;
      for (let i = 0; i < files.length; i++) {
        if ("item" in files) {
          image = files.item(i);
        } else {
          image = files[i];
        }
        if (image) {
          const type = await detectImageType(image);
          this.images.push({
            name: image.name,
            size: image.size,
            content: await image.arrayBuffer(),
            link: "",
            toFormat: "",
            loading: false,
            type,
          });
        }
      }
    },
    deleteImage(id?: number) {
      if (id === undefined) {
        this.images = [];
      } else {
        this.images = this.images.filter((_, i) => i !== id);
      }
    },
    sizeDiff(index: number) {
      const image = this.images[index];

      if(!image || !image.convertedSize) return 'N/A';
      return compareSize(image.size, image.convertedSize)
    },
    downloadAll() {
      this.images.forEach((image) => {
        if (!image.link) return;

        const a = document.createElement("a");
        a.href = image.link;
        a.download = ""; //name;
        a.click();
      });
    },
    setGlobalFormat(format: ImageFormat) {
      this.images.forEach(i => i.toFormat = format);
      this.format = format;
    }
  },
});
