import React, { useEffect } from 'react';
import { buildSeoPayload, BuildSeoParams } from '../utils/seo';

function upsertMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  if (el.getAttribute('content') !== content) {
    el.setAttribute('content', content);
  }
}

function upsertCanonicalLink(href: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  if (link.getAttribute('href') !== href) {
    link.setAttribute('href', href);
  }
}

function upsertJsonLd(jsonLd: Record<string, unknown> | null) {
  let script = document.getElementById('cinebox-ld-json') as HTMLScriptElement | null;
  if (!jsonLd) {
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = 'cinebox-ld-json';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  const serialized = JSON.stringify(jsonLd);
  if (script.textContent !== serialized) {
    script.textContent = serialized;
  }
}

export const SeoHead: React.FC<BuildSeoParams> = ({
  currentTab,
  selectedCategorySlug,
  categories,
  searchParam,
  detailsItem,
  movies,
  series,
  settings,
}) => {
  const payload = React.useMemo(
    () =>
      buildSeoPayload({
        currentTab,
        selectedCategorySlug,
        categories,
        searchParam,
        detailsItem,
        movies,
        series,
        settings,
      }),
    [currentTab, selectedCategorySlug, categories, searchParam, detailsItem, movies, series, settings]
  );

  useEffect(() => {
    document.title = payload.title;
    upsertCanonicalLink(payload.canonicalUrl);
    upsertMetaTag('name', 'description', payload.description);
    upsertMetaTag('name', 'robots', payload.robots);

    upsertMetaTag('property', 'og:type', payload.ogType);
    upsertMetaTag('property', 'og:title', payload.ogTitle);
    upsertMetaTag('property', 'og:description', payload.ogDescription);
    upsertMetaTag('property', 'og:url', payload.ogUrl);
    upsertMetaTag('property', 'og:image', payload.ogImage);
    upsertMetaTag('property', 'og:site_name', 'CineBox4u');

    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('name', 'twitter:title', payload.twitterTitle);
    upsertMetaTag('name', 'twitter:description', payload.twitterDescription);
    upsertMetaTag('name', 'twitter:image', payload.twitterImage);

    upsertJsonLd(payload.jsonLd);
  }, [payload]);

  return null;
};
