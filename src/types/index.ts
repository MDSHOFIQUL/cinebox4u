export type MediaType = 'movie' | 'series' | 'episode';
export type UserRole = 'superadmin' | 'admin' | 'editor' | 'user';
export type VideoServerType = 'mega' | 'gdrive' | 'direct' | 'hls' | 'dash';
export type VideoQuality = '4K' | '1080p' | '720p' | '480p' | '360p' | 'Auto';
export type ServerStatus = 'active' | 'broken' | 'testing' | 'degraded';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  isBanned?: boolean;
  bannedUntil?: string;
  banReason?: string;
  createdAt: string;
  lastLoginAt?: string;
  mfaEnabled?: boolean;
  mfaSecret?: string;
  currentProfileId?: string;
  subscriptionPlanId?: string;
  subscriptionStatus?: 'active' | 'cancelled' | 'expired' | 'none';
  subscriptionExpiresAt?: string;
  loginHistory?: {
    timestamp: string;
    userAgent: string;
    ip?: string;
  }[];
}

export interface ViewingProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
  pin?: string;
  language: string;
  createdAt: string;
}

export interface VideoServer {
  id: string;
  mediaId: string;
  mediaType: MediaType;
  serverName: string;
  serverType: VideoServerType;
  streamUrl: string;
  quality: VideoQuality;
  status: ServerStatus;
  priority: number;
  lastTestedAt?: string;
  latencyMs?: number;
  drmRequired?: boolean;
  drmKeySystem?: 'widevine' | 'fairplay' | 'clearkey';
  drmLicenseUrl?: string;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  src?: string;
  url?: string;
  isDefault?: boolean;
}

export interface AudioTrack {
  id: string;
  label: string;
  language: string;
  codec?: string;
  isDefault?: boolean;
}

// ================= SEASONS / PARTS / EPISODES (optional, additive) =================

/** 'series' = Season & Series Episodes, 'cartoon' = Cartoon Series Parts */
export type SeasonGroup = 'series' | 'cartoon';
/** A block can be labelled as a Season or as a Part (e.g. Season 1, Part 2) */
export type SeasonKind = 'season' | 'part';

export interface MovieEpisode {
  id: string;
  number: number;
  title?: string;
  /** Watch / stream link: direct .mp4, .m3u8, YouTube or Google Drive link */
  streamUrl?: string;
  /** Download link: direct, Google Drive or MEGA link */
  downloadUrl?: string;
  fileSize?: string;
  quality?: string;
  duration?: string;
}

export interface MovieSeason {
  id: string;
  group: SeasonGroup;
  kind: SeasonKind;
  number: number;
  title?: string;
  episodes: MovieEpisode[];
}

export interface DownloadOption {
  quality: '4K' | '1080p' | '720p' | '480p' | '360p' | string;
  formatTag?: string;
  label: string;
  resolution?: string;
  codec?: string;
  fileSize: string;
  language?: string;
  serverName: string;
  serverType: 'direct' | 'gdrive' | 'mega' | string;
  downloadUrl: string;
  isEnabled: boolean;
  downloadCount?: number;
}

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  type: 'movie';
  posterUrl: string;
  backdropUrl: string;
  mobileBackdropUrl?: string;
  description: string;
  duration: string;
  durationMinutes?: number;
  releaseYear: number;
  language: string;
  category: string;
  genres: string[];
  rating: number;
  videoQuality: VideoQuality;
  isPublished?: boolean;
  published?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  platform?: string;
  badgeQuality?: string;
  approvalStatus?: 'draft' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  scheduledPublishDate?: string;
  viewsCount: number;
  totalDownloads?: number;
  downloadsCount?: number;
  lastDownloadedAt?: string;
  downloadOptions?: DownloadOption[];
  directDownloadUrl?: string;
  megaDownloadUrl?: string;
  gdriveDownloadUrl?: string;
  director?: string;
  cast?: string[];
  releaseDate?: string;
  imdbRating?: number;
  audioInfo?: string;
  subtitleInfo?: string;
  screenshots?: string[];
  reactions?: {
    fire?: number;
    loved?: number;
    thanks?: number;
    wow?: number;
    sad?: number;
  };
  audioTracks?: AudioTrack[];
  subtitles?: SubtitleTrack[];
  videoServers?: VideoServer[];
  trailers?: { title: string; url: string; type: 'trailer' | 'teaser' }[];
  introStartTime?: number;
  introEndTime?: number;
  recapStartTime?: number;
  recapEndTime?: number;
  downloadAllowed?: boolean;
  ageRating?: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | '18+' | string;
  contentWarnings?: string[];
  seasons?: MovieSeason[];
  franchiseId?: string;
  licenseId?: string;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
}

