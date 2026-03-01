<script lang="ts" setup>
import { breakpointsTailwind } from "@vueuse/core";
import InfoDump from "./common/InfoDump.vue";

const appStore = useAppStore();
// Add mobile screen breaking points
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const dropzoneRef = useTemplateRef("dropzoneRef");
const { open, onChange } = useFileDialog({
  accept: "image/*",
});

onChange(async (files) => {
  if (!files) return;
  appStore.addImages(files);
});

const onDrop = (files: File[] | null) => {
  if (!files) return;
  appStore.addImages(files);
};

const { isOverDropZone } = useDropZone(dropzoneRef, {
  onDrop,
  dataTypes: ["image/jpeg", "image/webp", "image/svg+xml", "image/png"],
  multiple: true,
  preventDefaultForUnhandled: true,
});
</script>

<template>
  <div class="w-screen flex flex-col items-center px-3 mt-4">
    <!-- Info Dump -->
    <InfoDump class="w-full max-w-175 mb-4 mx-auto">
      <div class="text-neutral-500 dark:text-neutral-300">
        <h2
          class="mb-2 text-neutral-900 dark:text-white text-sm md:text-base font-bold"
        >
          Size & Devices Matter
        </h2>

        <p class="text-xs md:text-sm leading-5 md:leading-normal">
          <span class="font-bold">Please Note:</span> That images with larger
          size
          <span
            class="px-1 py-0.75 bg-emerald-500/50 dark:bg-neutral-700 text-neutral-900 dark:text-emerald-500 font-bold rounded"
            >(greater than 1MB)</span
          >
          and
          <span
            class="px-1 py-0.75 bg-emerald-500/50 dark:bg-neutral-700 text-neutral-900 dark:text-emerald-500 font-bold rounded"
            >mobile devices</span
          >
          usually take a longer time to process images.
        </p>
      </div>
    </InfoDump>

    <div
      v-if="!isMobile"
      ref="dropzoneRef"
      class="w-full max-w-175 h-125 flex flex-col items-center justify-center border-4 border-dashed select-none rounded-2xl"
      :class="{
        'bg-neutral-200 dark:bg-neutral-800 border-neutral-400 dark:border-neutral-600':
          !isOverDropZone,
        'bg-emerald-900 border-emerald-600': isOverDropZone,
      }"
    >
      <template v-if="!isOverDropZone">
        <CloudDownload class="w-16 h-16 text-emerald-600" />
        <p
          class="pb-2 text-neutral-400 dark:text-neutral-500 text-lg text-center leading-6"
        >
          <span class="block font-bold text-2xl">Drop your image(s) here </span>
          OR
        </p>
        <button
          type="button"
          @click="() => open()"
          class="bg-emerald-500 dark:bg-neutral-700 hover:brightness-110 active:brightness-90 flex items-center gap-x-1 px-4 py-1.5 text-neutral-800 dark:text-white text-lg rounded-md scale-100 hover:scale-105 active:scale-100 transition-all cursor-pointer"
        >
          Choose Image(s)
        </button>
      </template>
      <template v-else>
        <h2 class="flex items-center gap-x-2 text-3xl text-white">
          <AddImage class="w-7 h-7 text-emerald-400" />
          Drop images here
        </h2>
      </template>
    </div>

    <div v-else class="w-full">
      <p class="text-center dark:text-white pb-2">
        Upload any image(s) you want to convert
      </p>
      <button
        type="button"
        @click="() => open()"
        class="w-full max-w-125 bg-linear-to-b from-emerald-500 to-emerald-700 border border-emerald-500 flex items-center justify-center gap-x-1 py-2 mx-auto text-white rounded-lg inset-shadow-sm inset-shadow-emerald-200"
      >
        <AddImage class="w-5 h-5" />
        Choose Image(s)
      </button>
    </div>
  </div>
</template>
