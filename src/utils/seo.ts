import { Category, Movie, Series, SiteSettings } from '../types';

export const SITE_URL = 'https://cinebox4u.netlify.app';
export const SITE_NAME = 'CineBox4u';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon.svg`;

export const HOMEPAGE_TITLE = 'CineBox4u – Movies, Web Series & Entertainment';
export const HOMEPAGE_DESCRIPTION =
  'Explore movies, web series, and dramas on CineBox4u with HD & 4K playback details, multi-language support, trailers, and fast downloads.';

export interface SeoPayload {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  ogType: 'website' | 'video.movie' | 'video.tv_show';
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  jsonLd: Record<string, unknown> | null;
}

export interface ParsedRoute {
  tab: string;
  categorySlug: string;
  mediaId: string | null;
  mediaType: 'movie' | 'series' | null;
  searchQuery: string;
  isLegacyHash: boolean;
}

export function slugify(text: string): string {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalizes a path or absolute URL into a canonical absolute HTTPS URL on SITE_URL.
 * - Homepage is always https://cinebox4u.netlify.app/
 * - All other routes omit trailing slashes and strip query strings / hashes.
 */
export function normalizeCanonicalUrl(pathOrUrl: string): string {
  let cleanPath = pathOrUrl.trim();
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    try {
      const parsed = new URL(cleanPath);
      cleanPath = parsed.pathname;
    } catch {
      cleanPath = '/';
    }
  } else {
    cleanPath = cleanPath.split('?')[0].split('#')[0];
  }

  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  // Collapse duplicate slashes
  cleanPath = cleanPath.replace(/\/{2,}/g, '/');

  if (cleanPath === '/' || cleanPath === '') {
    return `${SITE_URL}/`;
  }

  cleanPath = cleanPath.replace(/\/+$/, '');
  return `${SITE_URL}${cleanPath}`;
}

export function getMediaDetailPath(item: Pick<Movie | Series, 'id' | 'type'>): string {
  const prefix = item.type === 'series' ? 'series' : 'movie';
  return `/${prefix}/${encodeURIComponent(item.id)}`;
}

export function getTabPath(tab: string, categorySlug?: string): string {
  if (!tab || tab === 'home') return '/';
  if (tab === 'movies') {
    if (categorySlug && categorySlug !== 'all') {
      return `/movies/${encodeURIComponent(categorySlug)}`;
    }
    return '/movies';
  }
  if (tab === 'series') return '/series';
  if (tab === 'dramas') return '/dramas';
  if (tab === 'trending') return '/trending';
  if (tab === 'latest') return '/latest';
  if (tab === 'calendar') return '/calendar';
  if (tab === 'watch-party') return '/watch-party';
  if (tab === 'support') return '/support';
  if (tab === 'admin') return '/admin';
  if (tab === 'watch') return '/watch';
  if (tab === 'profile' || tab === 'profile-favorites' || tab === 'profile-history') {
    return '/profile';
  }
  if (tab.startsWith('search:')) {
    const q = tab.slice('search:'.length).trim();
    return q ? `/search?q=${encodeURIComponent(q)}` : '/search';
  }
  if (tab === 'search') return '/search';
  return '/';
}

export function parseRouteFromLocation(
  pathname: string,
  hash: string,
  search: string
): ParsedRoute {
  const cleanHash = (hash || '').trim();
  const rawPath = (pathname || '/').replace(/\/{2,}/g, '/');
  const trimmedPath = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '');
  const searchParams = new URLSearchParams(search || '');
  const queryParam = searchParams.get('q') || '';

  // Legacy hash support (#admin and #movie/:id)
  if (cleanHash === '#admin') {
    return {
      tab: 'admin',
      categorySlug: '',
      mediaId: null,
      mediaType: null,
      searchQuery: '',
      isLegacyHash: true,
    };
  }

  if (cleanHash.startsWith('#movie/')) {
    const rawId = decodeURIComponent(cleanHash.slice('#movie/'.length));
    return {
      tab: 'home',
      categorySlug: '',
      mediaId: rawId || null,
      mediaType: null,
      searchQuery: '',
      isLegacyHash: true,
    };
  }

  if (trimmedPath.startsWith('/movie/')) {
    const rawId = decodeURIComponent(trimmedPath.slice('/movie/'.length));
    return {
      tab: 'movies',
      categorySlug: '',
      mediaId: rawId || null,
      mediaType: 'movie',
      searchQuery: '',
      isLegacyHash: false,
    };
  }

  if (trimmedPath.startsWith('/series/')) {
    const rawId = decodeURIComponent(trimmedPath.slice('/series/'.length));
    return {
      tab: 'series',
      categorySlug: '',
      mediaId: rawId || null,
      mediaType: 'series',
      searchQuery: '',
      isLegacyHash: false,
    };
  }

  if (trimmedPath.startsWith('/movies/')) {
    const slug = decodeURIComponent(trimmedPath.slice('/movies/'.length));
    return {
      tab: 'movies',
      categorySlug: slug,
      mediaId: null,
      mediaType: null,
      searchQuery: '',
      isLegacyHash: false,
    };
  }

  switch (trimmedPath) {
    case '/movies':
      return { tab: 'movies', categorySlug: 'all', mediaId: null, mediaType: null, searchQuery: '', isLegacyHash: false };
    case '/series':
      return { tab: 'series', categorySlug: '', mediaId: null, mediaType: null, searchQuery: '', isLegacyHash: false };
    case '/dramas':
      return { tab: 'dramas', categorySlug: '', mediaId: null, mediaType: null, searchQuery: '', isLegacyHash: false };
    case '/trending':
      return { tab: 'trending', categorySlug: '', mediaId: null, mediaType: null, searchQuery: '', isLegacyHash: false };
    case '/latest':
      return { tab: 'latest', categorySlug: '', mediaId: null, mediaType: null, searchQuery: '', isLegacyHash: false };
    case '/calendar':
      return { tab: 'calendar', categorySlug: '', mediaId: null, mediaType: null, searchQuery: '', isLegacyHash: false };
    case '/watch-party':
      return { tab: 'watch-party', categorySlug: '', mediaId: null, mediaType: null, searchQuery: '', isLegacyHash: false };
    case '/support':
      return { tab: 'support', categorySlug: '', mediaId: null, mediaType: null, searchQuery: '', isLegacyHash: false };
    case '/search':
      return { tab: 'search', categorySlug: '', mediaId: null, mediaType: null, searchQuery: queryParam, isLegacyHash: false };
    case '/profile':
      return { tab: 'profile', categorySlug: '', mediaId: null, mediaType: null, searchQuery: '', isLegacyHash: false };
    case '/admin':
      return { tab: 'admin', categorySlug: '', mediaId: null, mediaType: null, searchQuery: '', isLegacyHash: false };
    case '/watch':
      return { tab: 'watch', categorySlug: '', mediaId: null, mediaType: null, searchQuery: '', isLegacyHash: false };
    default:
      return { tab: 'home', categorySlug: '', mediaId: null, mediaType: null, searchQuery: '', isLegacyHash: false };
  }
}

function truncateDescription(text: string, maxLen = 158): string {
  const cleaned = (text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trimEnd()}…`;
}

