// CMS Configuration
const CMS_CONFIG = {
  // Replace YOUR_SHEET_ID with your actual Google Sheet ID
  SHEET_ID: '  SHEET_ID: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRnShLpqdGMWEby1DreBaPnqrX7gT3h1S9fcsug7vJCpSjdyb_k5hmZwaT91vvP5RiuW0d6ArbB5ATf/pubhtml',
',
  // Get this from: File → Share → Publish to web → CSV format
  get SHEET_URL() {
    return `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Posts`;
  }
};

// Global posts storage
let POSTS = [];
let LOADING = false;

// CSV Parser - handles Google Sheets CSV format
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const posts = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    // Handle CSV parsing with quotes and commas
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Push the last value
    
    if (values.length >= headers.length) {
      const post = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        // Clean up the value
        value = value.replace(/^"|"$/g, '').trim();
        
        // Convert specific fields
        if (header === 'id') {
          post[header] = parseInt(value) || 0;
        } else if (header === 'featured' || header === 'trending') {
          post[header] = value.toLowerCase() === 'true';
        } else {
          post[header] = value;
        }
      });
      
      // Only add valid posts
      if (post.id && post.title) {
        posts.push(post);
      }
    }
  }
  
  return posts;
}

// Fetch posts from Google Sheets
async function fetchPosts() {
  if (LOADING) return POSTS;
  
  LOADING = true;
  try {
    console.log('Fetching posts from Google Sheets...');
    const response = await fetch(CMS_CONFIG.SHEET_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const posts = parseCSV(csvText);
    
    POSTS = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log(`Loaded ${POSTS.length} posts from CMS`);
    
    return POSTS;
  } catch (error) {
    console.error('Failed to fetch posts from CMS:', error);
    
    // Fallback to hardcoded data if CMS fails
    POSTS = getFallbackPosts();
    return POSTS;
  } finally {
    LOADING = false;
  }
}
// Get current page category from URL
function getCurrentPageCategory() {
  const path = window.location.pathname;
  if (path.includes('art.html')) return 'art';
  if (path.includes('music.html')) return 'music';
  if (path.includes('sports.html')) return 'sports';
  if (path.includes('fashion.html')) return 'fashion';
  if (path.includes('lifestyle.html')) return 'lifestyle';
  return null;
}

// Unified function to render appropriate page content
function renderPageContent() {
  const currentCategory = getCurrentPageCategory();
  
  if (currentCategory) {
    // Render category page
    renderCategoryPage(currentCategory);
  } else if (window.location.pathname.includes('index.html') || 
             window.location.pathname === '/') {
    // Render homepage
    renderHomepage();
  }
}

// Enhanced error handling for CMS loading
function handleCmsLoadError(error) {
  console.error('CMS Loading Error:', error);
  
  const collage = document.getElementById('collage');
  if (collage) {
    collage.innerHTML = `
      <div class="error-state">
        <h3>Content temporarily unavailable</h3>
        <p>We're experiencing issues loading our latest content. Please check back soon.</p>
      </div>
    `;
  }
  
  // Still try to render with fallback data
  renderPageContent();
}
// Fallback posts in case CMS is unavailable
function getFallbackPosts() {
  return [
    {
      id: 1,
      title: 'Why minimal design matters',
      excerpt: 'Focus, whitespace, and editorial clarity.',
      tag: 'Art',
      date: '2025-08-20',
      img: 'images/img2.svg',
      span: 'span2x1',
      content: '<p>This is fallback content. Please check your Google Sheets CMS connection.</p>',
      featured: false,
      trending: true,
      category: 'art'
    },
    {
      id: 2,
      title: 'Analog vs Digital in modern music',
      excerpt: "A producer's view on tape vs plugins.",
      tag: 'Music',
      date: '2025-08-22',
      img: 'images/img2.svg',
      span: 'span1x2',
      content: '<p>This is fallback content. Please check your Google Sheets CMS connection.</p>',
      featured: false,
      trending: true,
      category: 'music'
    },
    {
      id: 3,
      title: 'Summer street style picks',
      excerpt: 'Comfort meets attitude.',
      tag: 'Style',
      date: '2025-08-24',
      img: 'images/img3.svg',
      span: 'span2x2',
      content: '<p>This is fallback content. Please check your Google Sheets CMS connection.</p>',
      featured: true,
      trending: true,
      category: 'fashion'
    }
  ];
}

// Utility functions for posts
function getPostsByCategory(category) {
  return POSTS.filter(post => 
    post.category && post.category.toLowerCase() === category.toLowerCase()
  );
}

function getFeaturedPost() {
  return POSTS.find(post => post.featured) || POSTS[0];
}

function getTrendingPosts(limit = 6) {
  return POSTS.filter(post => post.trending).slice(0, limit);
}

function getRecentPosts(daysLimit = 14) {
  const today = new Date();
  return POSTS.filter(post => {
    const postDate = new Date(post.date);
    const daysDiff = Math.floor((today - postDate) / (1000 * 60 * 60 * 24));
    return daysDiff <= daysLimit;
  });
}

// Search functionality
function searchPosts(query) {
  const q = query.toLowerCase();
  return POSTS.filter(post => 
    post.title.toLowerCase().includes(q) || 
    post.excerpt.toLowerCase().includes(q) ||
    post.tag.toLowerCase().includes(q)
  );
}

// Initialize CMS on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Show loading indicator
  showLoadingState();
  
  // Fetch posts from CMS
  await fetchPosts();
  
  // Hide loading and render content
  hideLoadingState();
  renderPageContent();
});

function showLoadingState() {
  // Add subtle loading indicators
  const collage = document.getElementById('collage');
  const trendingList = document.getElementById('trendingList');
  
  if (collage) {
    collage.innerHTML = '<div class="loading-skeleton">Loading recent posts...</div>';
  }
  
  if (trendingList) {
    trendingList.innerHTML = '<div class="loading-skeleton">Loading trending posts...</div>';
  }
}

function hideLoadingState() {
  // Remove loading indicators - content will be populated by renderPageContent
}

function renderPageContent() {
  // This function will be called after posts are loaded
  // Specific rendering logic will be in the updated main.js
  if (window.renderHomepage) window.renderHomepage();
  if (window.renderCategoryPage) window.renderCategoryPage();

}
