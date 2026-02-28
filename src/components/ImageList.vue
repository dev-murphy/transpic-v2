<script lang="ts" setup>
import { breakpointsTailwind } from "@vueuse/core";

import type { Image, FORMATS } from "@/types";
import {
  createDownloadLink,
  detechImageType,
  truncatedName,
  formatBytes,
  compareSize,
} from "@/utils";
import ConverterWorker from "@/lib/converter?worker";
import { SUPPORTED_FORMATS } from "@/constants";

// TODO: move all of the image stuff to pinia store

const props = defineProps<{ modelValue: Image[] }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: Image[]): void;
  (e: "delete", value?: number): void;
}>();

// isMobile check
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

// conversion functionality
const newFiles = ref<{ name: string; size: number }[]>([]);
let converterWorker = new ConverterWorker();

function convertInWorker(index: number, buffer: ArrayBuffer, format: string) {
  converterWorker.postMessage({
    id: index,
    fileBuffer: buffer,
    format,
  });

  converterWorker.addEventListener("message", (event) => {
    let index = event.data.id;
    if (props.modelValue[index]) {
      const blob = new Blob([event.data.output], {
        type: `image/${format.toLowerCase()}`,
      });
      newFiles.value[index] = {
        size: blob.size,
        name: `${props.modelValue[index].name.split(".")[0]}.${format.toLowerCase()}`,
      };

      props.modelValue[index].link = createDownloadLink(blob);
      props.modelValue[index].loading = false;
    }
  });
}

function convertImages() {
  for (let i = 0; i <= props.modelValue.length; i++) {
    const currentImage = props.modelValue[i];
    if (currentImage) {
      currentImage.loading = true;
      convertInWorker(i, currentImage.content, currentImage.toFormat);
    }
  }
}

// global format
const globalFormat = ref<FORMATS>("");
const formatToHide = computed(() => [
  ...new Set(props.modelValue.map((i) => i.type)),
]);

const hasGlobalFormat = computed(() =>
  props.modelValue.every((i) => i.toFormat === props.modelValue[0]?.toFormat),
);

watch(hasGlobalFormat, (value) => {
  if (!value) {
    globalFormat.value = "";
  } else {
    globalFormat.value = props.modelValue[0]!.toFormat;
  }
});

function setGlobalFormat(format: FORMATS) {
  const newImages = props.modelValue.map((image) => {
    return {
      ...image,
      toFormat: format,
    };
  });

  globalFormat.value = format;
  emit("update:modelValue", newImages);
}

// computed props
const hasImageFormats = computed(() =>
  props.modelValue.every((i) => i.toFormat !== ""),
);

const hasDownloadLinks = computed(() => props.modelValue.every((i) => i.link));

// file handling
const { open, onChange } = useFileDialog({
  accept: "image/*",
});

onChange(async (files) => {
  if (!files) return;

  let images = props.modelValue;
  let currentFile: File | null;

  for (let i = 0; i < files?.length; i++) {
    currentFile = files.item(i);

    if (currentFile) {
      const type = await detechImageType(currentFile);
      images.push({
        name: currentFile.name,
        size: currentFile.size,
        content: await currentFile.arrayBuffer(),
        link: "",
        toFormat: "",
        loading: false,
        type,
      });
    }
  }

  emit("update:modelValue", images);
});

function downloadAll() {
  props.modelValue.forEach((image, index) => {
    if (!image.link) return;

    const a = document.createElement("a");
    a.href = image.link;
    a.download = newFiles.value[index]!.name;
    a.click();
  });
}
</script>

<template>
  <!-- TODO: add a disclaimer that conversions will be slower to mobile apps -->
  <div class="w-full max-w-175 mt-10 text-neutral-800 dark:text-white">
    <button
      v-if="!hasDownloadLinks"
      class="flex items-center gap-x-0.5 bg-emerald-400 hover:brightness-120 px-2 py-1 text-sm md:text-base text-neutral-900 font-bold cursor-pointer rounded-t-md"
      @click="() => open()"
    >
      <Plus v-if="!isMobile" class="w-5 h-5" />
      Add More Images
    </button>

    <div class="bg-neutral-200 dark:bg-neutral-800">
      <div
        v-for="(image, index) in modelValue"
        :key="index"
        class="flex items-center justify-between py-1.5 px-2"
        :class="{
          'bg-neutral-200 dark:bg-neutral-700': index % 2 === 0,
          'bg-neutral-300 dark:bg-neutral-800': index % 2 !== 0,
        }"
      >
        <div class="flex flex-col text-base md:text-lg">
          <p class="font-mono">
            <span v-if="!hasDownloadLinks">
              {{ truncatedName(image.name, isMobile ? 6 : 10) }}
            </span>
            <span v-else-if="newFiles[index]">
              {{ truncatedName(newFiles[index].name, isMobile ? 6 : 10) }}
            </span>
          </p>
          <p class="text-xs md:text-sm text-neutral-600 dark:text-neutral-400">
            {{ formatBytes(image.size) }}
            <span
              v-if="newFiles[index]"
              class="font-bold"
              :class="{
                'text-red-500':
                  compareSize(image.size, newFiles[index].size).charAt(0) !==
                  '-',
                'text-green-600':
                  compareSize(image.size, newFiles[index].size).charAt(0) ===
                  '-',
              }"
            >
              ({{ compareSize(image.size, newFiles[index].size)
              }}{{
                compareSize(image.size, newFiles[index].size) !== "N/A"
                  ? "%"
                  : ""
              }})
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
          :options="SUPPORTED_FORMATS"
          :hide="[image.type]"
          class="ml-auto mr-1"
        />

        <!-- Buttons -->
        <div v-if="!image.loading" class="flex items-center">
          <a
            v-if="image.link"
            :href="image.link"
            :download="`${image.name.split('.')[0]}.${image.type === 'webp' ? 'png' : 'webp'}`"
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
            @click="$emit('delete', index)"
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
        {{ hasDownloadLinks ? "Converted" : "Added" }}
        {{ modelValue.length }} files
        <span v-if="!hasDownloadLinks" class="hidden md:inline"
          >| Convert to:
        </span>
      </p>

      <TypeSelect
        v-if="!hasDownloadLinks"
        :model-value="globalFormat"
        @update:model-value="
          (value) => {
            setGlobalFormat(value as FORMATS);
          }
        "
        :options="SUPPORTED_FORMATS"
        :hide="formatToHide"
        class="ml-2 mr-auto"
      />

      <div class="flex items-center gap-x-2 mr-0.5">
        <button
          v-if="!hasDownloadLinks"
          class="px-3 py-1.5 bg-emerald-400 disabled:bg-emerald-700 hover:brightness-120 text-xs md:text-sm text-neutral-900 disabled:text-emerald-900 font-bold uppercase tracking-wide cursor-pointer rounded-md disabled:cursor-not-allowed"
          :disabled="!hasImageFormats"
          @click="convertImages"
        >
          Convert
        </button>

        <button
          v-else
          class="px-3 py-1.5 bg-emerald-400 disabled:bg-emerald-700 hover:brightness-120 text-xs md:text-sm text-neutral-900 disabled:text-emerald-900 font-bold uppercase tracking-wide cursor-pointer rounded-md disabled:cursor-not-allowed"
          :disabled="!hasImageFormats"
          @click="downloadAll"
        >
          Download
        </button>

        <button
          class="group p-1 hover:bg-red-500/10 dark:hover:bg-neutral-900 rounded-md cursor-pointer"
          @click="$emit('delete')"
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
