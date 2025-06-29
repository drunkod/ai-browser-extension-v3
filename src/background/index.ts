// Sample code if using extensionpay.com
// import { extPay } from 'src/utils/payment/extPay'
// extPay.startBackground()

chrome.runtime.onInstalled.addListener(async (opt) => {
  // Check if reason is install or update. Eg: opt.reason === 'install' // If extension is installed.
  // opt.reason === 'update' // If extension is updated.
  if (opt.reason === "install") {
    chrome.tabs.create({
      active: true,
      // Open the setup page and append `?type=install` to the URL so frontend
      // can know if we need to show the install page or update page.
      url: chrome.runtime.getURL("src/ui/setup/index.html"),
    })

    return
  }

  if (opt.reason === "update") {
    chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL("src/ui/setup/index.html?type=update"),
    })

    return
  }
})

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

console.info("hello world from background")

// V-- ADD THE FOLLOWING CODE --V

const V2RAY_API_URL = "http://188.166.142.39/servers/list"

// Listen for when a request to our target URL is successfully completed.
chrome.webRequest.onCompleted.addListener(
  (details) => {
    // We only care about successful requests to the exact URL.
    if (details.statusCode === 200 && details.url === V2RAY_API_URL) {
      console.info("V2Ray Updater: Detected a fetch of the server list.")

      // Because we cannot read the response body directly from the listener,
      // we immediately re-fetch the data ourselves to get the content.
      fetch(V2RAY_API_URL)
        .then(response => response.json())
        .then(servers => {
          console.info("V2Ray Updater: New servers captured:", servers)

          // Save the new server list to chrome.storage.local
          chrome.storage.local.set({ serverList: servers }, () => {
            // Create a desktop notification to inform the user.
            chrome.notifications.create({
              type: 'basic',
              iconUrl: chrome.runtime.getURL("src/assets/logo.png"),
              title: 'V2Ray Servers Updated',
              message: `New list with ${servers.length} servers captured. Click the extension icon to update your config.`
            });
          });
        })
        .catch(error => console.error("V2Ray Updater: Error refetching server list:", error));
    }
  },
  { urls: [V2RAY_API_URL] } // This filter ensures our listener only runs for this specific URL.
);

// Optional: Open the popup when the notification is clicked.
chrome.notifications.onClicked.addListener(() => {
    // This API to open the popup programmatically is not available in all browsers.
    // It works in Chrome.
    if (chrome.action.openPopup) {
        chrome.action.openPopup();
    }
});


// ^-- END OF ADDED CODE --^

export {}
