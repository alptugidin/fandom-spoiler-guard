// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'hideSpoiler',
    title: 'Hide this',
    contexts: ['all'],
    documentUrlPatterns: ['*://*.fandom.com/wiki/*']
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'hideSpoiler') {
    chrome.tabs.sendMessage(tab.id, { action: 'hideField' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Could not send message:', chrome.runtime.lastError.message);
      }
    });
  }
});