export interface Series {
  id: string;
  title: string;
  originalTitle?: string;
  type: 'series';
  posterUrl: string;
  backdropUrl: string;
  description: string;
  releaseYear: number;
  releaseDate?: string;
  imdbRating?: number;
  audioInfo?: string;
  subtitleInfo?: string;
  screenshots?: string[];
  reactions?: {
    fire?: number;
    loved?: number;
    thanks?: number;
    wow?: number;
    sad?: number;
  };
  language: string;
  platform?: string;
  badgeQuality?: string;
  category: string;
  genres: string[];
  rating: number;
  seasonsCount: number;
  totalEpisodes: number;
  isPublished?: boolean;
  published?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  ageRating?: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | '18+' | string;
  approvalStatus?: 'draft' | 'pending' | 'approved' | 'rejected';
  scheduledPublishDate?: string;
  viewsCount: number;
  director?: string;
  cast?: string[];
  subtitles?: SubtitleTrack[];
  videoServers?: VideoServer[];
  trailers?: { title: string; url: string; type: 'trailer' | 'teaser' }[];
  franchiseId?: string;
  licenseId?: string;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
}

export interface Episode {
  id: string;
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description?: string;
  duration: string;
  thumbnail: string;
  videoServers: VideoServer[];
  subtitles?: SubtitleTrack[];
  audioTracks?: AudioTrack[];
  introStartTime?: number;
  introEndTime?: number;
  recapStartTime?: number;
  recapEndTime?: number;
  nextEpisodeId?: string;
  downloadAllowed?: boolean;
  releaseDate?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  iconName?: string;
}

export interface Language {
  id: string;
  name: string;
  code: string;
  isPopular?: boolean;
}

export interface WatchHistoryItem {
  id: string;
  userId: string;
  profileId?: string;
  mediaId: string;
  mediaType: MediaType;
  seriesId?: string;
  episodeId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  title: string;
  posterUrl: string;
  progressSeconds: number;
  totalSeconds: number;
  completed: boolean;
  category?: string;
  lastWatchedAt: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  profileId?: string;
  mediaId: string;
  mediaType: 'movie' | 'series';
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  rating: number;
  releaseYear: number;
  category?: string;
  addedAt: string;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  description: string;
  logoUrl?: string;
  faviconUrl?: string;
  homeBannerUrl?: string;
  announcement?: string;
  announcementActive?: boolean;
  maintenanceMode: boolean;
  defaultLanguage?: 'en' | 'bn';
  contactEmail: string;
  contactTelegram?: string;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
    facebook?: string;
    instagram?: string;
  };
  geoRestrictionEnabled?: boolean;
  allowedCountryCodes?: string[];
  homepageSections?: HomepageSection[];
  updatedAt: string;
}

export interface AdminLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  adminRole: UserRole;
  action: string;
  targetType: string;
  targetId?: string;
  details: string;
  timestamp: string;
}

// ================= ENTERPRISE EXTENSIONS =================

export interface ContentLicense {
  id: string;
  mediaId: string;
  mediaTitle?: string;
  title?: string;
  mediaType?: MediaType;
  contentOwner?: string;
  licensor?: string;
  licenseReference?: string;
  startDate?: string;
  licenseStart?: string;
  expirationDate?: string;
  licenseEnd?: string;
  authorizedRegions?: string[];
  territories?: string[];
  permittedPlatforms?: string[];
  streamingRights?: boolean;
  downloadRights?: boolean;
  drmRequired?: boolean;
  autoUnpublishOnExpiry?: boolean;
  status: 'active' | 'expiring_soon' | 'expired';
}

export interface WatchPartyRoom {
  id: string;
  roomCode: string;
  hostUid: string;
  hostDisplayName: string;
  mediaId: string;
  mediaTitle: string;
  streamUrl: string;
  currentTime: number;
  isPlaying: boolean;
  lastUpdated: string;
  participantCount: number;
  participants: {
    uid: string;
    displayName: string;
    avatarUrl?: string;
    isHost: boolean;
    joinedAt: string;
  }[];
  expiresAt: string;
}

export interface CommunityComment {
  id: string;
  mediaId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment?: string;
  content?: string;
  timestamp?: string;
  createdAt?: string;
  likesCount: number;
  containsSpoiler?: boolean;
  isReported?: boolean;
  reportCount?: number;
  isModerated?: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  subject: string;
  category: 'playback' | 'account' | 'billing' | 'content_request' | 'report' | 'streaming' | 'subtitles';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  message?: string;
  adminResponse?: string;
  messages?: {
    id: string;
    senderUid: string;
    senderEmail: string;
    senderRole: UserRole;
    text: string;
    timestamp: string;
  }[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price?: number;
  priceUSD?: number;
  priceBDT?: number;
  currency?: string;
  interval?: 'month' | 'year';
  qualityLimit?: VideoQuality;
  maxResolution?: VideoQuality;
  maxProfiles?: number;
  maxDevices?: number;
  features: string[];
  billingCycle?: 'monthly' | 'yearly';
  isActive?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage?: number;
  discountPercent?: number;
  maxUses?: number;
  maxRedemptions?: number;
  usedCount?: number;
  redemptionsCount?: number;
  validUntil: string;
  isActive: boolean;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail?: string;
  planId: string;
  planName?: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded' | 'completed';
  provider?: 'stripe' | 'bkash' | 'manual_demo';
  gateway?: string;
  transactionReference?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface HomepageSection {
  id: string;
  title: string;
  titleBn?: string;
  type: 'hero' | 'trending' | 'continue_watching' | 'movies' | 'series' | 'dramas' | 'custom' | 'recommended' | 'top_10' | 'latest' | 'category';
  displayOrder?: number;
  order?: number;
  enabled?: boolean;
  isVisible?: boolean;
  customContentIds?: string[];
}
