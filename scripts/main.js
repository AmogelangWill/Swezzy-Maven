// Swezzy Maven main.js - Optimized for speed and skeleton loading

function isMobile() { return window.innerWidth <= 768; }

// --- Skeleton Templates ---
const SKELETONS = {
  hero: `<article class="featured skeleton"><div class="featured-left"><div class="skeleton-line skeleton-title"></div><div class="skeleton-line skeleton-text"></div></div><div class="featured-img"><div class="skeleton-img"></div></div></article>`,
  card: `<article class="card skeleton"><div class="skeleton-img"></div><div class="meta"><div class="skeleton-line skeleton-card-title"></div></div></article>`,
  trending: `<div class="trending-item skeleton"><div class="skeleton-img"></div></div>`,
  popular: `<div class="popular-item skeleton"><div class="skeleton-line skeleton-popular-title"></div></div>`
};

// --- Skeleton Loader ---
function showSkeletonLoading() {
  const hero = document.getElementById('hero'), collage = document.getElementById('collage'),
        trending = document.getElementById('trendingList'), popular = document.getElementById('popularRow');
  if(hero) hero.innerHTML = SKELETONS.hero;
  if(collage) collage.innerHTML = Array(6).fill(SKELETONS.card).join('');
  if(trending) trending.innerHTML = Array(4).fill(SKELETONS.trending).join('');
  if(popular) popular.innerHTML = Array(4).fill(SKELETONS.popular).join('');
}

// --- Animate Elements ---
function animateIn(el) { el.style.opacity='0'; el.style.transform='translateY(20px)'; requestAnimationFrame(()=>{el.style.transition='opacity 0.4s ease, transform 0.4s ease'; el.style.opacity='1'; el.style.transform='translateY(0)';}); }

// --- Create Card ---
function createCard(post,index=0){
  const card = document.createElement('article'); card.className='card '+(post.span||'span1x1');
  const img = new Image(); img.loading='lazy'; img.src=post.img; img.alt=post.title;
  img.onload = ()=>{ card.querySelector('.card-img-placeholder')?.replaceWith(img); };
  card.innerHTML=`<div class="card-img-placeholder skeleton-img"></div><div class="meta"><p class="title">${post.title}</p><p class="excerpt">${post.excerpt}</p></div>`;
  card.onclick=()=>window.location.href=`pages/post.html?id=${post.id}`;
  setTimeout(()=>animateIn(card), index*100);
  return card;
}

// --- Create Trending ---
function createTrendingItem(post,index=0){
  const item=document.createElement('div'); item.className='trending-item';
  const img=new Image(); img.loading='lazy'; img.src=post.img; img.alt=post.title;
  img.onload=()=>{ item.querySelector('.trending-img-placeholder')?.replaceWith(img); };
  item.innerHTML=`<div class="trending-img-placeholder skeleton-img"></div><div class="trending-content-area"><h3>${post.title}</h3><p>${post.excerpt}</p></div>`;
  item.onclick=()=>window.location.href=`pages/post.html?id=${post.id}`;
  setTimeout(()=>animateIn(item), index*150);
  return item;
}

// --- Load Content ---
async function loadContent(){
  try {
    const posts = await fetchPosts();
    const sorted = [...posts].sort((a,b)=>new Date(b.date)-new Date(a.date));

    // Hero
    const hero = document.getElementById('hero');
    const heroPost = posts.find(p=>p.featured==='TRUE');
    if(hero && heroPost){
      hero.innerHTML=`<article class="featured"><div class="featured-left"><h1>${heroPost.title}</h1><p>${heroPost.excerpt}</p><span>${heroPost.tag} • ${heroPost.date}</span></div><div class="featured-img"><img src="${heroPost.img}" alt="${heroPost.title}"></div></article>`;
      hero.onclick=()=>window.location.href=`pages/post.html?id=${heroPost.id}`;
      animateIn(hero.querySelector('.featured'));
    }

    // Collage
    const collage = document.getElementById('collage');
    if(collage){ collage.innerHTML=''; sorted.slice(0,6).forEach((p,i)=>collage.appendChild(createCard(p,i))); }

    // Trending
    const trendingList=document.getElementById('trendingList');
    if(trendingList){ trendingList.innerHTML=''; posts.filter(p=>p.trending==='TRUE').slice(0,6).forEach((p,i)=>trendingList.appendChild(createTrendingItem(p,i))); }

    // Popular
    const popularRow=document.getElementById('popularRow');
    if(popularRow){ popularRow.innerHTML=''; posts.filter(p=>p.featured==='TRUE').slice(0,4).forEach((p,i)=>{
      const div=document.createElement('div'); div.className='popular-item';
      div.innerHTML=`<strong>${p.title}</strong><p class="muted">${p.tag} • ${p.date}</p>`; div.onclick=()=>window.location.href=`pages/post.html?id=${p.id}`;
      setTimeout(()=>animateIn(div), i*100); popularRow.appendChild(div);
    }); }

  } catch(e){ console.error('Content load failed:',e); const collage=document.getElementById('collage'); if(collage) collage.innerHTML='<div class="error-state">⚠️ Content temporarily unavailable. Refresh page.</div>'; }
}

// --- Initialize UI ---
function initializeUI(){
  const hamburger=document.getElementById('hamburger'), mobileMenu=document.getElementById('mobileMenu'),
        searchToggle=document.getElementById('searchToggle'), searchBar=document.getElementById('searchBar'),
        searchInput=document.getElementById('searchInput'), popularPanel=document.getElementById('popularPanel');

  if(hamburger) hamburger.addEventListener('click',()=>{ if(isMobile()){ mobileMenu?.classList.toggle('show'); popularPanel?.classList.remove('show'); } else{ popularPanel?.classList.toggle('show'); mobileMenu?.classList.remove('show'); } searchBar?.classList.remove('show'); });
  if(searchToggle) searchToggle.addEventListener('click',()=>{ searchBar?.classList.toggle('show'); popularPanel?.classList.remove('show'); mobileMenu?.classList.remove('show'); searchInput?.focus(); });
  
  if(searchInput){ let t; searchInput.addEventListener('input',(e)=>{ clearTimeout(t); t=setTimeout(()=>{
    const q=e.target.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card=>{
      const title=card.querySelector('.title')?.innerText.toLowerCase()||'';
      const excerpt=card.querySelector('.excerpt')?.innerText.toLowerCase()||'';
      const show=title.includes(q)||excerpt.includes(q);
      card.style.display=show?'':'none'; card.style.opacity=show?'1':'0'; card.style.transform=show?'translateY(0)':'translateY(-10px)';
    });
  },300); }); }

  let r; window.addEventListener('resize',()=>{ clearTimeout(r); r=setTimeout(()=>{ if(!isMobile()) mobileMenu?.classList.remove('show'); else popularPanel?.classList.remove('show'); },250); });
  document.addEventListener('click',(e)=>{ if(!e.target.closest('#hamburger,#searchToggle,#mobileMenu,#popularPanel,#searchBar')){ mobileMenu?.classList.remove('show'); popularPanel?.classList.remove('show'); searchBar?.classList.remove('show'); }});
}

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded',()=>{
  initializeUI(); showSkeletonLoading(); loadContent();
});

// Preload hero image
const heroImg = new Image(); heroImg.src='images/blog_pics/cover.jpeg';
