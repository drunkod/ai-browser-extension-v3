// src/stores/v2ray.store.ts
import { defineStore } from 'pinia'
import { useBrowserLocalStorage } from '~/composables/useBrowserStorage'
import type { V2RayServer } from '~/types/v2ray.types' // <-- 1. IMPORT THE NEW TYPE & Corrected Path

// A sensible default template to help the user get started.
const defaultTemplate = JSON.stringify({
  "inbounds": [
    {
      "port": 10808,
      "protocol": "socks",
      "settings": { "auth": "noauth", "udp": true }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    },
    {
      "protocol": "socks",
      "settings": {
        "servers": [
          {
            "address": "%%HOST%%",
            "port": %%PORT%%
          }
        ]
      },
      "tag": "proxy"
    }
  ],
  "routing": {
    "rules": [
      {
        "type": "field",
        "domain": ["2ip.ru"],
        "outboundTag": "proxy"
      }
    ]
  }
}, null, 2); // The `null, 2` makes the JSON string nicely formatted.


export const useV2rayStore = defineStore("v2ray", () => {
  // We use the boilerplate's own composable to create persistent state.
  // This will store the captured server list.

  // V-- THE SUGGESTED CHANGE --V
  const { data: serverList } = useBrowserLocalStorage<V2RayServer[]>('v2ray-serverList', [])
  // ^-- REPLACED any[] with V2RayServer[] --^

  // This will store the user's V2Ray config template.
  const { data: v2rayTemplate } = useBrowserLocalStorage<string>('v2ray-template', defaultTemplate)

  return {
    serverList,
    v2rayTemplate,
  }
})
