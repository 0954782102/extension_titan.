// AirHrome Background Service Worker
// Handles chrome:// navigation for History, Downloads, Bookmarks

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'openTab') {
    chrome.tabs.create({ url: msg.url });
    sendResponse({ ok: true });
  }
});