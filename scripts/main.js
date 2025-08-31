// Updated main.js with CMS integration
// Remove the old hardcoded POSTS array - now using CMS data

function isoDateDaysDiff(d1, d2) {
  return Math.floor(Math.abs(new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));
}

function isMobile() {
  return window.innerWidth <= 768;
}

// Homepage rendering function
function renderHomepage() {
  if (!POSTS || POSTS.length === 0) return;
  
  renderHeroSection();
  renderPopularPanel();
  renderRecentPosts();
  renderTrendingPosts();
}

// Render hero/featured section
function renderHeroSection() {
  const featuredPost = getFeaturedPost();
  if (!featuredPost) return;
  
  const heroTitle = document.querySelector('.featured-left h1');
  const heroExcerpt = document.querySelector('.featured-left .lede');
  const heroDate = document.querySelector('.featured-left time');
  const heroTag = document.querySelector('.featured-left .tag');
  const heroImage = document.querySelector('.featured-img img');
  
  if (heroTitle) heroTitle.textContent = featuredPost.title;
  if (heroExcerpt) heroExcerpt.textContent = featuredPost.excerpt;
  if (heroDate) {
    heroDate.textContent = new Date(featuredPost.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    heroDate.setAttribute('datetime', featuredPost.date);
  }
  if (heroTag) heroTag.textContent = featuredPost.tag;
  if (heroImage) heroImage.src = featuredPost.img;
}

// Render popular panel
function renderPopularPanel() {
  const popularRow = document.getElementById('popularRow');
  if (!popularRow) return;
  
  popularRow.innerHTML = '';
  const popularPosts = POSTS.slice(0, 4);
  
  popularPosts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'popular-item';
    div.innerHTML = `
      <strong>${post.title}</strong>
      <p class="muted">${post.tag} • ${post.date}</p>
    `;
    div.onclick = () => openModal(post);
    popularRow.appendChild(div);
  });
}

// Render recent posts collage
function renderRecentPosts() {
  const collage = document.getElementById('collage');
  if (!collage) return;
  
  collage.innerHTML = '';
  const recentPosts = getRecentPosts(14);
  
  recentPosts.forEach(post => {
    const card = document.createElement('article');
    card.className = `card ${post.span || 'span1x1'}`;
    card.innerHTML = `
      <img src="${post.img}" alt="${post.title}" loading="lazy">
      <div class="meta">
        <div>
          <p class="title">${post.title}</p>
          <p class="excerpt">${post.excerpt}</p>
        </div>
        <div>
          <span class="tag">${post.tag}</span>
          <p class="muted">${post.date}</p>
        </div>
      </div>
    `;
    card.onclick = () => openModal(post);
    collage.appendChild(card);
  });
}

// Render trending posts
function renderTrendingPosts() {
  const trendingList = document.getElementById('trendingList');
  if (!trendingList) return;
  
  trendingList.innerHTML = '';
  const trendingPosts = getTrendingPosts(6);
  
  trendingPosts.forEach(post => {
    const item = document.createElement('div');
    item.className = 'trending-item';
    item.innerHTML = `
      <img src="${post.img}" alt="${post.title}" loading="lazy">
      <div class="trending-content-area">
        <h3 class="trending-title">${post.title}</h3>
        <p class="trending-excerpt">${post.excerpt}</p>
        <div class="trending-meta">
          <span class="trending-tag">${post.tag}</span>
          <span class="trending-date">${post.date}</span>
        </div>
      </div>
    `;
    item.onclick = () => openModal(post);
    trendingList.appendChild(item);
  });
}

// Render category page
function renderCategoryPage(category) {
  const categoryPosts = getPostsByCategory(category);
  const collage = document.getElementById('collage');
  
  if (!collage) return;
  
  collage.innerHTML = '';
  
  if (categoryPosts.length === 0) {
    collage.innerHTML = `
      <div class="no-posts">
        <h3>No ${category} posts yet</h3>
        <p>Check back soon for new content!</p>
      </div>
    `;
    return;
  }
  
  categoryPosts.forEach(post => {
    const card = document.createElement('article');
    card.className = `card ${post.span || 'span1x1'}`;
    card.innerHTML = `
      <img src="${post.img}" alt="${post.title}" loading="lazy">
      <div class="meta">
        <div>
          <p class="title">${post.title}</p>
          <p class="excerpt">${post.excerpt}</p>
        </div>
        <div>
          <span class="tag">${post.tag}</span>
          <p class="muted">${post.date}</p>
        </div>
      </div>
    `;
    card.onclick = () => openModal(post);
    collage.appendChild(card);
  });
}

