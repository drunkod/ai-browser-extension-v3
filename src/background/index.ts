// src/background/index.ts

import { STORAGE_KEYS } from '../utils/constants';

// ... (The onInstalled and onerror code remains the same) ...
chrome.runtime.onInstalled.addListener(async (opt) => { /* ... */ });
self.onerror = function (message, source, lineno, colno, error) { /* ... */ };
console.info("hello world from background");


// V-- THE FIX IS APPLIED HERE --V

const V2RAY_API_URL = "http://188.166.142.39/servers/list";
// 1. Get our own extension's ID so we can identify requests made by ourselves.
const selfExtensionId = chrome.runtime.id;

chrome.webRequest.onCompleted.addListener(
  (details) => {
    // 2. Add a "guard clause" to break the loop.
    // If the request was initiated by our own extension, ignore it and exit.
    if (details.initiator === `chrome-extension://${selfExtensionId}`) {
      return;
    }

    if (details.statusCode === 200 && details.url === V2RAY_API_URL) {
      console.info("V2Ray Updater: Detected a fetch of the server list from an external source.");

      fetch(V2RAY_API_URL)
        .then(response => response.json())
        .then(servers => {
          if (!Array.isArray(servers)) {
            console.error("V2Ray Updater: API response is not a valid array:", servers);
            return;
          }

          console.info("V2Ray Updater: New servers captured:", servers);

          chrome.storage.local.set({ [STORAGE_KEYS.SERVER_LIST]: servers }, () => {
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

export {};