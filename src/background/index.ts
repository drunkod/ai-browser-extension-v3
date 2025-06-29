// src/background/index.ts
import { STORAGE_KEYS } from '../utils/constants'; // <-- 1. IMPORT THE CONSTANTS & Corrected Path

// The boilerplate's original install/update logic
chrome.runtime.onInstalled.addListener(async (opt) => {
  if (opt.reason === "install") {
    chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL("src/ui/setup/index.html"),
    });
    return;
  }

  if (opt.reason === "update") { // Added missing update logic from previous versions
    chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL("src/ui/setup/index.html?type=update"),
    });
    return;
  }
});

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message, source, lineno, colno, error);
};

console.info("hello world from background");


// V-- FINAL, ROBUST, AND FUNCTIONALLY CORRECT VERSION --V

const V2RAY_API_URL = "http://188.166.142.39/servers/list";

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.statusCode === 200 && details.url === V2RAY_API_URL) {
      console.info("V2Ray Updater: Detected a fetch of the server list.");

      fetch(V2RAY_API_URL)
        .then(response => response.json())
        .then(servers => {
          if (!Array.isArray(servers)) {
            console.error("V2Ray Updater: API response is not a valid array:", servers);
            return;
          }

          console.info("V2Ray Updater: New servers captured:", servers);

          // V-- THE CRITICAL FIX IS HERE --V
          // Use the key 'v2ray-serverList' to match the Pinia store.
          // Note the quotes around the key are necessary because of the hyphen.
          // 2. USE THE CONSTANT INSTEAD OF A MAGIC STRING
          chrome.storage.local.set({ [STORAGE_KEYS.SERVER_LIST]: servers }, () => {
          // Note: The square brackets `[]` are used to set a dynamic key in an object literal.
            if (chrome.runtime.lastError) {
              console.error("V2Ray Updater: Error saving server list:", chrome.runtime.lastError);
              return;
            }

            chrome.notifications.create({
              type: 'basic',
              iconUrl: chrome.runtime.getURL("src/assets/logo.png"),
              title: 'V2Ray Servers Updated',
              message: `New list with ${servers.length} servers captured. Click the icon to update your config.`
            });
          });
        })
        .catch(error => {
          console.error("V2Ray Updater: Error refetching server list:", error);
          chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL("src/assets/logo.png"),
            title: 'V2Ray Update Failed',
            message: 'Could not fetch the latest server list. Check your connection or the proxy API may be down.'
          });
        });
    }
  },
  { urls: [V2RAY_API_URL] }
);

chrome.notifications.onClicked.addListener(() => {
  if (chrome.action.openPopup) {
    chrome.action.openPopup();
  }
});

// ^-- END OF MODIFIED LOGIC --^


export {};