function formatIsoDuration(durationMinutes?: number, durationText?: string): string | undefined {
  if (typeof durationMinutes === 'number' && durationMinutes > 0) {
    const hrs = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    if (hrs > 0 && mins > 0) return `PT${hrs}H${mins}M`;
    if (hrs > 0) return `PT${hrs}H`;
    return `PT${mins}M`;
  }
  if (!durationText) return undefined;
  const hmMatch = durationText.match(/(\d+)\s*h(?:\w*)?\s*(?:(\d+)\s*m)?/i);
  if (hmMatch) {
    const h = Number(hmMatch[1]);
    const m = hmMatch[2] ? Number(hmMatch[2]) : 0;
    if (h > 0 && m > 0) return `PT${h}H${m}M`;
    if (h > 0) return `PT${h}H`;
  }
  const mOnly = durationText.match(/^(\d+)\s*m(?:in)?/i);
  if (mOnly) {
    const m = Number(mOnly[1]);
    if (m > 0) return `PT${m}M`;
  }
  return undefined;
}

function resolveValidDatePublished(releaseDate?: string, releaseYear?: number): string | undefined {
  if (releaseDate && /^\d{4}-\d{2}-\d{2}/.test(releaseDate.trim())) {
    return releaseDate.trim().slice(0, 10);
  }
  if (typeof releaseYear === 'number' && releaseYear >= 1900 && releaseYear <= 2100) {
    return String(releaseYear);
  }
  return undefined;
}

