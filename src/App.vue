<script setup lang="ts">
import type { Image } from "./types";

// Theme controls
const appStore = useAppStore();
const mode = useColorMode();
appStore.isDarkMode = mode.value === "dark";

watch(
  () => appStore.isDarkMode,
  (darkMode) => {
    mode.value = darkMode ? "dark" : "light";
  },
);

const images = ref<Image[]>([]);

const deleteImage = (id?: number) => {
  if (id === undefined) {
    images.value = [];
  } else {
    images.value = images.value.filter((_, index) => index !== id);
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-neutral-900 flex flex-col items-center justify-center"
  >
    <TheemToggle v-model="appStore.isDarkMode" />
    <TheHeading />
    <ImageUpload v-if="images.length === 0" v-model="images" />
    <ImageList v-else v-model="images" @delete="deleteImage" />

    <p class="mt-auto mb-3 text-sm text-neutral-400">
      Copyright ©{{ new Date().getFullYear() }} Transpic v2 | All rights
      reserved | Made with ❤️ by
      <a
        href="https://github.com/dev-murphy"
        target="_blank"
        class="hover:text-emerald-500 underline"
        >Murphy Facey (Dev)</a
      >
    </p>
  </div>
</template>
