// post.js
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const container = document.getElementById("post-container");

  fetchPosts().then(posts => {
    const post = posts.find(p => p.id === postId);
    if (!post) {
      container.innerHTML = "<p>Post not found.</p>";
      return;
    }

    container.innerHTML = `
      <article class="single-post">
        <h1>${post.title}</h1>
        <div class="meta">
          <span class="tag">${post.tag}</span>
          <time datetime="${post.date}">${post.date}</time>
        </div>
        <img src="${post.img}" alt="${post.title}" class="post-image">
        <div class="content">
          <p>${post.content || "No content available."}</p>
        </div>
      </article>
    `;
  });
});
