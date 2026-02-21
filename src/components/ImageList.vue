<script lang="ts" setup>
import type { Image } from "@/types";
import { createDownloadLink, detechImageType } from "@/utils";
import ConverterWorker from "@/lib/converter?worker";

const props = defineProps<{ modelValue: Image[] }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: Image[]): void;
  (e: "delete", value?: number): void;
}>();

const truncatedName = (imageName: string, truncatedLength = 4) => {
  let filename = imageName.split(".")[0];
  if (!filename) return imageName;

  if (filename.length <= truncatedLength) return imageName;

  const nameLength = filename.length;
  return `${imageName.substring(0, truncatedLength)}...${imageName.substring(nameLength - truncatedLength, nameLength)}.${imageName.split(".")[1]}`;
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 Bytes";
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unitIndex = Math.min(i, sizes.length - 1);

  const value = bytes / Math.pow(k, unitIndex);

  return `${parseFloat(value.toFixed(decimals))} ${sizes[unitIndex]}`;
};

const newFiles = ref<{ name: string; size: number }[]>([]);
let converterWorker = new ConverterWorker();

function convertInWorker(index: number, buffer: ArrayBuffer, format: string) {
  console.log(format);
  converterWorker.postMessage({
    id: index,
    fileBuffer: buffer,
    format,
  });

  converterWorker.addEventListener("message", (event) => {
    let index = event.data.id;
    if (props.modelValue[index]) {
      const blob = new Blob([event.data.output], { type: `image/${format}` });
      newFiles.value[index] = {
        size: blob.size,
        name: `${props.modelValue[index].name.split(".")[0]}.${format}`,
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
      const desiredFormat = currentImage.type === "webp" ? "png" : "webp";
      convertInWorker(i, currentImage.content, desiredFormat);
    }
  }
}

function compareSize(oldSize: number, newSize: number): string {
  if (oldSize === 0) return "N/A";
  return (((newSize - oldSize) / oldSize) * 100).toFixed(2);
}

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
        type,
        link: "",
        loading: false,
      });
    }
  }

  emit("update:modelValue", images);
});
</script>

<template>
  <div class="mt-10 text-neutral-800 dark:text-white">
    <button
      class="flex items-center gap-x-0.5 bg-emerald-400 hover:brightness-120 text-neutral-900 font-bold px-2 py-1 cursor-pointer rounded-t-md"
      @click="() => open()"
    >
      <Plus class="w-5 h-5" />
      Add More Images
    </button>

    <div class="h-[500px] bg-neutral-200 dark:bg-neutral-800 overflow-y-auto">
      <div
        v-for="(image, index) in props.modelValue"
        :key="index"
        class="w-[700px] flex items-center justify-between py-1.5 px-2"
        :class="{
          'bg-neutral-200 dark:bg-neutral-700': index % 2 === 0,
          'bg-neutral-300 dark:bg-neutral-800': index % 2 !== 0,
        }"
      >
        <div class="flex flex-col text-lg">
          <p class="font-mono">{{ truncatedName(image.name, 10) }}</p>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
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

        <div
          v-else-if="!image.link"
          class="flex items-center gap-x-0.5 ml-auto mr-3 text-sm font-bold text-neutral-900"
        >
          <span
            class="px-1 py-0.5 bg-neutral-600 dark:bg-emerald-400 text-emerald-400 dark:text-neutral-900 uppercase rounded-lg select-none pointer-events-none"
            >{{ image.type }}</span
          >
          <ArrowRight class="w-5 h-5 text-neutral-800 dark:text-neutral-50" />
          <button
            class="px-1 py-0.5 bg-neutral-600 dark:bg-emerald-400 text-emerald-400 dark:text-neutral-900 hover:brightness-120 hover:scale-105 transition-all rounded-lg cursor-pointer"
          >
            {{ image.type === "webp" ? "PNG" : "WEBP" }}
          </button>
        </div>

        <!-- Buttons -->
        <div class="flex items-center">
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
            class="group w-7 h-7 grid place-items-center hover:bg-red-500/10 dark:hover:bg-neutral-900 rounded-md cursor-pointer"
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
      <p>Added {{ modelValue.length }} files</p>

      <div class="flex items-center gap-x-2 mr-0.5">
        <button
          class="px-3 py-1.5 bg-emerald-400 hover:brightness-120 text-sm text-neutral-900 font-bold uppercase tracking-wide cursor-pointer rounded-md"
          @click="convertImages"
        >
          Convert
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
