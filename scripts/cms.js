// Enhanced CMS.js with caching and performance optimizations

const CMS_CONFIG = {
  SHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnShLpqdGMWEby1DreBaPnqrX7gT3h1S9fcsug7vJCpSjdyb_k5hmZwaT91vvP5RiuW0d6ArbB5ATf/pub?output=csv",
  CACHE_KEY: 'swezzy_posts_cache',
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
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

// Improved CSV parsing with better error handling
function parseCSV(csvText) {
  try {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const posts = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= headers.length) {
        const post = {};
        headers.forEach((header, index) => {
          post[header] = values[index] || '';
        });
        if (post.id && post.title) { // Only add valid posts
          posts.push(post);
        }
      }
    }
    
    return posts;
  } catch (error) {
    console.error('CSV parsing error:', error);
    return [];
  }
}

// Cache management
function getCachedPosts() {
  try {
    const cached = localStorage.getItem(CMS_CONFIG.CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - timestamp < CMS_CONFIG.CACHE_DURATION) {
      return data;
    } else {
      localStorage.removeItem(CMS_CONFIG.CACHE_KEY);
      return null;
    }
  } catch (error) {
    console.error('Cache read error:', error);
    localStorage.removeItem(CMS_CONFIG.CACHE_KEY);
    return null;
  }
}

function setCachedPosts(posts) {
  try {
    const cacheData = {
      data: posts,
      timestamp: Date.now()
    };
    localStorage.setItem(CMS_CONFIG.CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

// Enhanced fetch with retry logic and fallbacks
async function fetchPostsFromSheet() {
  let retries = 3;
  
  while (retries > 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(CMS_CONFIG.SHEET_URL, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const posts = parseCSV(csvText);
      
      if (posts.length === 0) {
        throw new Error('No valid posts found in sheet');
      }
      
      return posts;
      
    } catch (error) {
      console.warn(`Fetch attempt failed (${4-retries}/3):`, error.message);
      retries--;
      
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }
  }
  
  throw new Error('All fetch attempts failed');
}

// Main fetchPosts function with caching
async function fetchPosts() {
  // First, try to get cached data
  const cached = getCachedPosts();
  if (cached) {
    console.log('Using cached posts');
    return cached;
  }
  
  try {
    console.log('Fetching fresh posts from Google Sheets...');
    const posts = await fetchPostsFromSheet();
    setCachedPosts(posts);
    return posts;
  } catch (error) {
    console.error('Failed to fetch from Google Sheets:', error);
    
    // Try to get expired cache as fallback
    try {
      const expiredCache = localStorage.getItem(CMS_CONFIG.CACHE_KEY);
      if (expiredCache) {
        const { data } = JSON.parse(expiredCache);
        console.log('Using expired cache as fallback');
        return data;
      }
    } catch (cacheError) {
      console.error('Cache fallback failed:', cacheError);
    }
    
    // Final fallback to hardcoded posts
    console.log('Using fallback posts');
    return CMS_CONFIG.FALLBACK_POSTS;
  }
}

// Preload function to warm up the cache
async function preloadPosts() {
  try {
    await fetchPosts();
  } catch (error) {
    console.error('Preload failed:', error);
  }
}

// Export to JSON function (for manual export)
async function exportPostsToJSON() {
  try {
    const posts = await fetchPostsFromSheet();
    const blob = new Blob([JSON.stringify(posts, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'posts.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Posts exported to JSON file');
  } catch (error) {
    console.error('Export failed:', error);
  }
}

// Clear cache function
function clearPostsCache() {
  localStorage.removeItem(CMS_CONFIG.CACHE_KEY);
  console.log('Posts cache cleared');
}

// Auto-refresh cache in background (optional)
function setupAutoRefresh() {
  // Refresh cache every hour in background
  setInterval(async () => {
    try {
      const posts = await fetchPostsFromSheet();
      setCachedPosts(posts);
      console.log('Cache refreshed in background');
    } catch (error) {
      console.log('Background refresh failed:', error.message);
    }
  }, 60 * 60 * 1000); // 1 hour
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Preload posts to warm up cache for next visit
  setTimeout(preloadPosts, 2000);
  
  // Setup auto-refresh (optional)
  setupAutoRefresh();
});

// Global functions for manual cache management (accessible from console)
window.SwezzyMaven = {
  clearCache: clearPostsCache,
  refreshCache: preloadPosts,
  exportPosts: exportPostsToJSON,
  getCacheInfo: () => {
    const cached = localStorage.getItem(CMS_CONFIG.CACHE_KEY);
    if (cached) {
      const { timestamp } = JSON.parse(cached);
      const age = (Date.now() - timestamp) / 1000 / 60; // minutes
      console.log(`Cache age: ${age.toFixed(1)} minutes`);
      return { age, valid: age < 30 };
    }
    return { age: null, valid: false };
  }
};
