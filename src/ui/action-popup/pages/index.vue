<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useV2rayStore } from '~/stores/v2ray.store' // Corrected import path
import { ref, computed, watch } from 'vue' // <-- Add watch to the import

const v2rayStore = useV2rayStore()
const { serverList, v2rayTemplate } = storeToRefs(v2rayStore)

const selectedServerIndex = ref(0)
const copyButtonText = ref('Copy Config')

// V-- THE BOT'S SUGGESTED IMPROVEMENT --V
// Watch for changes in the server list to prevent out-of-bounds errors.
watch(serverList, (newList) => {
  if (newList && selectedServerIndex.value >= newList.length) {
    // If the new list is shorter and the current index is now invalid,
    // reset the selection to the first server.
    selectedServerIndex.value = 0;
  }
});
// ^-- END OF IMPROVEMENT --^

// A computed property that generates the final config reactively.
const generatedConfig = computed(() => {
  // Guard against missing template or server list
  if (!v2rayTemplate.value || !serverList.value || serverList.value.length === 0) {
    return 'Waiting for server list... or set your template in Options.'
  }

  const server = serverList.value[selectedServerIndex.value]
  if (!server) return 'Error: selected server not found.'

  // Replace placeholders
  return v2rayTemplate.value
    .replace(/"%%HOST%%"/g, `"${server.host}"`) // With quotes for string replacement
    .replace(/%%PORT%%/g, server.port)       // Without quotes for number replacement
})

function copyToClipboard() {
  navigator.clipboard.writeText(generatedConfig.value).then(() => {
    copyButtonText.value = 'Copied!';
    setTimeout(() => { copyButtonText.value = 'Copy Config'; }, 2000);
  });
}
</script>

<template>
  <div class="p-4">
    <h2 class="text-lg font-semibold mb-2">1. Select a Server</h2>
    <USelectMenu
      v-if="serverList.length > 0"
      v-model="selectedServerIndex"
      :options="serverList.map((s, i) => ({ label: `${s.name} (${s.host}:${s.port})`, value: i }))"
      value-attribute="value"
      option-attribute="label"
      class="w-full"
    />
    <p
      v-else
      class="text-sm text-gray-500"
    >
      No server list captured yet. Try using the other VPN extension to trigger an update.
    </p>

    <h2 class="text-lg font-semibold mt-4 mb-2">2. Generated V2Ray Config</h2>
    <UTextarea
      :model-value="generatedConfig"
      :rows="12"
      readonly
      :ui="{ base: 'font-mono text-xs w-full' }"
    />

    <h2 class="text-lg font-semibold mt-4 mb-2">3. Copy to Clipboard</h2>
    <UButton
      block
      size="lg"
      icon="ph:copy-simple-bold"
      @click="copyToClipboard"
    >
      {{ copyButtonText }}
    </UButton>
  </div>
</template>

<style scoped>
/* Optional: Add custom styles if needed */
</style>
