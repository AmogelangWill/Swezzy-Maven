// CMS.js — simplified version using publish-to-CSV link
const CMS_CONFIG = {
  // Direct link to your published sheet in CSV format
  SHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnShLpqdGMWEby1DreBaPnqrX7gT3h1S9fcsug7vJCpSjdyb_k5hmZwaT91vvP5RiuW0d6ArbB5ATf/pub?output=csv"
};

async function fetchPosts() {
  try {
    const response = await fetch(CMS_CONFIG.SHEET_URL);
    const csvText = await response.text();

    // Convert CSV into objects
    const rows = csvText.split("\n").map(r => r.split(","));
    const headers = rows[0].map(h => h.trim());
    const posts = rows.slice(1).map(row => {
      let post = {};
      headers.forEach((h, i) => post[h] = row[i] ? row[i].trim() : "");
      return post;
    });

    return posts.filter(post => post.title && post.title !== ""); // Filter out empty rows
  } catch (err) {
    console.error("Failed to fetch posts from Google Sheets:", err);
    return [];
  }
}

// Fallback static posts in case Google Sheets fails
const FALLBACK_POSTS = [
  {
    id: 1,
    title: 'Why minimal design matters',
    excerpt: 'Focus, whitespace, and editorial clarity.',
    tag: 'Art',
    date: '2025-08-20',
    img: 'images/img2.svg',
    span: 'span2x1'
  },
  {
    id: 2,
    title: 'Analog vs Digital in modern music',
    excerpt: "A producer's view on tape vs plugins.",
    tag: 'Music',
    date: '2025-08-22',
    img: 'images/img2.svg',
    span: 'span1x2'
  },
  {
    id: 3,
    title: 'Summer street style picks',
    excerpt: 'Comfort meets attitude.',
    tag: 'Style',
    date: '2025-08-24',
    img: 'images/img3.svg',
    span: 'span2x2'
  },
  {
    id: 4,
    title: 'Small routines for big focus',
    excerpt: 'Tiny habits, huge results.',
    tag: 'LifeStyle',
    date: '2025-08-18',
    img: 'images/img4.svg',
    span: 'span1x1'
  },
  {
    id: 5,
    title: 'City Derby tonight',
    excerpt: 'Preview and spicy takes.',
    tag: 'Sports',
    date: '2025-08-27',
    img: 'images/img5.svg',
    span: 'span4x1'
  },
  {
    id: 6,
    title: 'Portraits in green',
    excerpt: 'A photographer experiments with accent colours.',
    tag: 'Art',
    date: '2025-08-15',
    img: 'images/img6.svg',
    span: 'span1x1'
  }
];

// Hero article data - can be from spreadsheet too
let HERO_POST = {
  id: 'hero',
  title: 'Breaking: Swezzy Maven returns better clean, fast, tasteful.',
  excerpt: 'A minimalist news-first layout where the current story is the star. Smooth animations and tasteful accents.',
  tag: 'News',
  date: '2025-08-28',
  img: 'images/blog_pics/cover.jpeg'
};

let POSTS = []; // Will be populated from Google Sheets

function isoDateDaysDiff(d1, d2) {
  return Math.floor(Math.abs(new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));
}

function isMobile() {
  return window.innerWidth <= 768;
}

function normalizePost(post) {
  // Normalize post data structure from Google Sheets
  return {
    id: post.id || post.ID || Math.random().toString(36).substr(2, 9),
    title: post.title || post.Title || '',
    excerpt: post.excerpt || post.Excerpt || post.description || post.Description || '',
    tag: post.tag || post.Tag || post.category || post.Category || 'General',
    date: post.date || post.Date || new Date().toISOString().split('T')[0],
    img: post.img || post.Image || post.image || 'images/default.svg',
    span: post.span || post.Span || post.layout || post.Layout || 'span1x1',
    content: post.content || post.Content || post.body || post.Body || ''
  };
}

