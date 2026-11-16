import { Movie, Series, WatchHistoryItem, FavoriteItem } from '../types';

export const KIDS_SAFE_CATEGORIES = ['animation', 'family', 'kids', 'adventure', 'fantasy', 'comedy'];
export const MATURE_AGE_RATINGS = ['18+', 'R', 'NC-17', 'TV-MA'];

export const isContentSafeForKids = (item: Movie | Series): boolean => {
  if (item.ageRating && MATURE_AGE_RATINGS.includes(item.ageRating)) {
    return false;
  }
  const cat = (item.category || '').toLowerCase();
  const genres = (item.genres || []).map((g) => g.toLowerCase());

  // If flagged mature in genre
  if (genres.some((g) => ['horror', 'thriller', 'crime', 'erotic', 'violence'].includes(g))) {
    return false;
  }

  // If in safe category or genre
  if (KIDS_SAFE_CATEGORIES.includes(cat)) return true;
  if (genres.some((g) => KIDS_SAFE_CATEGORIES.includes(g))) return true;

  // Rating default safe if PG or G
  if (item.ageRating && ['G', 'PG', 'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG'].includes(item.ageRating)) {
    return true;
  }

  return false;
};

export const filterCatalogForProfile = <T extends Movie | Series>(items: T[], isKids: boolean): T[] => {
  if (!isKids) return items;
  return items.filter((item) => isContentSafeForKids(item));
};

export const computeRecommendations = (
  allContent: (Movie | Series)[],
  watchHistory: WatchHistoryItem[],
  favorites: FavoriteItem[],
  isKids: boolean = false,
  limit: number = 12
): (Movie | Series)[] => {
  const safeContent = filterCatalogForProfile(allContent, isKids);

  // Exclude fully watched items from primary recommendation row if needed, or score them lower
  const watchedMediaIds = new Set(watchHistory.map((h) => h.mediaId));
  const favoriteMediaIds = new Set(favorites.map((f) => f.mediaId));

  // Count affinity for genres and languages
  const genreAffinity: Record<string, number> = {};
  const languageAffinity: Record<string, number> = {};
  const categoryAffinity: Record<string, number> = {};

  watchHistory.forEach((h) => {
    if (h.category) {
      categoryAffinity[h.category.toLowerCase()] = (categoryAffinity[h.category.toLowerCase()] || 0) + 3;
    }
  });

  safeContent.forEach((item) => {
    if (watchedMediaIds.has(item.id) || favoriteMediaIds.has(item.id)) {
      const weight = favoriteMediaIds.has(item.id) ? 4 : 2;
      (item.genres || []).forEach((g) => {
        genreAffinity[g.toLowerCase()] = (genreAffinity[g.toLowerCase()] || 0) + weight;
      });
      if (item.language) {
        languageAffinity[item.language.toLowerCase()] = (languageAffinity[item.language.toLowerCase()] || 0) + weight;
      }
      if (item.category) {
        categoryAffinity[item.category.toLowerCase()] = (categoryAffinity[item.category.toLowerCase()] || 0) + weight;
      }
    }
  });

  // Score candidate items
  const scored = safeContent.map((item) => {
    let score = 0;

    // High rating boost (0 to 30 pts)
    score += (item.rating || 7.0) * 3;

    // Genre affinity boost
    (item.genres || []).forEach((g) => {
      score += (genreAffinity[g.toLowerCase()] || 0) * 5;
    });

    // Category affinity boost
    if (item.category && categoryAffinity[item.category.toLowerCase()]) {
      score += categoryAffinity[item.category.toLowerCase()] * 4;
    }

    // Language affinity boost
    if (item.language && languageAffinity[item.language.toLowerCase()]) {
      score += languageAffinity[item.language.toLowerCase()] * 3;
    }

    // Release year recency bonus (0 to 15 pts)
    const yearDiff = Math.max(0, 2026 - (item.releaseYear || 2020));
    score += Math.max(0, 15 - yearDiff);

    // Featured boost
    if (item.isFeatured) score += 10;
    if (item.isTrending) score += 8;

    // Slight penalty if already in watch history
    if (watchedMediaIds.has(item.id)) {
      score -= 20;
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
};

export const getBecauseYouWatched = (
  allContent: (Movie | Series)[],
  sourceItem: Movie | Series,
  isKids: boolean = false,
  limit: number = 8
): (Movie | Series)[] => {
  const safeContent = filterCatalogForProfile(allContent, isKids).filter((item) => item.id !== sourceItem.id);
  const sourceGenres = new Set((sourceItem.genres || []).map((g) => g.toLowerCase()));
  const sourceCategory = (sourceItem.category || '').toLowerCase();

  const scored = safeContent.map((item) => {
    let score = 0;
    const itemGenres = (item.genres || []).map((g) => g.toLowerCase());
    itemGenres.forEach((g) => {
      if (sourceGenres.has(g)) score += 15;
    });
    if ((item.category || '').toLowerCase() === sourceCategory) score += 10;
    if (item.language === sourceItem.language) score += 5;
    score += (item.rating || 7.0) * 2;
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
};

export const getTop10Catalog = (
  allContent: (Movie | Series)[],
  isKids: boolean = false
): (Movie | Series)[] => {
  const safeContent = filterCatalogForProfile(allContent, isKids);
  const sorted = [...safeContent].sort((a, b) => {
    const scoreA = (a.viewsCount || 0) * 0.4 + (a.rating || 0) * 100 + (a.isTrending ? 200 : 0);
    const scoreB = (b.viewsCount || 0) * 0.4 + (b.rating || 0) * 100 + (b.isTrending ? 200 : 0);
    return scoreB - scoreA;
  });
  return sorted.slice(0, 10);
};
