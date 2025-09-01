// Swezzy Maven CMS.js - Optimized and Robust

const CMS = {
  SHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnShLpqdGMWEby1DreBaPnqrX7gT3h1S9fcsug7vJCpSjdyb_k5hmZwaT91vvP5RiuW0d6ArbB5ATf/pub?output=csv",
  CACHE_KEY: 'swezzy_posts_cache',
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
  FALLBACK_POSTS: [
    {
      id: '1',
      title: 'Welcome to Swezzy Maven',
      excerpt: 'Your green carpet to entertainment starts here.',
      content: 'Loading content...',
      img: 'images/blog_pics/cover.jpeg',
      tag: 'Welcome',
      date: '2025-08-28',
      featured: 'TRUE',
      trending: 'TRUE',
      span: 'span2x2'
    },
    {
      id: '2',
      title: 'Latest Updates Coming Soon',
      excerpt: 'Stay tuned for exciting content.',
      content: 'More content coming soon...',
      img: 'images/blog_pics/cover.jpeg',
      tag: 'News',
      date: '2025-08-28',
      featured: 'FALSE',
      trending: 'FALSE',
      span: 'span1x1'
    }
  ]
};

// --- CSV Parsing ---
function parseCSV(csvText) {
  try {
    const lines = csvText.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g,''));
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g,''));
      const post = {};
      headers.forEach((h,i) => post[h] = values[i] || '');
      return (post.id && post.title) ? post : null;
    }).filter(Boolean);
  } catch(e) {
    console.error('CSV parse error:', e);
    return [];
  }
}

// --- Cache Management ---
function getCachedPosts() {
  try {
    const cached = localStorage.getItem(CMS.CACHE_KEY);
    if (!cached) return null;
    const {data, timestamp} = JSON.parse(cached);
    if (Date.now() - timestamp < CMS.CACHE_DURATION) return data;
    localStorage.removeItem(CMS.CACHE_KEY);
    return null;
  } catch(e) {
    localStorage.removeItem(CMS.CACHE_KEY);
    return null;
  }
}

function setCachedPosts(posts) {
  try {
    localStorage.setItem(CMS.CACHE_KEY, JSON.stringify({data: posts, timestamp: Date.now()}));
  } catch(e) { console.error('Cache write failed:', e); }
}

// --- Fetch from Google Sheet ---
async function fetchPostsFromSheet() {
  let retries = 3;
  while (retries > 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(CMS.SHEET_URL, {signal: controller.signal, headers: {'Cache-Control': 'no-cache'}});
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const csvText = await response.text();
      const posts = parseCSV(csvText);
      if (!posts.length) throw new Error('No posts found in sheet');
      return posts;
    } catch(e) {
      console.warn(`Fetch attempt failed (${4-retries}/3):`, e.message);
      retries--;
      if (retries) await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('All fetch attempts failed');
}

// --- Main Fetch Function ---
async function fetchPosts() {
  const cached = getCachedPosts();
  if (cached) return cached;
  try {
    const posts = await fetchPostsFromSheet();
    setCachedPosts(posts);
    return posts;
  } catch(e) {
    console.error('Fetch failed:', e);
    try {
      const expiredCache = JSON.parse(localStorage.getItem(CMS.CACHE_KEY));
      if (expiredCache?.data) return expiredCache.data;
    } catch{}
    return CMS.FALLBACK_POSTS;
  }
}

// --- Utility Functions ---
function clearPostsCache() { localStorage.removeItem(CMS.CACHE_KEY); console.log('Cache cleared'); }

async function exportPostsToJSON() {
  try {
    const posts = await fetchPosts();
    const blob = new Blob([JSON.stringify(posts, null, 2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'posts.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(a.href); console.log('Exported JSON');
  } catch(e){ console.error('Export failed:', e); }
}

function setupAutoRefresh(interval=60*60*1000) {
  setInterval(async () => {
    try { const posts = await fetchPostsFromSheet(); setCachedPosts(posts); console.log('Cache refreshed'); }
    catch(e){ console.log('Background refresh failed:', e.message); }
  }, interval);
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(fetchPosts, 2000); 
  setupAutoRefresh();
});

// --- Expose API ---
window.SwezzyMaven = {clearCache: clearPostsCache, refreshCache: fetchPosts, exportPosts: exportPostsToJSON};
