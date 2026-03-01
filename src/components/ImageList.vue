<script lang="ts" setup>
import { breakpointsTailwind } from "@vueuse/core";

import { createDownloadLink, truncatedName, formatBytes } from "@/utils";
import ConverterWorker from "@/lib/converter?worker";
import type { ImageFormat } from "@/types";
import { ImageFormats } from "@/constants";

const appStore = useAppStore();

// isMobile check
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

// conversion functionality
let converterWorker = new ConverterWorker();

function convertInWorker(
  index: number,
  buffer: ArrayBuffer,
  format: Omit<ImageFormat, "">,
) {
  converterWorker.postMessage({
    id: index,
    fileBuffer: buffer,
    format,
  });

  converterWorker.addEventListener("message", (event) => {
    let index = event.data.id;

    if (appStore.images[index]) {
      const type = ImageFormats.find((i) => i.format === format)?.type;
      const blob = new Blob([event.data.output], { type });

      appStore.images[index].convertedName =
        `${appStore.images[index].name.split(".")[0]}.${format.toLowerCase()}`;
      appStore.images[index].convertedSize = blob.size;
      appStore.images[index].link = createDownloadLink(blob);
      appStore.images[index].loading = false;
    }
  });
}

function convertImages() {
  for (let i = 0; i <= appStore.images.length; i++) {
    const currentImage = appStore.images[i];
    if (currentImage) {
      currentImage.loading = true;
      convertInWorker(i, currentImage.content, currentImage.toFormat);
    }
  }
}

watch(
  () => appStore.hasGlobalFormat,
  (value) => {
    if (!value) {
      appStore.format = "";
    } else {
      appStore.format = appStore.images[0]!.toFormat;
    }
  },
);

// file handling
const { open, onChange } = useFileDialog({
  accept: "image/*",
});

onChange(async (files) => {
  if (!files) return;

  appStore.addImages(files);
});
</script>

<template>
  <div class="w-full max-w-175 mt-10 text-neutral-800 dark:text-white">
    <button
      v-if="!appStore.hasDownloadLinks"
      class="flex items-center gap-x-0.5 bg-emerald-400 hover:brightness-120 px-2 py-1 text-sm md:text-base text-neutral-900 font-bold cursor-pointer rounded-t-md"
      @click="() => open()"
    >
      <Plus v-if="!isMobile" class="w-5 h-5" />
      Add More Images
    </button>

    <div class="bg-neutral-200 dark:bg-neutral-800">
      <div
        v-for="(image, index) in appStore.images"
        :key="index"
        class="flex items-center justify-between py-1.5 px-2"
        :class="{
          'bg-neutral-200 dark:bg-neutral-700': index % 2 === 0,
          'bg-neutral-300 dark:bg-neutral-800': index % 2 !== 0,
        }"
      >
        <div class="flex flex-col text-base md:text-lg">
          <p class="font-mono">
            <span v-if="!appStore.hasDownloadLinks">
              {{ truncatedName(image.name, isMobile ? 6 : 10) }}
            </span>
            <span v-else-if="image.convertedName">
              {{ truncatedName(image.convertedName, isMobile ? 6 : 10) }}
            </span>
          </p>
          <p class="text-xs md:text-sm text-neutral-600 dark:text-neutral-400">
            {{ formatBytes(image.size) }}
            <span
              v-if="image.convertedSize"
              class="font-bold"
              :class="{
                'text-red-500': appStore.sizeDiff(index)[0] !== '-',
                'text-green-600': appStore.sizeDiff(index)[0] === '-',
              }"
            >
              ({{ appStore.sizeDiff(index)[0]
              }}<span v-if="appStore.sizeDiff(index)[0] !== 'N/A'">%</span>)
            </span>
          </p>
        </div>

        <button
          v-if="image.loading"
          class="barber-sign w-40 h-6 text-neutral-900 font-bold rounded-lg select-none ml-auto"
        >
          <p class="text-sm">LOADING</p>
        </button>

        <TypeSelect
          v-else-if="!image.link"
          v-model="image.toFormat"
          :hide="[image.type]"
          class="ml-auto mr-1"
        />

        <!-- Buttons -->
        <div v-if="!image.loading" class="flex items-center">
          <a
            v-if="image.link && image.convertedName"
            :href="image.link"
            :download="image.convertedName"
            class="group w-7 h-7 grid place-items-center hover:bg-blue-500/10 dark:hover:bg-neutral-900 rounded-md cursor-pointer"
          >
            <Download class="w-5 h-5 group-hover:text-blue-500" />
          </a>
          <!-- <button
            class="group w-7 h-7 grid place-items-center hover:bg-neutral-900 rounded-md cursor-pointer"
          >
            <Copy class="w-5 h-5 group-hover:text-blue-500" />
          </button> -->
          <button
            class="group w-7 h-7 grid place-items-center hover:bg-red-500/10 dark:hover:bg-neutral-900/50 rounded-md cursor-pointer"
            @click="appStore.deleteImage(index)"
          >
            <Close class="w-5 h-5 group-hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
    <div
      class="bg-neutral-300 dark:bg-neutral-600 flex items-center justify-between py-3 px-2"
    >
      <p class="text-sm md:text-base">
        {{ appStore.hasDownloadLinks ? "Converted" : "Added" }}
        {{ appStore.noOfImages }} files
        <span v-if="!appStore.hasDownloadLinks" class="hidden md:inline"
          >| Convert to:
        </span>
      </p>

      <TypeSelect
        v-if="!appStore.hasDownloadLinks"
        :model-value="appStore.format"
        @update:model-value="appStore.setGlobalFormat"
        :hide="appStore.formatToHide"
        position="top"
        class="ml-2 mr-auto"
      />

      <div class="flex items-center gap-x-2 mr-0.5">
        <button
          v-if="!appStore.hasDownloadLinks"
          class="px-3 py-1.5 bg-emerald-400 disabled:bg-emerald-700 hover:brightness-120 text-xs md:text-sm text-neutral-900 disabled:text-emerald-900 font-bold uppercase tracking-wide cursor-pointer rounded-md disabled:cursor-not-allowed"
          :disabled="!appStore.hasImageFormats"
          @click="convertImages"
        >
          Convert
        </button>

        <button
          v-else
          class="px-3 py-1.5 bg-emerald-400 disabled:bg-emerald-700 hover:brightness-120 text-xs md:text-sm text-neutral-900 disabled:text-emerald-900 font-bold uppercase tracking-wide cursor-pointer rounded-md disabled:cursor-not-allowed"
          :disabled="!appStore.hasImageFormats"
          @click="appStore.downloadAll"
        >
          Download
        </button>

        <button
          class="group p-1 hover:bg-red-500/10 dark:hover:bg-neutral-900 rounded-md cursor-pointer"
          @click="appStore.deleteImage()"
        >
          <Close class="w-5 h-5 group-hover:text-red-500" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.barber-sign {
  background-image: repeating-linear-gradient(
    -45deg,
    #e9c46a,
    #e9c46a 1rem,
    #e76f51 1rem,
    #e76f51 2rem
  );
  background-size: 200% 200%;
  /* background-position: 98% 100%; */
  animation: barberpole 5s linear infinite;
}

@keyframes barberpole {
  100% {
    background-position: 98% 100%;
  }
}
</style>