// Enhanced modal function with full content
function openModal(post) {
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalImage = document.getElementById('modalImage');
  const modalContent = document.getElementById('modalContent');
  const articleModal = document.getElementById('articleModal');
  
  if (modalTitle) modalTitle.textContent = post.title;
  if (modalDate) modalDate.textContent = `${post.date} • ${post.tag}`;
  if (modalImage) modalImage.src = post.img;
  if (modalContent) {
    // Use full content from CMS or fallback to excerpt
    modalContent.innerHTML = post.content || `
      <p>${post.excerpt}</p>
      <p><em>Full content will be available when you set up your Google Sheets CMS.</em></p>
    `;
  }
  
  if (articleModal) {
    articleModal.classList.add('show');
    articleModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

// Enhanced search with CMS data
function performSearch(query) {
  if (!query.trim()) {
    // Show all posts when search is cleared
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      renderRecentPosts();
    } else {
      // Get current page category
      const currentCategory = getCurrentPageCategory();
      if (currentCategory) {
        renderCategoryPage(currentCategory);
      }
    }
    return;
  }
  
  const results = searchPosts(query);
  const collage = document.getElementById('collage');
  
  if (!collage) return;
  
  collage.innerHTML = '';
  
  if (results.length === 0) {
    collage.innerHTML = `
      <div class="no-results">
        <h3>No results found for "${query}"</h3>
        <p>Try searching for something else.</p>
      </div>
    `;
    return;
  }
  
  results.forEach(post => {
    const card = document.createElement('article');
    card.className = `card ${post.span || 'span1x1'}`;
    card.innerHTML = `
      <img src="${post.img}" alt="${post.title}" loading="lazy">
      <div class="meta">
        <div>
          <p class="title">${post.title}</p>
          <p class="excerpt">${post.excerpt}</p>
        </div>
        <div>
          <span class="tag">${post.tag}</span>
          <p class="muted">${post.date}</p>
        </div>
      </div>
    `;
    card.onclick = () => openModal(post);
    collage.appendChild(card);
  });
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

// Main initialization
document.addEventListener('DOMContentLoaded', async () => {
  // UI Element References
  const popularPanel = document.getElementById('popularPanel');
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  const searchToggle = document.getElementById('searchToggle');
  const articleModal = document.getElementById('articleModal');
  const modalClose = document.getElementById('modalClose');
  const searchBar = document.getElementById('searchBar');
  const searchInput = document.getElementById('searchInput');

  // Show loading state
  showLoadingState();
  
  try {
    // Load posts from CMS
    await fetchPosts();
    
    // Render appropriate content based on current page
    renderPageContent();
  } catch (error) {
    handleCmsLoadError(error);
  } finally {
    // Hide loading state
    hideLoadingState();
  }

  // Hamburger menu functionality
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (isMobile()) {
        if (mobileMenu) mobileMenu.classList.toggle('show');
        if (popularPanel) popularPanel.classList.remove('show');
      } else {
        if (popularPanel) popularPanel.classList.toggle('show');
        if (mobileMenu) mobileMenu.classList.remove('show');
      }
      if (searchBar) searchBar.classList.remove('show');
    });
  }

  // Search functionality
  if (searchToggle) {
    searchToggle.addEventListener('click', () => {
      if (searchBar) searchBar.classList.toggle('show');
      if (popularPanel) popularPanel.classList.remove('show');
      if (mobileMenu) mobileMenu.classList.remove('show');
      if (searchBar && searchBar.classList.contains('show') && searchInput) {
        searchInput.focus();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      performSearch(e.target.value);
    });
  }

  // Modal functionality
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      if (articleModal) {
        articleModal.classList.remove('show');
        articleModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto'; // Restore scrolling
      }
    });
  }

  if (articleModal) {
    articleModal.addEventListener('click', (e) => {
      if (e.target === articleModal) {
        articleModal.classList.remove('show');
        articleModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      if (mobileMenu) mobileMenu.classList.remove('show');
    } else {
      if (popularPanel) popularPanel.classList.remove('show');
    }
  });

  // Expose functions globally for onclick handlers
  window.openModal = openModal;
  window.renderHomepage = renderHomepage;
  window.renderCategoryPage = renderCategoryPage;
});
// Show loading state
function showLoadingState() {
  const collage = document.getElementById('collage');
  const trendingList = document.getElementById('trendingList');
  const popularRow = document.getElementById('popularRow');
  
  if (collage) {
    collage.innerHTML = '<div class="loading-skeleton">Loading content...</div>';
  }
  
  if (trendingList) {
    trendingList.innerHTML = '<div class="loading-skeleton">Loading trending content...</div>';
  }
  
  if (popularRow) {
    popularRow.innerHTML = '<div class="loading-skeleton">Loading popular content...</div>';
  }
}

// Hide loading state
function hideLoadingState() {
  // Loading content will be replaced by actual content rendering
  // No specific action needed here as render functions will replace loading states
}

// Auto-refresh posts every 5 minutes (optional)
setInterval(async () => {
  if (!document.hidden) {
    const oldLength = POSTS.length;
    await fetchPosts();
    
    // Re-render if new posts were added
    if (POSTS.length > oldLength) {
      renderPageContent();
    }
  }
}, 5 * 60 * 1000);