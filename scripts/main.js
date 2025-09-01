// main.js
// NOTE: Requires cms.js to be loaded first!

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
        searchBar = document.getElementById('searchBar'),
        searchInput = document.getElementById('searchInput'),
        trendingList = document.getElementById('trendingList'),
        hero = document.getElementById('hero');

  // Load posts from Google Sheets
  fetchPosts().then(posts => {
    // Sort newest first
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

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
      hero.onclick = () => {
        window.location.href = `post.html?id=${heroPost.id}`;
      };
    }

    // Recent updates (latest 6)
    if (collage) {
      posts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6)
        .forEach(p => {
          const card = document.createElement('article');
          card.className = 'card ' + (p.span || "span1x1");
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
          card.onclick = () => {
            window.location.href = `post.html?id=${p.id}`;
          };
          collage.appendChild(card);
        });
    }

    // Trending updates (max 6)
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
        trendingItem.onclick = () => {
          window.location.href = `pages/post.html?id=${p.id}`;
        };
        trendingList.appendChild(trendingItem);
      });
    }

    // Popular (hamburger panel — max 4 featured posts)
    if (popularRow) {
      posts.filter(p => p.featured === "TRUE").slice(0, 4).forEach(p => {
        const d = document.createElement('div');
        d.className = 'popular-item';
        d.innerHTML = `<strong>${p.title}</strong><p class="muted">${p.tag} • ${p.date}</p>`;
        d.onclick = () => {
          window.location.href = `post.html?id=${p.id}`;
        };
        popularRow.appendChild(d);
      });
    }
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
