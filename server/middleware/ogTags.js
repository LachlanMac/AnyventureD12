// server/middleware/ogTags.js
// Middleware to serve Open Graph meta tags for social media link previews

import Character from '../models/Character.js';

// Common social media bot user agents
const SOCIAL_BOTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'Slackbot-LinkExpanding',
  'Slackbot',
  'Discordbot',
  'WhatsApp',
  'TelegramBot',
  'Googlebot',
  'bingbot',
  'Applebot',
  'Pinterest',
  'Embedly',
  'Quora Link Preview',
  'Showyoubot',
  'outbrain',
  'vkShare',
  'W3C_Validator',
  'redditbot',
  'Mediapartners-Google'
];

/**
 * Check if the request is from a social media bot/crawler
 */
const isSocialBot = (userAgent) => {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return SOCIAL_BOTS.some(bot => ua.includes(bot.toLowerCase()));
};

/**
 * Escape HTML special characters to prevent XSS in meta tags
 */
const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');
};

/**
 * Middleware to intercept character page requests from social bots
 * and serve HTML with proper Open Graph meta tags
 */
export const ogTagsMiddleware = async (req, res, next) => {
  // Only intercept GET requests to character routes
  if (req.method !== 'GET') return next();

  // Check if this is a character page request
  const characterMatch = req.path.match(/^\/characters\/([a-f0-9]{24})$/i);
  if (!characterMatch) return next();

  // Only serve OG tags to social media bots
  const userAgent = req.get('User-Agent');
  if (!isSocialBot(userAgent)) return next();

  const characterId = characterMatch[1];

  try {
    const character = await Character.findById(characterId)
      .select('name race culture biography portraitUrl physicalTraits')
      .lean();

    if (!character) return next();

    // Build the meta tag content
    const siteName = 'AnyventureD12';
    const siteUrl = process.env.SITE_URL || 'https://anyventuredx.com';
    const title = escapeHtml(`${character.name} | ${siteName}`);

    // Build description from biography or character info
    // Discord shows ~300-350 chars, Twitter ~200, but we'll provide more and let them truncate
    let description = '';
    if (character.biography) {
      description = character.biography.substring(0, 500);
      if (character.biography.length > 500) description += '...';
    } else {
      const parts = [];
      if (character.race) parts.push(character.race);
      if (character.culture) parts.push(character.culture);
      if (character.physicalTraits?.gender) parts.push(character.physicalTraits.gender);
      description = parts.length > 0
        ? `A ${parts.join(' ')} character`
        : 'A character on AnyventureD12';
    }
    description = escapeHtml(description);

    // Get portrait URL - use absolute URL (fallback to site logo)
    let imageUrl = `${siteUrl}/assets/logos/Logo-2-Color-B.png`;
    if (character.portraitUrl) {
      if (character.portraitUrl.startsWith('http')) {
        imageUrl = character.portraitUrl;
      } else {
        imageUrl = `${siteUrl}${character.portraitUrl}`;
      }
    }

    const pageUrl = `${siteUrl}/characters/${characterId}`;

    // Generate the HTML with Open Graph meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>

  <!-- Open Graph Protocol -->
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:title" content="${escapeHtml(character.name)}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:alt" content="${character.portraitUrl ? `Portrait of ${escapeHtml(character.name)}` : 'AnyventureD12 Logo'}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:locale" content="en_US">

  <!-- Twitter Card (summary = small thumbnail on left, text on right) -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(character.name)}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">

  <!-- Image dimensions - smaller size for thumbnail-style preview -->
  <meta property="og:image:width" content="128">
  <meta property="og:image:height" content="128">

  <!-- Theme color for Discord embed -->
  <meta name="theme-color" content="#554182">

  <!-- Standard meta tags -->
  <meta name="description" content="${description}">
</head>
<body>
  <article>
    <h1>${escapeHtml(character.name)}</h1>
    ${character.race ? `<p><strong>Ancestry:</strong> ${escapeHtml(character.race)}</p>` : ''}
    ${character.culture ? `<p><strong>Culture:</strong> ${escapeHtml(character.culture)}</p>` : ''}
    ${character.biography ? `<p>${escapeHtml(character.biography)}</p>` : ''}
    <p><a href="${pageUrl}">View full character sheet on ${siteName}</a></p>
  </article>
</body>
</html>`;

    res.set('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('OG tags middleware error:', error);
    // On error, let the request continue to the React app
    next();
  }
};

export default ogTagsMiddleware;
