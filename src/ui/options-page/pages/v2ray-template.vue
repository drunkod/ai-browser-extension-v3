<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useV2rayStore } from '@/stores/v2ray.store.ts' // Added .ts extension
import { ref } from 'vue' // Added import for ref

const v2rayStore = useV2rayStore()
const { v2rayTemplate } = storeToRefs(v2rayStore)

const status = ref('')

// The useBrowserLocalStorage composable saves automatically,
// but we can add this function to a button for explicit feedback.
function saveTemplate() {
  // This is technically not needed as the v-model binding will trigger the save,
  // but it's good for UX.
  status.value = 'Template saved successfully!'
  setTimeout(() => { status.value = '' }, 3000)
}
</script>

<template>
  <div>
    <RouterLinkUp />
    <h1 class="text-2xl font-bold mb-2">V2Ray Config Template</h1>
    <p class="mb-4 text-gray-500 dark:text-gray-400">
      Paste your V2Ray config below. Use the placeholders <code>%%HOST%%</code> and <code>%%PORT%%</code>
      where the server address and port should go. The template will be saved automatically as you type.
    </p>

    <UTextarea
      v-model="v2rayTemplate"
      :rows="20"
      placeholder="Enter your V2Ray JSON template here..."
      :ui="{ base: 'font-mono text-xs' }"
    />

    <div class="mt-4">
      <UButton
        icon="ph:floppy-disk"
        @click="saveTemplate"
      >
        Save Template
      </UButton>
      <span
        v-if="status"
        class="ml-4 text-green-500 font-semibold"
      >
        {{ status }}
      </span>
    </div>
  </div>
</template>
