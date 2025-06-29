// src/background/index.ts

// The boilerplate's original install/update logic
chrome.runtime.onInstalled.addListener(async (opt) => {
  if (opt.reason === "install") {
    chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL("src/ui/setup/index.html"),
    });
    return;
  }

  if (opt.reason === "update") {
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


// This is the correct, final version of the listener logic
const V2RAY_API_URL = "http://188.166.142.39/servers/list";

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.statusCode === 200 && details.url === V2RAY_API_URL) {
      console.info("V2Ray Updater: Detected a fetch of the server list.");

      fetch(V2RAY_API_URL)
        .then(response => response.json())
        .then(servers => {
          // 1. Data Validation
          if (!Array.isArray(servers)) {
            console.error("V2Ray Updater: API response is not a valid array:", servers);
            return;
          }

          console.info("V2Ray Updater: New servers captured:", servers);

          // Use the correct key to match the Pinia store
          chrome.storage.local.set({ 'v2ray-serverList': servers }, () => {
            // 2. Storage Error Handling
            if (chrome.runtime.lastError) {
              console.error("V2Ray Updater: Error saving server list:", chrome.runtime.lastError);
              return;
            }

            // If successful, notify the user.
            chrome.notifications.create({
              type: 'basic',
              iconUrl: chrome.runtime.getURL("src/assets/logo.png"),
              title: 'V2Ray Servers Updated',
              message: `New list with ${servers.length} servers captured. Click the icon to update your config.`
            });
          });
        })
        .catch(error => {
          // 3. User Feedback on Failure
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

// Open the popup when the notification is clicked.
chrome.notifications.onClicked.addListener(() => {
  if (chrome.action.openPopup) {
    chrome.action.openPopup();
  }
});

export {};

