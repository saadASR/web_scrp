const form = document.getElementById('scraperForm');
const urlInput = document.getElementById('url');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const errorDiv = document.getElementById('error');
const successDiv = document.getElementById('success');
const resultsDiv = document.getElementById('results');
const clearCacheLink = document.getElementById('clearCache');

// État de l'application
let isLoading = false;

/**
 * Soumettre le formulaire
 */
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    const url = urlInput.value.trim();
    
    // Validation côté client
    if (!url) {
        showError('Veuillez entrer une URL');
        return;
    }
    
    if (!isValidUrl(url)) {
        showError('URL invalide. Utilisez le format: https://example.com');
        return;
    }
    
    await scrapeUrl(url);
});

/**
 * Scraper une URL
 */
async function scrapeUrl(url) {
    setLoading(true);
    hideMessages();
    
    try {
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.details || data.error || 'Erreur lors du scraping');
        }
        
        displayResults(data);
        showSuccess('Scraping réussi ! 🎉');
        
    } catch (error) {
        console.error('Erreur:', error);
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

/**
 * Afficher les résultats
 */
function displayResults(data) {
    const {
        url,
        title,
        meta,
        headings,
        paragraphs,
        links,
        images,
        stats,
        fromCache,
        scrapedAt
    } = data;
    
    let html = `
        <div class="results-header">
            <h2>📊 Résultats du scraping</h2>
            ${fromCache ? '<span class="cache-badge">📦 Depuis le cache</span>' : ''}
        </div>
    `;
    
    // Statistiques
    html += `
        <div class="result-card">
            <div class="result-title">📈 Statistiques</div>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${stats.totalHeadings}</span>
                    <span class="stat-label">Titres</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.totalParagraphs}</span>
                    <span class="stat-label">Paragraphes</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.totalLinks}</span>
                    <span class="stat-label">Liens</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.totalImages}</span>
                    <span class="stat-label">Images</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.wordCount}</span>
                    <span class="stat-label">Mots</span>
                </div>
            </div>
        </div>
    `;
    
    // Titre de la page
    html += `
        <div class="result-card">
            <div class="result-title">📄 Titre de la page</div>
            <div class="result-content">
                <strong>${escapeHtml(title)}</strong>
            </div>
        </div>
    `;
    
    // Métadonnées
    if (meta && (meta.description || meta.keywords || meta.author)) {
        html += `
            <div class="result-card">
                <div class="result-title">🏷️ Métadonnées</div>
                <div class="meta-grid">
        `;
        
        if (meta.description) {
            html += `
                <div class="meta-item">
                    <div class="meta-label">Description</div>
                    <div class="meta-value">${escapeHtml(meta.description)}</div>
                </div>
            `;
        }
        
        if (meta.keywords) {
            html += `
                <div class="meta-item">
                    <div class="meta-label">Mots-clés</div>
                    <div class="meta-value">${escapeHtml(meta.keywords)}</div>
                </div>
            `;
        }
        
        if (meta.author) {
            html += `
                <div class="meta-item">
                    <div class="meta-label">Auteur</div>
                    <div class="meta-value">${escapeHtml(meta.author)}</div>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Titres
    if (headings && headings.length > 0) {
        html += `
            <div class="result-card">
                <div class="result-title">
                    📑 Titres
                    <span class="badge">${headings.length}</span>
                </div>
                <div class="result-content">
        `;
        
        headings.forEach(h => {
            html += `
                <div class="heading-item ${h.level}">
                    <span class="heading-level">${h.level.toUpperCase()}</span>
                    ${escapeHtml(h.text)}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Paragraphes
    if (paragraphs && paragraphs.length > 0) {
        html += `
            <div class="result-card">
                <div class="result-title">
                    📝 Paragraphes
                    <span class="badge">${paragraphs.length}</span>
                </div>
                <div class="result-content">
        `;
        
        const displayParagraphs = paragraphs.slice(0, 5);
        displayParagraphs.forEach(p => {
            const truncated = p.length > 200 ? p.substring(0, 200) + '...' : p;
            html += `<p>• ${escapeHtml(truncated)}</p>`;
        });
        
        if (paragraphs.length > 5) {
            html += `<p><em>... et ${paragraphs.length - 5} autres paragraphes</em></p>`;
        }
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Liens
    if (links && links.length > 0) {
        html += `
            <div class="result-card">
                <div class="result-title">
                    🔗 Liens
                    <span class="badge">${links.length}</span>
                </div>
                <div class="result-content">
        `;
        
        const displayLinks = links.slice(0, 10);
        displayLinks.forEach(link => {
            html += `
                <p>• <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">
                    ${escapeHtml(link.text || link.url)}
                </a></p>
            `;
        });
        
        if (links.length > 10) {
            html += `<p><em>... et ${links.length - 10} autres liens</em></p>`;
        }
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Images
    if (images && images.length > 0) {
        html += `
            <div class="result-card">
                <div class="result-title">
                    🖼️ Images
                    <span class="badge">${images.length}</span>
                </div>
                <div class="images-grid">
        `;
        
        const displayImages = images.slice(0, 12);
        displayImages.forEach(img => {
            html += `
                <div class="image-item">
                    <img src="${escapeHtml(img.src)}" 
                         alt="${escapeHtml(img.alt)}" 
                         loading="lazy"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22120%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22150%22 height=%22120%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 fill=%22%23999%22%3EImage%3C/text%3E%3C/svg%3E'">
                    ${img.alt ? `<div class="image-info">${escapeHtml(img.alt)}</div>` : ''}
                </div>
            `;
        });
        
        if (images.length > 12) {
            html += `<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);"><em>... et ${images.length - 12} autres images</em></p>`;
        }
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Informations de scraping
    html += `
        <div class="result-card">
            <div class="result-title">ℹ️ Informations</div>
            <div class="result-content">
                <p><strong>URL :</strong> <a href="${escapeHtml(url)}" target="_blank">${escapeHtml(url)}</a></p>
                <p><strong>Scraped à :</strong> ${new Date(scrapedAt).toLocaleString('fr-FR')}</p>
            </div>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
    
    // Scroll vers les résultats
    setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/**
 * Vider le cache
 */
clearCacheLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    if (!confirm('Voulez-vous vraiment vider le cache ?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/cache/clear', {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('Cache vidé avec succès ! 🗑️');
        } else {
            throw new Error(data.error || 'Erreur');
        }
    } catch (error) {
        showError('Erreur lors du vidage du cache');
    }
});

/**
 * Gestion de l'état de chargement
 */
function setLoading(loading) {
    isLoading = loading;
    submitBtn.disabled = loading;
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

/**
 * Afficher un message d'erreur
 */
function showError(message) {
    errorDiv.textContent = '❌ ' + message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
    
    // Auto-hide après 5 secondes
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Afficher un message de succès
 */
function showSuccess(message) {
    successDiv.textContent = '✅ ' + message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    
    // Auto-hide après 3 secondes
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

/**
 * Cacher les messages
 */
function hideMessages() {
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
}

/**
 * Valider une URL
 */
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Échapper le HTML pour éviter les XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Exemple d'URLs pour test (optionnel)
const exampleUrls = [
    'https://example.com',
    'https://www.wikipedia.org',
    'https://github.com'
];

// Ajouter des suggestions (optionnel)
urlInput.addEventListener('focus', () => {
    // Vous pouvez ajouter une liste de suggestions ici
});