// src/stores/v2ray.store.ts
import { defineStore } from 'pinia'
import { useBrowserLocalStorage } from '~/composables/useBrowserStorage'
import type { V2RayServer } from '~/types/v2ray.types'
import { STORAGE_KEYS } from '~/utils/constants' // <-- 1. IMPORT THE CONSTANTS & Corrected Path

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
            "port": "%%PORT%%"
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

  // 2. USE THE CONSTANTS INSTEAD OF MAGIC STRINGS
  const { data: serverList } = useBrowserLocalStorage<V2RayServer[]>(
    STORAGE_KEYS.SERVER_LIST, // <-- Use constant
    []
  )

  const { data: v2rayTemplate } = useBrowserLocalStorage<string>(
    STORAGE_KEYS.TEMPLATE, // <-- Use constant
    defaultTemplate
  )

  return {
    serverList,
    v2rayTemplate,
  }
})
