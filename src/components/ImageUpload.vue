<script lang="ts" setup>
import type { Image } from "../../types";
import { useFileDialog } from "@vueuse/core";

const images = ref<Image[]>([]);
const dropzoneRef = useTemplateRef("dropzoneRef");
const { open, onChange } = useFileDialog({
  accept: "image/*",
});

onChange((files) => {
  if (!files) return;

  images.value = [];
  let currentFile;
  for (let i = 0; i < files?.length; i++) {
    currentFile = files.item(i);

    if (currentFile) {
      images.value.push({
        name: currentFile.name,
        size: currentFile.size,
      });
    }
  }
});

const onDrop = (files: File[] | null) => {
  if (!files) return;

  files.forEach((file) => {
    images.value?.push({
      name: file.name,
      size: file.size,
    });
  });
};

const { isOverDropZone } = useDropZone(dropzoneRef, {
  onDrop,
  dataTypes: ["image/jpeg", "image/webp", "image/svg+xml", "image/png"],
  multiple: true,
  preventDefaultForUnhandled: true,
});
</script>

<template>
  <div class="w-screen flex flex-col items-center px-3">
    <h1 class="text-4xl text-white font-bold">
      Transpic - Image Converter & Compresser
    </h1>

    <p class="max-w-[600px] mt-2 text-xl text-neutral-500">
      A convenient way of converting and compressing all of your images. This
      app is 🚧<span class="font-bold">UNDER CONSTRUCTION</span>🚧.
    </p>

    <div
      ref="dropzoneRef"
      class="w-full max-w-[700px] h-[500px] flex flex-col items-center justify-center border-4 border-dashed mt-10 select-none rounded-2xl"
      :class="{
        'bg-neutral-800 border-neutral-600': !isOverDropZone,
        'bg-emerald-900 border-emerald-600': isOverDropZone,
      }"
    >
      <template v-if="!isOverDropZone">
        <button
          type="button"
          @click="() => open()"
          class="bg-neutral-700 hover:brightness-110 active:brightness-90 flex items-center gap-x-1 px-4 py-2 text-white text-lg rounded-md scale-100 hover:scale-105 active:scale-100 transition-all cursor-pointer"
        >
          <AddImage class="w-5 h-5 text-emerald-500" />
          Choose Image(s)
        </button>
        <p class="pt-1 text-neutral-500 text-lg leading-6 font-bold">
          OR
          <span class="block">Drop your images here </span>
        </p>
      </template>
      <template v-else>
        <h2 class="flex items-center gap-x-2 text-3xl text-white">
          <AddImage class="w-7 h-7 text-emerald-400" />
          Drop images here
        </h2>
      </template>
    </div>
  </div>
</template>
