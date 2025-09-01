// main.js
// NOTE: Requires CMS.js to be loaded first!

function formatDate(dateString) {
  const d = new Date(dateString);
  if (isNaN(d)) return dateString;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function renderHero(post) {
  const container = document.getElementById("hero");
  if (!container || !post) return;

  container.innerHTML = `
    <article class="hero-post">
      <img src="${post.img}" alt="${post.title}">
      <div class="hero-text">
        <h1>${post.title}</h1>
        <p class="hero-date">${formatDate(post.date)}</p>
        <p class="hero-excerpt">${post.excerpt}</p>
      </div>
    </article>
  `;
}

function renderRecent(posts) {
  const container = document.getElementById("recent");
  if (!container) return;
  container.innerHTML = "";

  posts.slice(0, 6).forEach(p => {
    const article = document.createElement("article");
    article.classList.add("recent-post");
    article.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <h2>${p.title}</h2>
      <p class="recent-date">${formatDate(p.date)}</p>
    `;
    container.appendChild(article);
  });
}

function renderTrending(posts) {
  const container = document.getElementById("trending");
  if (!container) return;
  container.innerHTML = "";

  posts.filter(p => p.trending === "TRUE").slice(0, 6).forEach(p => {
    const article = document.createElement("article");
    article.classList.add("trending-post");
    article.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <h2>${p.title}</h2>
    `;
    container.appendChild(article);
  });
}

function renderPopular(posts) {
  const container = document.getElementById("popular");
  if (!container) return;
  container.innerHTML = "";

  // Let's use "featured" column for popular (TRUE = show)
  posts.filter(p => p.featured === "TRUE").slice(0, 4).forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="#">${p.title}</a>`;
    container.appendChild(li);
  });
}

function renderCategory(posts, category) {
  const container = document.getElementById("category-posts");
  if (!container) return;
  container.innerHTML = "";

  posts.filter(p => p.category.toLowerCase() === category.toLowerCase()).forEach(p => {
    const article = document.createElement("article");
    article.classList.add("category-post");
    article.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <h2>${p.title}</h2>
      <p class="category-date">${formatDate(p.date)}</p>
      <p class="category-content">${p.content}</p>
    `;
    container.appendChild(article);
  });
}

// Entry point
fetchPosts().then(posts => {
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (document.getElementById("hero")) {
    renderHero(posts[0]);
    renderRecent(posts.slice(1));
    renderTrending(posts);
    renderPopular(posts);
  }

  const bodyCategory = document.body.dataset.category; 
  if (bodyCategory) {
    renderCategory(posts, bodyCategory);
  }
});
