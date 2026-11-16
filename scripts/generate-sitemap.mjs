import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SITE_URL = 'https://cinebox4u.netlify.app';

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseFirestoreField(val) {
  if (!val || typeof val !== 'object') return undefined;
  if ('stringValue' in val) return val.stringValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('timestampValue' in val) return val.timestampValue;
  return undefined;
}

function formatLastMod(rawDate) {
  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

async function fetchCollection(projectId, databaseId, collectionName) {
  const docs = [];
  let pageToken = '';

  do {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
        projectId
      )}/databases/${encodeURIComponent(databaseId)}/documents/${encodeURIComponent(collectionName)}`
    );
    url.searchParams.set('pageSize', '500');
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url.toString(), { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Firestore REST ${collectionName} returned HTTP ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data.documents)) {
        for (const doc of data.documents) {
          const id = doc.name?.split('/').pop();
          const fields = doc.fields || {};
          docs.push({
            id,
            updateTime: doc.updateTime,
            isPublished: parseFirestoreField(fields.isPublished),
            published: parseFirestoreField(fields.published),
            slug: parseFirestoreField(fields.slug),
            updatedAt: parseFirestoreField(fields.updatedAt),
            createdAt: parseFirestoreField(fields.createdAt),
            created_at: parseFirestoreField(fields.created_at),
          });
        }
      }
      pageToken = data.nextPageToken || '';
    } finally {
      clearTimeout(timer);
    }
  } while (pageToken);

  return docs;
}

export async function generateSitemapXml() {
  const configPath = path.join(ROOT_DIR, 'firebase-applet-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const projectId = config.projectId || 'cinebox4u-478d9';
  const databaseId = config.firestoreDatabaseId || '(default)';

  const today = new Date().toISOString().slice(0, 10);
  const urlEntries = new Map();

  const addEntry = (locPath, { changefreq = 'weekly', priority = '0.8', lastmod = today } = {}) => {
    const loc = locPath === '/' ? `${SITE_URL}/` : `${SITE_URL}${locPath}`;
    if (!urlEntries.has(loc)) {
      urlEntries.set(loc, { loc, changefreq, priority, lastmod });
    }
  };

  // Static public indexable pages
  addEntry('/', { changefreq: 'daily', priority: '1.0', lastmod: today });
  addEntry('/movies', { changefreq: 'daily', priority: '0.9', lastmod: today });
  addEntry('/series', { changefreq: 'daily', priority: '0.9', lastmod: today });
  addEntry('/dramas', { changefreq: 'daily', priority: '0.8', lastmod: today });
  addEntry('/trending', { changefreq: 'daily', priority: '0.8', lastmod: today });
  addEntry('/latest', { changefreq: 'daily', priority: '0.8', lastmod: today });
  addEntry('/calendar', { changefreq: 'weekly', priority: '0.7', lastmod: today });
  addEntry('/watch-party', { changefreq: 'weekly', priority: '0.6', lastmod: today });
  addEntry('/support', { changefreq: 'monthly', priority: '0.5', lastmod: today });

  let firestoreFetched = false;
  try {
    const [movies, series, categories] = await Promise.all([
      fetchCollection(projectId, databaseId, 'movies'),
      fetchCollection(projectId, databaseId, 'series'),
      fetchCollection(projectId, databaseId, 'categories'),
    ]);
    firestoreFetched = true;

    for (const cat of categories) {
      const slug = (cat.slug || cat.id || '').trim();
      if (!slug || slug.toLowerCase() === 'all') continue;
      addEntry(`/movies/${encodeURIComponent(slug)}`, {
        changefreq: 'daily',
        priority: '0.7',
        lastmod: formatLastMod(cat.updateTime) || today,
      });
    }

    for (const movie of movies) {
      if (!movie.id || movie.isPublished === false || movie.published === false) continue;
      const lastmod =
        formatLastMod(movie.updatedAt) ||
        formatLastMod(movie.createdAt) ||
        formatLastMod(movie.created_at) ||
        formatLastMod(movie.updateTime) ||
        today;
      addEntry(`/movie/${encodeURIComponent(movie.id)}`, {
        changefreq: 'weekly',
        priority: '0.8',
        lastmod,
      });
    }

    for (const show of series) {
      if (!show.id || show.isPublished === false || show.published === false) continue;
      const lastmod =
        formatLastMod(show.updatedAt) ||
        formatLastMod(show.createdAt) ||
        formatLastMod(show.created_at) ||
        formatLastMod(show.updateTime) ||
        today;
      addEntry(`/series/${encodeURIComponent(show.id)}`, {
        changefreq: 'weekly',
        priority: '0.8',
        lastmod,
      });
    }
  } catch (err) {
    console.warn(`[sitemap] Firestore fetch warning: ${err.message}. Falling back to base public routes.`);
  }

  const rows = Array.from(urlEntries.values())
    .map(
      (entry) => `  <url>
    <loc>${xmlEscape(entry.loc)}</loc>
    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>
    <changefreq>${xmlEscape(entry.changefreq)}</changefreq>
    <priority>${xmlEscape(entry.priority)}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows}
</urlset>
`;

  return { xml, count: urlEntries.size, firestoreFetched };
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  generateSitemapXml()
    .then(({ xml, count, firestoreFetched }) => {
      const targetPath = path.join(ROOT_DIR, 'public', 'sitemap.xml');
      fs.writeFileSync(targetPath, xml, 'utf-8');
      console.log(
        `[sitemap] Generated public/sitemap.xml (${count} URLs, firestore=${firestoreFetched ? 'live' : 'fallback'})`
      );
    })
    .catch((err) => {
      console.error('[sitemap] Failed:', err);
      process.exitCode = 1;
    });
}
