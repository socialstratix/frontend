export type SocialPlatform = 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'x';

const PLATFORM_URL_PATTERNS: Record<SocialPlatform, RegExp[]> = {
  instagram: [
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^\/\?#]+)/i,
    /(?:https?:\/\/)?(?:www\.)?instagr\.am\/([^\/\?#]+)/i,
  ],
  facebook: [
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^\/\?#]+)/i,
    /(?:https?:\/\/)?(?:www\.)?fb\.com\/([^\/\?#]+)/i,
  ],
  tiktok: [
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([^\/\?#]+)/i,
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/([^\/\?#]+)/i,
  ],
  x: [
    /(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/([^\/\?#]+)/i,
  ],
  youtube: [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([^\/\?#]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/c\/([^\/\?#]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/([^\/\?#]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/user\/([^\/\?#]+)/i,
  ],
};

function isProfileUrl(value: string): boolean {
  const t = (value || '').trim();
  return t.startsWith('http://') || t.startsWith('https://') || /\.com\/.+/.test(t);
}

function extractUsernameFromUrl(platform: SocialPlatform, url: string): string | null {
  const trimmed = (url || '').trim();
  if (!trimmed) return null;
  for (const re of PLATFORM_URL_PATTERNS[platform]) {
    const m = trimmed.match(re);
    if (m?.[1]) return m[1].replace(/\/$/, '');
  }
  return null;
}

function buildProfileUrl(platform: SocialPlatform, username: string): string {
  const u = (username || '').trim().replace(/^@+/, '');
  if (!u) return '';
  switch (platform) {
    case 'instagram': return `https://instagram.com/${u}`;
    case 'facebook': return `https://facebook.com/${u}`;
    case 'tiktok': return `https://tiktok.com/@${u}`;
    case 'x': return `https://x.com/${u}`;
    case 'youtube': return `https://youtube.com/@${u}`;
    default: return `https://${platform}.com/${u}`;
  }
}

export interface NormalizedSocial {
  username: string;
  profileUrl: string;
}

/**
 * Normalize input that can be username or profile URL.
 * Extracts username from URL when needed; builds profileUrl from username when input is username.
 */
export function normalizeSocialInput(
  platform: SocialPlatform,
  usernameOrUrl: string
): NormalizedSocial | null {
  const input = (usernameOrUrl || '').trim();
  if (!input) return null;

  if (isProfileUrl(input)) {
    const username = extractUsernameFromUrl(platform, input);
    if (!username) return null;
    const profileUrl = input.replace(/\?.*$/, '').replace(/\/+$/, '');
    return { username, profileUrl };
  }

  const username = input.replace(/^@+/, '');
  if (!username) return null;
  return { username, profileUrl: buildProfileUrl(platform, username) };
}
