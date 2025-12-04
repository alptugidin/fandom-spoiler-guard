const DEFAULT_KEYWORDS = ['Died', 'Status', 'Death'];

const keywordListEl = document.getElementById('keywordList');
const addForm = document.getElementById('addForm');
const newKeywordInput = document.getElementById('newKeyword');

// Load keywords from storage
async function loadKeywords() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['keywords'], (result) => {
      resolve(result.keywords || DEFAULT_KEYWORDS);
    });
  });
}

// Save keywords to storage
async function saveKeywords(keywords) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ keywords }, resolve);
  });
}

// Render keyword list
async function renderKeywords() {
  const keywords = await loadKeywords();

  if (keywords.length === 0) {
    keywordListEl.innerHTML = '<div class="empty-state">No keywords added</div>';
    return;
  }

  keywordListEl.innerHTML = keywords.map((keyword, index) => `
    <div class="keyword-item">
      <span class="keyword-text">${escapeHtml(keyword)}</span>
      <button class="keyword-delete" data-index="${index}" title="Remove">&times;</button>
    </div>
  `).join('');

  // Add delete handlers
  keywordListEl.querySelectorAll('.keyword-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const index = parseInt(btn.dataset.index);
      const keywords = await loadKeywords();
      keywords.splice(index, 1);
      await saveKeywords(keywords);
      renderKeywords();
    });
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Handle add form submit
addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const keyword = newKeywordInput.value.trim();

  if (!keyword) return;

  const keywords = await loadKeywords();

  // Check for duplicates
  if (keywords.some(k => k.toLowerCase() === keyword.toLowerCase())) {
    newKeywordInput.value = '';
    return;
  }

  keywords.push(keyword);
  await saveKeywords(keywords);
  newKeywordInput.value = '';
  renderKeywords();
});

// Initial render
renderKeywords();