async function initializePosts() {
  try {
    console.log('Fetching posts from Google Sheets...');
    const fetchedPosts = await fetchPosts();
    
    if (fetchedPosts.length > 0) {
      POSTS = fetchedPosts.map(normalizePost);
      
      // Check if first post should be hero post
      if (POSTS.length > 0 && (POSTS[0].hero === 'true' || POSTS[0].Hero === 'true' || POSTS[0].isHero === 'true')) {
        HERO_POST = POSTS[0];
        POSTS = POSTS.slice(1); // Remove hero from regular posts
      }
      
      console.log('Successfully loaded', POSTS.length, 'posts from Google Sheets');
    } else {
      throw new Error('No posts found in Google Sheets');
    }
  } catch (error) {
    console.warn('Failed to load posts from Google Sheets, using fallback posts:', error);
    POSTS = FALLBACK_POSTS;
  }
}

function populatePopularPosts() {
  const popularRow = document.getElementById('popularRow');
  if (!popularRow) return;
  
  popularRow.innerHTML = ''; // Clear existing content
  POSTS.slice(0, 4).forEach(p => {
    const d = document.createElement('div');
    d.className = 'popular-item';
    d.innerHTML = `<strong>${p.title}</strong><p class="muted">${p.tag} • ${p.date}</p>`;
    d.onclick = () => openModal(p);
    popularRow.appendChild(d);
  });
}

function populateRecentPosts() {
  const collage = document.getElementById('collage');
  if (!collage) return;
  
  collage.innerHTML = ''; // Clear existing content
  const today = new Date('2025-08-29');
  
  POSTS.forEach(p => {
    const diff = isoDateDaysDiff(p.date, today);
    const card = document.createElement('article');
    card.className = 'card ' + p.span;
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}" onerror="this.src='images/default.svg'">
      <div class="meta">
        <div>
          <p class="title">${p.title}</p>
          <p class="excerpt">${p.excerpt}</p>
        </div>
        <div>
          <span class="tag">${p.tag}</span>
          <p class="muted">${p.date}</p>
        </div>
      </div>
    `;
    card.onclick = () => openModal(p);
    
    if (diff <= 14) {
      collage.appendChild(card);
    }
  });
}

function populateTrendingPosts() {
  const trendingList = document.getElementById('trendingList');
  if (!trendingList) return;
  
  trendingList.innerHTML = ''; // Clear existing content
  POSTS.forEach(p => {
    const trendingItem = document.createElement('div');
    trendingItem.className = 'trending-item';
    trendingItem.innerHTML = `
      <img src="${p.img}" alt="${p.title}" onerror="this.src='images/default.svg'">
      <div class="trending-content-area">
        <h3 class="trending-title">${p.title}</h3>
        <p class="trending-excerpt">${p.excerpt}</p>
        <div class="trending-meta">
          <span class="trending-tag">${p.tag}</span>
          <span class="trending-date">${p.date}</span>
        </div>
      </div>
    `;
    trendingItem.onclick = () => openModal(p);
    trendingList.appendChild(trendingItem);
  });
}

function openModal(p) {
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalImage = document.getElementById('modalImage');
  const modalContent = document.getElementById('modalContent');
  const articleModal = document.getElementById('articleModal');
  
  if (modalTitle) modalTitle.innerText = p.title;
  if (modalDate) modalDate.innerText = p.date + ' • ' + p.tag;
  if (modalImage) {
    modalImage.src = p.img;
    modalImage.onerror = function() { this.src = 'images/default.svg'; };
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

// Make openModal available globally
window.openModal = openModal;

// Hero modal function
window.openHeroModal = function() {
  openModal(HERO_POST);
};

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize posts from Google Sheets first
  await initializePosts();
  
  // Get DOM elements
  const collage = document.getElementById('collage'),
        popularRow = document.getElementById('popularRow'),
        popularPanel = document.getElementById('popularPanel'),
        mobileMenu = document.getElementById('mobileMenu'),
        hamburger = document.getElementById('hamburger'),
        searchToggle = document.getElementById('searchToggle'),
        articleModal = document.getElementById('articleModal'),
        modalClose = document.getElementById('modalClose'),
        searchBar = document.getElementById('searchBar'),
        searchInput = document.getElementById('searchInput'),
        trendingList = document.getElementById('trendingList');

  // Populate all post sections
  populatePopularPosts();
  populateRecentPosts();
  populateTrendingPosts();

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
