// main.js
// NOTE: Requires cms.js to be loaded first!

function formatDate(dateString) {
  const d = new Date(dateString);
  if (isNaN(d)) return dateString;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short", 
    year: "numeric"
  });
}

function isoDateDaysDiff(d1, d2) {
  return Math.floor(Math.abs(new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));
}

function isMobile() {
  return window.innerWidth <= 768;
}

function normalizePost(post) {
  return {
    id: post.id || post.ID || Math.random().toString(36).substr(2, 9),
    title: post.title || post.Title || '',
    excerpt: post.excerpt || post.Excerpt || post.description || post.Description || '',
    tag: post.tag || post.Tag || post.category || post.Category || 'General',
    date: post.date || post.Date || new Date().toISOString().split('T')[0],
    img: post.img || post.Image || post.image || 'images/default.svg',
    span: post.span || post.Span || post.layout || post.Layout || 'span1x1',
    content: post.content || post.Content || post.body || post.Body || '',
    featured: post.featured || post.Featured || 'FALSE',
    trending: post.trending || post.Trending || 'FALSE',
    hero: post.hero || post.Hero || 'FALSE'
  };
}

function renderHero(post) {
  const heroSection = document.querySelector('.hero .featured');
  if (!heroSection || !post) return;
  
  heroSection.innerHTML = `
    <div class="featured-left">
      <h1>${post.title}</h1>
      <p class="lede">${post.excerpt}</p>
      <div class="meta">
        <time datetime="${post.date}">${formatDate(post.date)}</time>
        <span class="tag">${post.tag}</span>
      </div>
    </div>
    <div class="featured-img">
      <img src="${post.img}" alt="${post.title}" onerror="this.src='images/blog_pics/cover.jpeg'">
    </div>
  `;
  heroSection.onclick = () => openModal(post);
}

function renderRecent(posts) {
  const container = document.getElementById("collage");
  if (!container) return;
  
  container.innerHTML = "";
  const today = new Date('2025-08-29');
  
  posts.slice(1, 7).forEach(p => {
    const diff = isoDateDaysDiff(p.date, today);
    const card = document.createElement('article');
    card.className = 'card ' + p.span;
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}" onerror="this.src='images/img2.svg'">
      <div class="meta">
        <div>
          <p class="title">${p.title}</p>
          <p class="excerpt">${p.excerpt}</p>
        </div>
        <div>
          <span class="tag">${p.tag}</span>
          <p class="muted">${formatDate(p.date)}</p>
        </div>
      </div>
    `;
    card.onclick = () => openModal(p);
    
    if (diff <= 14) {
      container.appendChild(card);
    }
  });
}

function renderTrending(posts) {
  const container = document.getElementById("trendingList");
  if (!container) return;
  
  container.innerHTML = "";
  posts.slice(0, 6).forEach(p => {
    const trendingItem = document.createElement('div');
    trendingItem.className = 'trending-item';
    trendingItem.innerHTML = `
      <img src="${p.img}" alt="${p.title}" onerror="this.src='images/img2.svg'">
      <div class="trending-content-area">
        <h3 class="trending-title">${p.title}</h3>
        <p class="trending-excerpt">${p.excerpt}</p>
        <div class="trending-meta">
          <span class="trending-tag">${p.tag}</span>
          <span class="trending-date">${formatDate(p.date)}</span>
        </div>
      </div>
    `;
    trendingItem.onclick = () => openModal(p);
    trendingList.appendChild(trendingItem);
  });
}

function renderPopular(posts) {
  const container = document.getElementById("popularRow");
  if (!container) return;
  
  container.innerHTML = "";
  posts.filter(p => p.featured === "TRUE").slice(0, 4).forEach(p => {
    const d = document.createElement('div');
    d.className = 'popular-item';
    d.innerHTML = `<strong>${p.title}</strong><p class="muted">${p.tag} • ${formatDate(p.date)}</p>`;
    d.onclick = () => openModal(p);
    container.appendChild(d);
  });
}

function openModal(p) {
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalImage = document.getElementById('modalImage');
  const modalContent = document.getElementById('modalContent');
  const articleModal = document.getElementById('articleModal');
  
  if (modalTitle) modalTitle.innerText = p.title;
  if (modalDate) modalDate.innerText = formatDate(p.date) + ' • ' + p.tag;
  if (modalImage) {
    modalImage.src = p.img;
    modalImage.onerror = function() { this.src = 'images/blog_pics/cover.jpeg'; };
  }
  if (modalContent) {
    modalContent.innerHTML = p.content || `
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is placeholder content for ${p.title}.</p>
      <p>Replace with your real article content in the Google Sheet.</p>
    `;
  }
  if (articleModal) {
    articleModal.classList.add('show');
    articleModal.setAttribute('aria-hidden', 'false');
  }
}

// Make functions available globally
window.openModal = openModal;
window.openHeroModal = function() {
  // This will be set after posts load
  if (window.heroPost) openModal(window.heroPost);
};

// Initialize all the menu functionality (PRESERVED EXACTLY)
document.addEventListener('DOMContentLoaded', () => {
  const popularPanel = document.getElementById('popularPanel'),
        mobileMenu = document.getElementById('mobileMenu'),
        hamburger = document.getElementById('hamburger'),
        searchToggle = document.getElementById('searchToggle'),
        articleModal = document.getElementById('articleModal'),
        modalClose = document.getElementById('modalClose'),
        searchBar = document.getElementById('searchBar'),
        searchInput = document.getElementById('searchInput');

  // Hamburger menu functionality - PRESERVED EXACTLY
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

  // Search toggle functionality - PRESERVED EXACTLY
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

  // Modal close functionality - PRESERVED EXACTLY
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      if (articleModal) {
        articleModal.classList.remove('show');
        articleModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (articleModal) {
    articleModal.addEventListener('click', (e) => {
      if (e.target === articleModal) {
        articleModal.classList.remove('show');
        articleModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Search functionality - PRESERVED EXACTLY
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      
      document.querySelectorAll('.card').forEach(card => {
        const titleEl = card.querySelector('.title');
        const excerptEl = card.querySelector('.excerpt');
        if (titleEl && excerptEl) {
          const title = titleEl.innerText.toLowerCase();
          const excerpt = excerptEl.innerText.toLowerCase();
          card.style.display = (title.includes(q) || excerpt.includes(q)) ? '' : 'none';
        }
      });
    });
  }

  // Handle window resize - PRESERVED EXACTLY
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      if (mobileMenu) mobileMenu.classList.remove('show');
    } else {
      if (popularPanel) popularPanel.classList.remove('show');
    }
  });
});

// Entry point - Load posts and render (FOLLOWING WORKING PATTERN)
fetchPosts().then(posts => {
  if (!posts || posts.length === 0) {
    console.error('No posts loaded from Google Sheets');
    return;
  }
  
  // Normalize all posts
  const normalizedPosts = posts.map(normalizePost);
  
  // Sort newest first
  normalizedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  console.log('Loaded', normalizedPosts.length, 'posts from Google Sheets');
  
  // Set hero post for global access
  window.heroPost = normalizedPosts[0];
  
  // Homepage rendering
  if (document.getElementById("collage")) {
    renderHero(normalizedPosts[0]);
    renderRecent(normalizedPosts);
    renderTrending(normalizedPosts);
    renderPopular(normalizedPosts);
  }
}).catch(error => {
  console.error('Failed to load posts:', error);
});
