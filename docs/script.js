const FEED_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.brandonsanderson.com/feed/';
const ITEMS_PER_PAGE = 5;

async function fetchFeed() {
  const response = await fetch(FEED_URL);
  const data = await response.json();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const items = (data.items || []).filter(item => new Date(item.pubDate) >= oneYearAgo);
  const stormlight = items.filter(item => /stormlight/i.test(item.title + ' ' + item.description));
  const others = items.filter(item => !/stormlight/i.test(item.title + ' ' + item.description));
  return [...stormlight, ...others];
}

function createArticle(item) {
  const article = document.createElement('article');
  const img = document.createElement('img');
  img.src = item.thumbnail || (item.enclosure ? item.enclosure.link : 'https://via.placeholder.com/150?text=Cosmere');
  img.alt = item.title;
  const title = document.createElement('h2');
  const link = document.createElement('a');
  link.href = item.link;
  link.textContent = item.title;
  title.appendChild(link);
  const date = document.createElement('time');
  date.textContent = new Date(item.pubDate).toLocaleDateString();
  const description = document.createElement('p');
  description.innerHTML = item.description;
  article.append(img, title, date, description);
  return article;
}

async function renderLatest() {
  const container = document.getElementById('news');
  const items = await fetchFeed();
  items.slice(0, ITEMS_PER_PAGE).forEach(item => container.appendChild(createArticle(item)));
}

let historyItems = [];
let currentPage = 1;

function renderPage(page) {
  const container = document.getElementById('history');
  container.innerHTML = '';
  const start = (page - 1) * ITEMS_PER_PAGE;
  historyItems.slice(start, start + ITEMS_PER_PAGE).forEach(item => container.appendChild(createArticle(item)));
  renderPagination(page);
}

function renderPagination(page) {
  const totalPages = Math.ceil(historyItems.length / ITEMS_PER_PAGE) || 1;
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  const prev = document.createElement('button');
  prev.textContent = 'Prev';
  prev.disabled = page === 1;
  prev.onclick = () => { currentPage--; renderPage(currentPage); };
  const next = document.createElement('button');
  next.textContent = 'Next';
  next.disabled = page === totalPages;
  next.onclick = () => { currentPage++; renderPage(currentPage); };
  pagination.append(prev, document.createTextNode(` Page ${page} of ${totalPages} `), next);
}

async function renderHistory() {
  historyItems = await fetchFeed();
  renderPage(currentPage);
}

document.addEventListener('DOMContentLoaded', () => {
  const newsContainer = document.getElementById('news');
  if (newsContainer) {
    renderLatest();
  }
});
