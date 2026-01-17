async function loadNewsPosts() {
  const container = document.getElementById('newsContainer');

  try {
    console.log('Fetching posts...');
    const response = await fetch('posts.json');
    if (!response.ok) throw new Error('Failed to load posts index');

    const postFiles = await response.json();
    console.log('Post files:', postFiles);

    const posts = [];
    for (const file of postFiles) {
      try {
        const postResponse = await fetch('posts/' + file);
        if (postResponse.ok) {
          const content = await postResponse.text();
          const post = parseMarkdown(content);
          posts.push(post);
        }
      } catch (e) {
        console.warn('Failed to load post:', file);
      }
    }

    container.innerHTML = '';

    if (posts.length === 0) {
      container.innerHTML = '<p class="no-posts">No news posts yet. Check back soon!</p>';
      return;
    }

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log('Rendering', posts.length, 'posts');

    posts.forEach((post, index) => {
      console.log('Rendering post:', post.title);

      let imageHtml = '';
      if (post.image && post.image.trim() !== '') {
        imageHtml = `<img src="${post.image}" alt="${post.title}" class="news-image" />`;
      }

      let linkHtml = '';
      if (post.link && post.link.trim() !== '') {
        linkHtml = `
          <div class="news-links">
            <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="game-button">
              <span class="button-icon" aria-hidden="true">🔗</span>
              Read More
            </a>
          </div>
        `;
      }

      const article = document.createElement('article');
      article.className = 'news-post';
      article.style.cssText = `
        background: #313244;
        border-radius: 16px;
        border: 1px solid #45475a;
        overflow: hidden;
        margin-bottom: 2rem;
      `;

      article.innerHTML = `
        ${imageHtml}
        <div class="news-content" style="padding: 1.5rem;">
          <time datetime="${post.date}" class="news-date" style="display: block; font-size: 0.875rem; color: #89dceb; margin-bottom: 0.5rem; font-weight: 500;">${formatDate(post.date)}</time>
          <h2 class="news-title" style="font-size: 1.5rem; font-weight: 700; color: #f5e0dc; margin: 0 0 1rem 0;">${post.title}</h2>
          <div class="news-description" style="color: #cdd6f4; line-height: 1.8;">${post.content}</div>
          ${linkHtml}
        </div>
      `;

      container.appendChild(article);
    });

  } catch (error) {
    console.error('Failed to load news:', error);
    container.innerHTML = '<p class="no-posts">Failed to load news. Please try again later.</p>';
  }
}

function parseMarkdown(content) {
  const post = {
    title: '',
    date: '',
    link: '',
    image: '',
    content: ''
  };

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s]*)([\s\S]*)$/);
  
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    post.content = frontmatterMatch[3].trim();

    const titleMatch = frontmatter.match(/title:\s*(.+)/);
    if (titleMatch) post.title = titleMatch[1].trim();

    const dateMatch = frontmatter.match(/date:\s*(.+)/);
    if (dateMatch) post.date = dateMatch[1].trim();

    const linkMatch = frontmatter.match(/link:\s*(.+)/);
    if (linkMatch) post.link = linkMatch[1].trim();

    const imageMatch = frontmatter.match(/image:\s*(.+)/);
    if (imageMatch) post.image = imageMatch[1].trim();
  } else {
    post.content = content;
  }

  post.content = parseSimpleMarkdown(post.content);

  return post;
}

function parseSimpleMarkdown(text) {
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/`(.+?)`/g, '<code>$1</code>');
  text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--catppuccin-mauve);">$1</a>');
  text = text.replace(/\n\n/g, '</p><p>');
  text = '<p>' + text + '</p>';

  return text;
}

function formatDate(dateString) {
  const parts = dateString.split('-');
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = parts[2];
  return `${day}-${month}-${year}`;
}

document.addEventListener('DOMContentLoaded', loadNewsPosts);
