<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: Readonly<string[]>;
    position?: "top" | "bottom";
    hide?: string[];
  }>(),
  {
    position: "bottom",
  },
);
defineEmits<{ (e: "update:modelValue", value: string): void }>();

const filteredOptions = computed(() => {
  let options = props.options;
  const hideOptions = props.hide;

  if (hideOptions) {
    options = options.filter(
      (item) => !hideOptions.includes(item.toLowerCase()),
    );
  }

  return options;
});

const isDropdownOpen = ref(false);
const dropdownRef = useTemplateRef("dropdownRef");
onClickOutside(dropdownRef, () => {
  isDropdownOpen.value = false;
});
</script>

<template>
  <div ref="dropdownRef" class="relative w-min">
    <button
      @click="
        () => {
          isDropdownOpen = !isDropdownOpen;
        }
      "
      class="bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-500 flex items-center gap-x-1 py-1 pl-3 pr-1 text-sm text-neutral-600 dark:text-white rounded-md"
    >
      {{ !modelValue ? "..." : modelValue }}
      <ChevronDown
        class="w-4.5 h-4.5 text-neutral-400 transition-transform pointer-events-none"
        :class="{
          'rotate-180': isDropdownOpen,
        }"
      />
    </button>

    <Transition>
      <div
        v-show="isDropdownOpen"
        ref="dropdown"
        class="absolute left-1/2 -translate-x-1/2 z-10 before:cotent-[''] before:absolute before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent"
        :class="{
          ' top-full translate-y-2 before:bottom-full before:translate-y-px before:border-b-neutral-400 dark:before:border-b-neutral-500':
            position === 'bottom',
          'bottom-full -translate-y-2 before:top-full before:-translate-y-px before:border-t-neutral-100 before:dark:border-t-neutral-500':
            position === 'top',
        }"
      >
        <div
          class="relative bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-500 divide-y divide-neutral-300 dark:divide-neutral-700 overflow-hidden rounded-md shadow-md"
        >
          <div class="w-18 text-center" @click="$emit('update:modelValue', '')">
            ...
          </div>
          <div
            v-for="option in filteredOptions"
            :key="option"
            class="w-18 py-1 text-sm text-center select-none"
            @click="$emit('update:modelValue', option)"
          >
            {{ option }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
