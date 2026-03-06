/**
 * Build script: reads each post's index.html, extracts title, date, permalink,
 * and summary (first paragraph of .post-content). Writes index.json and
 * regenerates the post list HTML in index.html and posts/index.html.
 * Run with: node assets/js/build-posts.js
 */

const fs = require('fs');
const path = require('path');
const { load } = require('cheerio');

const ROOT = path.resolve(__dirname, '..', '..');
const POSTS_DIR = path.join(ROOT, 'posts');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractPosts() {
  const entries = fs.readdirSync(POSTS_DIR, { withFileTypes: true });
  const posts = [];

  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const dirName = ent.name;
    const indexPath = path.join(POSTS_DIR, dirName, 'index.html');
    if (!fs.existsSync(indexPath)) continue;

    const html = fs.readFileSync(indexPath, 'utf8');
    const $ = load(html);

    const title = $('.post-title').first().text().trim() || $('h1.post-title').text().trim();
    const dateEl = $('.post-meta').first();
    const date = dateEl.text().trim();
    const permalink = `/posts/${dirName}/`;

    // Summary: first paragraph of .post-content (plain text), then "…"
    const contentDiv = $('.post-content');
    let summary = '';
    const firstP = contentDiv.find('p').first();
    if (firstP.length) {
      summary = firstP.text().trim().replace(/\s+/g, ' ');
      if (summary && !summary.endsWith('…') && !summary.endsWith('...')) {
        summary += '…';
      }
    }
    if (!summary) summary = '';

    posts.push({ title, permalink, content: summary, date });
  }

  // Sort by date descending (newest first). Keep string date for display.
  posts.sort((a, b) => {
    const dA = new Date(a.date);
    const dB = new Date(b.date);
    return isNaN(dB.getTime()) ? -1 : dB.getTime() - dA.getTime();
  });

  return posts;
}

function postEntryHtml(post) {
  const titleEsc = escapeHtml(post.title);
  const summaryEsc = escapeHtml(post.content);
  const dateEsc = escapeHtml(post.date);
  return `<article class="post-entry"> 
  <header class="entry-header">
    <h2>${titleEsc}
    </h2>
  </header>
  <section class="entry-content">
    <p>${summaryEsc}</p>
  </section>
  <footer class="entry-footer">${dateEsc}</footer>
  <a class="entry-link" aria-label="post link to ${titleEsc}" href="${escapeHtml(post.permalink)}"></a>
</article>
`;
}

function updateIndexHtml(posts) {
  const indexPath = path.join(ROOT, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Replace the block of post-entry articles (from first <article class="post-entry"> to last </article> before </main>)
  const postEntriesBlock = posts.map(postEntryHtml).join('\n');
  const regex = /(<article class="post-entry">[\s\S]*?<\/article>\s*)+/;
  if (!regex.test(html)) {
    console.warn('build-posts: could not find post-entry block in index.html');
    return;
  }
  html = html.replace(regex, postEntriesBlock);
  fs.writeFileSync(indexPath, html);
}

function updatePostsIndexHtml(posts) {
  const indexPath = path.join(ROOT, 'posts', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const postEntriesBlock = posts.map(postEntryHtml).join('\n');
  const regex = /(<article class="post-entry">[\s\S]*?<\/article>\s*)+/;
  if (!regex.test(html)) {
    console.warn('build-posts: could not find post-entry block in posts/index.html');
    return;
  }
  html = html.replace(regex, postEntriesBlock);
  fs.writeFileSync(indexPath, html);
}

function main() {
  const posts = extractPosts();
  if (posts.length === 0) {
    console.warn('build-posts: no posts found under posts/*/index.html');
    return;
  }

  const jsonPath = path.join(ROOT, 'index.json');
  const json = JSON.stringify(posts, null, 2);
  fs.writeFileSync(jsonPath, json + '\n');

  updateIndexHtml(posts);
  updatePostsIndexHtml(posts);

  console.log(`build-posts: updated index.json and list HTML for ${posts.length} post(s).`);
}

main();
