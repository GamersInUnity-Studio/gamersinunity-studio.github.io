// News script for GamersInUnity Studio
// This script loads news from JSON files in /data/news/ and displays them newest first

document.addEventListener("DOMContentLoaded", function() {
    loadNews();
});

async function loadNews() {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;

    try {
        // Get the list of news files from the news index file
        const response = await fetch('/data/news/index.json');
        if (!response.ok) {
            throw new Error('Failed to load news index');
        }
        
        const newsIndex = await response.json();
        const newsFiles = newsIndex.news || [];
        
        // Load all news files in parallel
        const newsPromises = newsFiles.map(file => 
            fetch(`/data/news/${file}`)
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to load ${file}`);
                    return res.json();
                })
                .catch(error => {
                    console.warn(`Could not load news file ${file}:`, error);
                    return null;
                })
        );
        
        const newsResults = await Promise.all(newsPromises);
        
        // Filter out null results (failed loads) and sort by date (newest first)
        const validNews = newsResults
            .filter(news => news !== null)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (validNews.length === 0) {
            newsContainer.innerHTML = '<p class="no-news">No news available at the moment.</p>';
            return;
        }
        
        // Create news cards
        newsContainer.innerHTML = validNews.map(news => `
            <article class="news-card">
                <div class="news-image">
                    ${news.image ? `<img src="${news.image}" alt="${news.title}">` : ''}
                </div>
                <div class="news-content">
                    <h3 class="news-title">${news.title}</h3>
                    <div class="news-meta">
                        <span class="news-date">${formatDate(news.date)}</span>
                        ${news.author ? `<span class="news-author">By ${news.author}</span>` : ''}
                    </div>
                    <p class="news-excerpt">${news.content}</p>
                    ${news.link ? `<a href="${news.link}" class="news-link">Read more →</a>` : ''}
                </div>
            </article>
        `).join('');
        
    } catch (error) {
        console.error('Error loading news:', error);
        newsContainer.innerHTML = '<p class="error-message">Failed to load news. Please try again later.</p>';
    }
}

// Helper function to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Create news index file if it doesn't exist (for development)
async function createNewsIndex() {
    try {
        const response = await fetch('/data/news/index.json');
        if (!response.ok) {
            // Create a basic index with our sample news
            const index = {
                news: [
                    'sample-news-2026-03-20.json'
                ]
            };
            
            // In a real implementation, we would write this to the server
            // For now, we'll just use it in memory
            console.log('News index would be created:', index);
        }
    } catch (error) {
        console.warn('Could not create news index:', error);
    }
}

// Call this to initialize (commented out as we're fetching existing index)
// createNewsIndex();