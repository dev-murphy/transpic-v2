<script lang="ts" setup>
import type { Image } from "../types";
import { detechImageType } from "../utils";

const props = defineProps<{ modelValue: Image[] }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: Image[]): void;
}>();

const images = toRef(props.modelValue);
const dropzoneRef = useTemplateRef("dropzoneRef");
const { open, onChange } = useFileDialog({
  accept: "image/*",
});

onChange(async (files) => {
  if (!files) return;

  images.value = [];
  let currentFile: File | null;
  for (let i = 0; i < files?.length; i++) {
    currentFile = files.item(i);
    if (currentFile) {
      const type = await detechImageType(currentFile);
      images.value.push({
        name: currentFile.name,
        size: currentFile.size,
        content: await currentFile.arrayBuffer(),
        type,
        link: "",
        loading: false,
      });
    }
  }

  emit("update:modelValue", images.value);
});

const onDrop = (files: File[] | null) => {
  if (!files) return;

  files.forEach(async (file) => {
    const type = await detechImageType(file);
    images.value?.push({
      name: file.name,
      size: file.size,
      content: await file.arrayBuffer(),
      type,
      link: "",
      loading: false
    });
  });

  emit("update:modelValue", images.value);
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
        <p
          class="pt-1 text-neutral-500 text-lg text-center leading-6 font-bold"
        >
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
