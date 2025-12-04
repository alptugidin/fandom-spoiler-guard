// Default keywords to hide
const DEFAULT_KEYWORDS = ['Died', 'Status', 'Death'];

// Get keywords from storage or use defaults
async function getKeywords() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['keywords'], (result) => {
      resolve(result.keywords || DEFAULT_KEYWORDS);
    });
  });
}

// Get manually hidden fields from storage
async function getHiddenFields() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['hiddenFields'], (result) => {
      resolve(result.hiddenFields || []);
    });
  });
}

// Save manually hidden field
async function saveHiddenField(fieldLabel) {
  const hiddenFields = await getHiddenFields();
  if (!hiddenFields.includes(fieldLabel)) {
    hiddenFields.push(fieldLabel);
    chrome.storage.sync.set({ hiddenFields });
  }
}

// Check if a label matches any keyword
function matchesKeyword(labelText, keywords) {
  const normalizedLabel = labelText.toLowerCase().trim();
  return keywords.some(keyword => normalizedLabel.includes(keyword.toLowerCase()));
}

// Mark field as safe (not a spoiler)
function markAsSafe(valueElement) {
  if (valueElement.classList.contains('spoiler-safe') ||
      valueElement.classList.contains('spoiler-blur')) return;
  valueElement.classList.add('spoiler-safe');
}

// Mark field as spoiler (keep blurred, add overlay)
function markAsSpoiler(valueElement, labelText) {
  if (valueElement.classList.contains('spoiler-blur') ||
      valueElement.classList.contains('spoiler-revealed')) return;

  const parentItem = valueElement.closest('.pi-item.pi-data');

  valueElement.classList.remove('spoiler-safe');
  valueElement.classList.add('spoiler-blur');
  valueElement.setAttribute('data-spoiler-label', labelText);

  // Add class to parent for positioning
  if (parentItem) {
    parentItem.classList.add('has-spoiler');
  }

  // Create reveal overlay on parent (so it's not blurred)
  const overlay = document.createElement('div');
  overlay.className = 'spoiler-overlay';
  overlay.textContent = 'Click to reveal';
  overlay.addEventListener('click', (e) => {
    e.stopPropagation();
    valueElement.classList.remove('spoiler-blur');
    valueElement.classList.add('spoiler-revealed');
    if (parentItem) {
      parentItem.classList.remove('has-spoiler');
    }
    overlay.remove();
  });

  // Append to parent, not to the blurred element
  if (parentItem) {
    parentItem.appendChild(overlay);
  } else {
    valueElement.appendChild(overlay);
  }
}

// Process portable infobox
async function processInfobox() {
  const keywords = await getKeywords();
  const hiddenFields = await getHiddenFields();
  const allKeywords = [...new Set([...keywords, ...hiddenFields])];

  // Find all portable infoboxes
  const infoboxes = document.querySelectorAll('.portable-infobox');

  infoboxes.forEach(infobox => {
    // Find all data items (rows) in the infobox
    const dataItems = infobox.querySelectorAll('.pi-item.pi-data');

    dataItems.forEach(item => {
      const labelElement = item.querySelector('.pi-data-label');
      const valueElement = item.querySelector('.pi-data-value');

      if (labelElement && valueElement) {
        const labelText = labelElement.textContent.trim();

        if (matchesKeyword(labelText, allKeywords)) {
          // This is a spoiler - keep it blurred and add overlay
          markAsSpoiler(valueElement, labelText);
        } else {
          // This is safe - remove blur
          markAsSafe(valueElement);
        }
      }
    });
  });
}

// Listen for messages from background script (context menu)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'hideField') {
    const selection = window.getSelection();
    const target = selection.anchorNode?.parentElement || document.activeElement;

    // Find the closest pi-data item
    const dataItem = target.closest('.pi-item.pi-data');
    if (dataItem) {
      const labelElement = dataItem.querySelector('.pi-data-label');
      const valueElement = dataItem.querySelector('.pi-data-value');

      if (labelElement && valueElement) {
        const labelText = labelElement.textContent.trim();
        valueElement.classList.remove('spoiler-safe');
        markAsSpoiler(valueElement, labelText);
        saveHiddenField(labelText);
        sendResponse({ success: true });
        return;
      }
    }
    sendResponse({ success: false });
  }
});

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', processInfobox);
} else {
  processInfobox();
}

// Also observe for dynamic content changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      processInfobox();
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// hata veren url
// https://silo.fandom.com/wiki/Wool
// https://bookoftheancestor.fandom.com/wiki/Grey_Sister