function pickSafeImageUrl(url?: string): string {
  const trimmed = (url || '').trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return `${SITE_URL}${trimmed}`;
  }
  return DEFAULT_OG_IMAGE;
}

export interface BuildSeoParams {
  currentTab: string;
  selectedCategorySlug: string;
  categories: Category[];
  searchParam: string;
  detailsItem: Movie | Series | null;
  movies: Movie[];
  series: Series[];
  settings?: SiteSettings;
}

export function buildSeoPayload({
  currentTab,
  selectedCategorySlug,
  categories,
  searchParam,
  detailsItem,
  movies,
  series,
  settings,
}: BuildSeoParams): SeoPayload {
  const organizationNode = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      url: settings?.logoUrl ? pickSafeImageUrl(settings.logoUrl) : DEFAULT_OG_IMAGE,
    },
  };

  const websiteNode = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // 1. Detail page (Movie or TVSeries)
  if (detailsItem) {
    const isPublished = detailsItem.isPublished !== false && detailsItem.published !== false;
    const isMovie = detailsItem.type === 'movie';
    const canonicalUrl = normalizeCanonicalUrl(getMediaDetailPath(detailsItem));
    const yearSuffix = detailsItem.releaseYear ? ` (${detailsItem.releaseYear})` : '';
    const title = `${detailsItem.title}${yearSuffix} – ${SITE_NAME}`;

    const rawDesc =
      detailsItem.description ||
      `${detailsItem.title}${yearSuffix}${detailsItem.language ? ` in ${detailsItem.language}` : ''}${
        detailsItem.category ? ` — ${detailsItem.category}` : ''
      } on CineBox4u.`;
    const description = truncateDescription(rawDesc) || HOMEPAGE_DESCRIPTION;
    const ogImage = pickSafeImageUrl(detailsItem.backdropUrl || detailsItem.posterUrl);
    const robots = isPublished
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, nofollow';

    const parentTab = isMovie ? 'movies' : 'series';
    const parentLabel = isMovie ? 'Movies' : 'Web Series';
    const parentUrl = normalizeCanonicalUrl(getTabPath(parentTab));

    const breadcrumbNode = {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: parentLabel,
          item: parentUrl,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: detailsItem.title,
          item: canonicalUrl,
        },
      ],
    };

    const webPageNode = {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: title,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: ogImage,
      },
    };

    // Build genuine Movie or TVSeries schema strictly from real database fields
    const genres = (detailsItem.genres || []).filter(Boolean);
    const genreField = genres.length > 0 ? genres : detailsItem.category ? [detailsItem.category] : undefined;
    const datePublished = resolveValidDatePublished(detailsItem.releaseDate, detailsItem.releaseYear);
    const castList = (detailsItem.cast || []).filter(Boolean);
    const directorName = (detailsItem.director || '').trim();

    let mediaSchemaNode: Record<string, unknown>;
    if (isMovie) {
      const movie = detailsItem as Movie;
      const isoDuration = formatIsoDuration(movie.durationMinutes, movie.duration);
      mediaSchemaNode = {
        '@type': 'Movie',
        '@id': `${canonicalUrl}#movie`,
        url: canonicalUrl,
        name: movie.title,
        ...(movie.originalTitle && movie.originalTitle !== movie.title ? { alternateName: movie.originalTitle } : {}),
        ...(movie.description ? { description: truncateDescription(movie.description, 300) } : {}),
        ...(movie.posterUrl || movie.backdropUrl ? { image: pickSafeImageUrl(movie.posterUrl || movie.backdropUrl) } : {}),
        ...(datePublished ? { datePublished } : {}),
        ...(genreField ? { genre: genreField } : {}),
        ...(movie.language ? { inLanguage: movie.language } : {}),
        ...(isoDuration ? { duration: isoDuration } : {}),
        ...(directorName ? { director: { '@type': 'Person', name: directorName } } : {}),
        ...(castList.length > 0 ? { actor: castList.map((name) => ({ '@type': 'Person', name })) } : {}),
      };
    } else {
      const tv = detailsItem as Series;
      mediaSchemaNode = {
        '@type': 'TVSeries',
        '@id': `${canonicalUrl}#tvseries`,
        url: canonicalUrl,
        name: tv.title,
        ...(tv.originalTitle && tv.originalTitle !== tv.title ? { alternateName: tv.originalTitle } : {}),
        ...(tv.description ? { description: truncateDescription(tv.description, 300) } : {}),
        ...(tv.posterUrl || tv.backdropUrl ? { image: pickSafeImageUrl(tv.posterUrl || tv.backdropUrl) } : {}),
        ...(datePublished ? { startDate: datePublished } : {}),
        ...(genreField ? { genre: genreField } : {}),
        ...(tv.language ? { inLanguage: tv.language } : {}),
        ...(typeof tv.seasonsCount === 'number' && tv.seasonsCount > 0 ? { numberOfSeasons: tv.seasonsCount } : {}),
        ...(typeof tv.totalEpisodes === 'number' && tv.totalEpisodes > 0 ? { numberOfEpisodes: tv.totalEpisodes } : {}),
        ...(directorName ? { director: { '@type': 'Person', name: directorName } } : {}),
        ...(castList.length > 0 ? { actor: castList.map((name) => ({ '@type': 'Person', name })) } : {}),
      };
    }

    return {
      title,
      description,
      canonicalUrl,
      robots,
      ogType: isMovie ? 'video.movie' : 'video.tv_show',
      ogTitle: title,
      ogDescription: description,
      ogUrl: canonicalUrl,
      ogImage,
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: ogImage,
      jsonLd: isPublished
        ? {
            '@context': 'https://schema.org',
            '@graph': [organizationNode, websiteNode, webPageNode, breadcrumbNode, mediaSchemaNode],
          }
        : null,
    };
  }

  // 2. Private / non-indexable utility routes
  const isPrivateRoute =
    currentTab === 'admin' ||
    currentTab === 'profile' ||
    currentTab === 'profile-favorites' ||
    currentTab === 'profile-history' ||
    currentTab === 'search' ||
    currentTab === 'watch';

  if (isPrivateRoute) {
    const routeTitles: Record<string, string> = {
      admin: 'Admin Portal – CineBox4u',
      profile: 'My Profile & Watchlist – CineBox4u',
      'profile-favorites': 'My Watchlist – CineBox4u',
      'profile-history': 'Watch History – CineBox4u',
      search: searchParam ? `Search: ${searchParam} – CineBox4u` : 'Search Catalog – CineBox4u',
      watch: 'Watch Player – CineBox4u',
    };
    const title = routeTitles[currentTab] || `${SITE_NAME}`;
    const canonicalUrl = normalizeCanonicalUrl(getTabPath(currentTab, selectedCategorySlug));
    const description = `Access your ${SITE_NAME} workspace.`;
    return {
      title,
      description,
      canonicalUrl,
      robots: 'noindex, nofollow',
      ogType: 'website',
      ogTitle: title,
      ogDescription: description,
      ogUrl: canonicalUrl,
      ogImage: DEFAULT_OG_IMAGE,
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: DEFAULT_OG_IMAGE,
      jsonLd: null,
    };
  }

  // 3. Indexable public pages (Homepage + category / browse routes)
  let title = HOMEPAGE_TITLE;
  let description = HOMEPAGE_DESCRIPTION;
  let breadcrumbName = 'Home';
  const canonicalUrl = normalizeCanonicalUrl(getTabPath(currentTab, selectedCategorySlug));

  const publishedMovies = movies.filter((m) => m.isPublished !== false && m.published !== false);
  const publishedSeries = series.filter((s) => s.isPublished !== false && s.published !== false);
  const featuredHero = publishedMovies.find((m) => m.isFeatured) || publishedMovies[0];
  const heroImage = featuredHero ? pickSafeImageUrl(featuredHero.backdropUrl || featuredHero.posterUrl) : DEFAULT_OG_IMAGE;

  if (currentTab === 'movies') {
    const matchedCat =
      selectedCategorySlug && selectedCategorySlug !== 'all'
        ? categories.find(
            (c) =>
              c.slug.toLowerCase() === selectedCategorySlug.toLowerCase() ||
              c.name.toLowerCase() === selectedCategorySlug.toLowerCase()
          )
        : undefined;

    if (matchedCat) {
      title = `${matchedCat.name} Movies – ${SITE_NAME}`;
      description = truncateDescription(
        matchedCat.description ||
          `Browse ${matchedCat.name} movies on CineBox4u with HD & 4K playback details, multi-language audio, and fast downloads.`
      );
      breadcrumbName = `${matchedCat.name} Movies`;
    } else if (selectedCategorySlug && selectedCategorySlug !== 'all') {
      title = `${selectedCategorySlug} Movies – ${SITE_NAME}`;
      description = truncateDescription(
        `Explore ${selectedCategorySlug} movies on CineBox4u with HD & 4K quality options and multi-server details.`
      );
      breadcrumbName = `${selectedCategorySlug} Movies`;
    } else {
      title = `Movies Catalog – ${SITE_NAME}`;
      description = truncateDescription(
        `Browse ${publishedMovies.length > 0 ? `${publishedMovies.length}+ ` : ''}movies across Hindi, Bangla, English, Tamil, and anime genres on CineBox4u.`
      );
      breadcrumbName = 'Movies';
    }
  } else if (currentTab === 'series') {
    title = `Web Series & Seasons – ${SITE_NAME}`;
    description = truncateDescription(
      `Watch and explore ${publishedSeries.length > 0 ? `${publishedSeries.length}+ ` : ''}web series, seasons, and full episode guides on CineBox4u.`
    );
    breadcrumbName = 'Web Series';
  } else if (currentTab === 'dramas') {
    title = `K-Dramas & Asian Series – ${SITE_NAME}`;
    description = truncateDescription(
      'Discover popular Korean, Asian, and Bangla dramas on CineBox4u with episode details and multi-language subtitle info.'
    );
    breadcrumbName = 'Dramas';
  } else if (currentTab === 'trending') {
    title = `Trending Movies & Series – ${SITE_NAME}`;
    description = truncateDescription(
      'See the most popular and trending movies and web series right now on CineBox4u.'
    );
    breadcrumbName = 'Trending';
  } else if (currentTab === 'latest') {
    title = `Latest Releases – ${SITE_NAME}`;
    description = truncateDescription(
      'Explore the newest movie and web series releases added to the CineBox4u catalog.'
    );
    breadcrumbName = 'Latest Releases';
  } else if (currentTab === 'calendar') {
    title = `Release Calendar & Schedule – ${SITE_NAME}`;
    description = truncateDescription(
      'Track upcoming and recently released movies and web series episodes by release date on CineBox4u.'
    );
    breadcrumbName = 'Calendar';
  } else if (currentTab === 'watch-party') {
    title = `Watch Party Rooms – ${SITE_NAME}`;
    description = truncateDescription(
      'Host or join synchronized group streaming rooms with friends using CineBox4u Watch Party.'
    );
    breadcrumbName = 'Watch Party';
  } else if (currentTab === 'support') {
    title = `Help & Support Center – ${SITE_NAME}`;
    description = truncateDescription(
      'Get assistance with playback, requests, subtitles, and account questions at the CineBox4u Support Center.'
    );
    breadcrumbName = 'Support';
  }

  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${SITE_URL}/`,
    },
  ];
  if (currentTab !== 'home') {
    if (currentTab === 'movies' && selectedCategorySlug && selectedCategorySlug !== 'all') {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Movies',
        item: `${SITE_URL}/movies`,
      });
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 3,
        name: breadcrumbName,
        item: canonicalUrl,
      });
    } else {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 2,
        name: breadcrumbName,
        item: canonicalUrl,
      });
    }
  }

  const breadcrumbNode = {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: breadcrumbItems,
  };

  const webPageNode = {
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: title,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
  };

  const ogImage = currentTab === 'home' ? heroImage : DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    canonicalUrl,
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    ogType: 'website',
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonicalUrl,
    ogImage,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [organizationNode, websiteNode, webPageNode, breadcrumbNode],
    },
  };
}
