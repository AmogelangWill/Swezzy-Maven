// main.js
// NOTE: Requires cms.js to be loaded first!

function isoDateDaysDiff(d1, d2) {
  return Math.floor(Math.abs(new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));
}

function isMobile() {
  return window.innerWidth <= 768;
}

document.addEventListener('DOMContentLoaded', () => {
  const collage = document.getElementById('collage'),
        popularRow = document.getElementById('popularRow'),
        popularPanel = document.getElementById('popularPanel'),
        mobileMenu = document.getElementById('mobileMenu'),
        hamburger = document.getElementById('hamburger'),
        searchToggle = document.getElementById('searchToggle'),
        articleModal = document.getElementById('articleModal'),
        modalClose = document.getElementById('modalClose'),
        modalTitle = document.getElementById('modalTitle'),
        modalDate = document.getElementById('modalDate'),
        modalImage = document.getElementById('modalImage'),
        modalContent = document.getElementById('modalContent'),
        searchBar = document.getElementById('searchBar'),
        searchInput = document.getElementById('searchInput'),
        trendingList = document.getElementById('trendingList'),
        hero = document.getElementById('hero');

  // Load posts from Google Sheets
  fetchPosts().then(posts => {
    // Sort newest first
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const today = new Date();

    // Hero post = first post with featured=TRUE
    const heroPost = posts.find(p => p.featured === "TRUE");
    if (hero && heroPost) {
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
      hero.onclick = () => openModal(heroPost);
    }

    // Collage (recent updates grid)
if (collage) {
  posts.forEach(p => {
    const diff = isoDateDaysDiff(p.date, today);
    const card = document.createElement('article');
    card.className = 'card ' + (p.span || "span1x1"); // keep span classes
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
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

// Trending section
if (trendingList) {
  posts.filter(p => p.trending === "TRUE").slice(0, 6).forEach(p => {
    const trendingItem = document.createElement('div');
    trendingItem.className = 'trending-item';
    trendingItem.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
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

// Popular
if (popularRow) {
  posts.filter(p => p.featured === "TRUE").slice(0, 4).forEach(p => {
    const d = document.createElement('div');
    d.className = 'popular-item';
    d.innerHTML = `<strong>${p.title}</strong><p class="muted">${p.tag} • ${p.date}</p>`;
    d.onclick = () => openModal(p);
    popularRow.appendChild(d);
  });
}

    // Modal opener
    function openModal(p) {
      if (modalTitle) modalTitle.innerText = p.title;
      if (modalDate) modalDate.innerText = p.date + ' • ' + p.tag;
      if (modalImage) modalImage.src = p.img;
      if (modalContent) {
        modalContent.innerHTML = `<p>${p.content || "No content available."}</p>`;
      }
      if (articleModal) {
        articleModal.classList.add('show');
        articleModal.setAttribute('aria-hidden', 'false');
      }
    }
    window.openModal = openModal;
  });

  // ============================
  // === UI / NAVBAR CONTROLS ===
  // ============================

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

  // Modal close
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

  // Search filtering
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

  // Window resize handling
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      if (mobileMenu) mobileMenu.classList.remove('show');
    } else {
      if (popularPanel) popularPanel.classList.remove('show');
    }
  });
});
