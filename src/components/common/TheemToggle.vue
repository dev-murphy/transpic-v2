<script lang="ts" setup>
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: "update:modelValue", value: boolean): void }>();

const button = useTemplateRef("button");
const thumb = useTemplateRef("thumb");
const thumbTravel = ref(0);

function toggle() {
  if (!button.value || !thumb.value) return;
  thumbTravel.value = button.value.clientWidth - thumb.value.clientWidth - 8;
  emit("update:modelValue", !props.modelValue);
}

onMounted(() => {
  if (!button.value || !thumb.value) return;
  thumbTravel.value = button.value.clientWidth - thumb.value.clientWidth - 8;
});
</script>

<template>
  <button
    ref="button"
    role="switch"
    :aria-checked="modelValue"
    class="theme-transition absolute top-4 right-4 w-14 p-1 border-2 inline-flex items-center rounded-full cursor-pointer bg-neutral-200 border-neutral-400 hover:bg-neutral-300 hover:border-neutral-500 dark:bg-neutral-800 dark:border-neutral-600 dark:hover:bg-neutral-700 dark:hover:border-neutral-500"
    @click="toggle"
  >
    <span
      ref="thumb"
      :style="{ transform: `translateX(${modelValue ? thumbTravel : 0}px)` }"
      class="thumb-transition custom-shadow w-5 aspect-square inline-flex items-center justify-center rounded-full bg-neutral-50 dark:bg-neutral-950"
    >
      <Sun v-if="!modelValue" class="w-3 h-3" />
      <Moon v-else class="w-3.5 h-3.5 text-white" />
    </span>
  </button>
</template>

<style scoped>
.custom-shadow {
  box-shadow: 0px 0px 7px -1px rgba(0, 0, 0, 0.3);
}
</style>
