// Optimized main.js with instant loading and skeleton states
// NOTE: Requires optimized cms.js to be loaded first!

function isMobile() {
  return window.innerWidth <= 768;
}

// Skeleton loading templates
const SKELETON_TEMPLATES = {
  hero: `
    <article class="featured skeleton">
      <div class="featured-left">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-text"></div>
        <div class="skeleton-line skeleton-text short"></div>
        <div class="skeleton-meta">
          <div class="skeleton-tag"></div>
          <div class="skeleton-date"></div>
        </div>
      </div>
      <div class="featured-img">
        <div class="skeleton-img"></div>
      </div>
    </article>
  `,
  
  card: `
    <article class="card skeleton">
      <div class="skeleton-img"></div>
      <div class="meta">
        <div>
          <div class="skeleton-line skeleton-card-title"></div>
          <div class="skeleton-line skeleton-card-text"></div>
        </div>
        <div>
          <div class="skeleton-tag small"></div>
          <div class="skeleton-line skeleton-date short"></div>
        </div>
      </div>
    </article>
  `,
  
  trending: `
    <div class="trending-item skeleton">
      <div class="skeleton-img"></div>
      <div class="trending-content-area">
        <div class="skeleton-line skeleton-trending-title"></div>
        <div class="skeleton-line skeleton-trending-text"></div>
        <div class="skeleton-line skeleton-trending-text short"></div>
        <div class="trending-meta">
          <div class="skeleton-tag"></div>
          <div class="skeleton-date"></div>
        </div>
      </div>
    </div>
  `,
  
  popular: `
    <div class="popular-item skeleton">
      <div class="skeleton-line skeleton-popular-title"></div>
      <div class="skeleton-line skeleton-popular-meta"></div>
    </div>
  `
};

// Show skeleton loading immediately
function showSkeletonLoading() {
  const collage = document.getElementById('collage');
  const hero = document.getElementById('hero');
  const trendingList = document.getElementById('trendingList');
  const popularRow = document.getElementById('popularRow');
  
  // Show hero skeleton
  if (hero) {
    hero.innerHTML = SKELETON_TEMPLATES.hero;
  }
  
  // Show collage skeletons
  if (collage) {
    collage.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      collage.innerHTML += SKELETON_TEMPLATES.card;
    }
  }
  
  // Show trending skeletons
  if (trendingList) {
    trendingList.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      trendingList.innerHTML += SKELETON_TEMPLATES.trending;
    }
  }
  
  // Show popular skeletons
  if (popularRow) {
    popularRow.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      popularRow.innerHTML += SKELETON_TEMPLATES.popular;
    }
  }
}

// Animate content in
function animateIn(element) {
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  
  requestAnimationFrame(() => {
    element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  });
}

// Create optimized card element
function createCard(post, index = 0) {
  const card = document.createElement('article');
  card.className = 'card ' + (post.span || "span1x1");
  
  // Use intersection observer for lazy loading images
  const img = new Image();
  img.loading = 'lazy';
  img.onload = () => {
    card.querySelector('.card-img-placeholder').replaceWith(img);
  };
  img.src = post.img;
  img.alt = post.title;
  
  card.innerHTML = `
    <div class="card-img-placeholder skeleton-img"></div>
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
  
  card.onclick = () => {
    window.location.href = `pages/post.html?id=${post.id}`;
  };
  
  // Stagger animation
  setTimeout(() => animateIn(card), index * 100);
  
  return card;
}

// Create optimized trending item
function createTrendingItem(post, index = 0) {
  const item = document.createElement('div');
  item.className = 'trending-item';
  
  const img = new Image();
  img.loading = 'lazy';
  img.onload = () => {
    item.querySelector('.trending-img-placeholder').replaceWith(img);
  };
  img.src = post.img;
  img.alt = post.title;
  
  item.innerHTML = `
    <div class="trending-img-placeholder skeleton-img"></div>
    <div class="trending-content-area">
      <h3 class="trending-title">${post.title}</h3>
      <p class="trending-excerpt">${post.excerpt}</p>
      <div class="trending-meta">
        <span class="trending-tag">${post.tag}</span>
        <span class="trending-date">${post.date}</span>
      </div>
    </div>
  `;
  
  item.onclick = () => {
    window.location.href = `pages/post.html?id=${post.id}`;
  };
  
  setTimeout(() => animateIn(item), index * 150);
  
  return item;
}

// Main content loading function
async function loadContent() {
  try {
    const posts = await fetchPosts();
    
    // Sort posts
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Load hero
    const hero = document.getElementById('hero');
    const heroPost = posts.find(p => p.featured === "TRUE");
    if (hero && heroPost) {
      const heroImg = new Image();
      heroImg.loading = 'eager'; // Load hero image immediately
      heroImg.onload = () => {
        hero.innerHTML = `
          <article class="featured">
            <div class="featured-left">
              <h1>${heroPost.title}</h1>
              <p class="lede">${heroPost.excerpt}</p>
              <div class="meta">
                <time datetime="${heroPost.date}">${heroPost.date}</time>
                <span class="tag">${heroPost.tag}</span>
              </div>
            </div>
            <div class="featured-img">
              <img src="${heroPost.img}" alt="${heroPost.title}">
            </div>
          </article>
        `;
        hero.onclick = () => {
          window.location.href = `pages/post.html?id=${heroPost.id}`;
        };
        animateIn(hero.querySelector('.featured'));
      };
      heroImg.src = heroPost.img;
    }
    
    // Load collage
    const collage = document.getElementById('collage');
    if (collage) {
      collage.innerHTML = '';
      sortedPosts.slice(0, 6).forEach((post, index) => {
        const card = createCard(post, index);
        collage.appendChild(card);
      });
    }
    
    // Load trending
    const trendingList = document.getElementById('trendingList');
    if (trendingList) {
      trendingList.innerHTML = '';
      posts.filter(p => p.trending === "TRUE").slice(0, 6).forEach((post, index) => {
        const item = createTrendingItem(post, index);
        trendingList.appendChild(item);
      });
    }
    
    // Load popular
    const popularRow = document.getElementById('popularRow');
    if (popularRow) {
      popularRow.innerHTML = '';
      posts.filter(p => p.featured === "TRUE").slice(0, 4).forEach((post, index) => {
        const item = document.createElement('div');
        item.className = 'popular-item';
        item.innerHTML = `<strong>${post.title}</strong><p class="muted">${post.tag} • ${post.date}</p>`;
        item.onclick = () => {
          window.location.href = `pages/post.html?id=${post.id}`;
        };
        setTimeout(() => animateIn(item), index * 100);
        popularRow.appendChild(item);
      });
    }
    
  } catch (error) {
    console.error('Content loading failed:', error);
    
    // Show error state
    const collage = document.getElementById('collage');
    if (collage) {
      collage.innerHTML = '<div class="error-state">⚠️ Content temporarily unavailable. Please refresh the page.</div>';
    }
  }
}

// Initialize UI immediately (before content loads)
function initializeUI() {
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  const searchToggle = document.getElementById('searchToggle');
  const searchBar = document.getElementById('searchBar');
  const searchInput = document.getElementById('searchInput');
  const popularPanel = document.getElementById('popularPanel');
  
  // Hamburger toggle
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
  
  // Search toggle
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
  
  // Search filtering with debounce
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.card').forEach(card => {
          const titleEl = card.querySelector('.title');
          const excerptEl = card.querySelector('.excerpt');
          if (titleEl && excerptEl) {
            const title = titleEl.innerText.toLowerCase();
            const excerpt = excerptEl.innerText.toLowerCase();
            const shouldShow = title.includes(q) || excerpt.includes(q);
            card.style.display = shouldShow ? '' : 'none';
            
            // Animate visibility
            if (shouldShow) {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            } else {
              card.style.opacity = '0';
              card.style.transform = 'translateY(-10px)';
            }
          }
        });
      }, 300); // 300ms debounce
    });
  }
  
  // Window resize handling
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!isMobile()) {
        if (mobileMenu) mobileMenu.classList.remove('show');
      } else {
        if (popularPanel) popularPanel.classList.remove('show');
      }
    }, 250);
  });
  
  // Close menus when clicking outside
  document.addEventListener('click', (e) => {
    const isMenuClick = e.target.closest('#hamburger, #searchToggle, #mobileMenu, #popularPanel, #searchBar');
    if (!isMenuClick) {
      if (mobileMenu) mobileMenu.classList.remove('show');
      if (popularPanel) popularPanel.classList.remove('show');
      if (searchBar) searchBar.classList.remove('show');
    }
  });
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI immediately
  initializeUI();
  
  // Show skeleton loading
  showSkeletonLoading();
  
  // Load content (this will be fast if cached)
  loadContent();
});

// Preload critical resources
if (document.readyState === 'loading') {
  // Preload hero image placeholder
  const heroImg = new Image();
  heroImg.src = 'images/blog_pics/cover.jpeg';
}
