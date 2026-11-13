/**
 * Site & Author Identity Configuration (`site.config.ts`)
 *
 * Single source of truth for personal/site identity, author profile, headshots,
 * and social links. Separated from `theme.config.ts` (which controls UI mechanics,
 * layout, pagination, tooltips, and integrations).
 */

export interface SiteIdentityConfig {
  site: {
    /** Canonical production URL (no trailing slash) */
    url: string;
    /** Display domain name used in footer headers, OG cards, and Schema.org */
    domain: string;
    /** Default site title and brand name */
    title: string;
    /** Default meta description */
    description: string;
    /** Open Graph locale tag */
    locale: string;
    /** RSS/Atom feed language code */
    language: string;
    /**
     * IANA timezone identifier (e.g. `'America/Los_Angeles'`, `'Asia/Tokyo'`, `'Europe/Amsterdam'`)
     * used to interpret date-only frontmatter strings (`YYYY-MM-DD`) and format visible dates
     * identically across local machines and UTC CI runners.
     */
    timeZone: string;
    /** Default SEO keywords merged with page-specific tags */
    defaultKeywords: string[];
  };

  author: {
    /** Primary display name (also used as the default blog post author in `src/content.config.ts`) */
    name: string;
    /** Given name for Schema.org Person structured data */
    givenName?: string;
    /** Family/surname for Schema.org Person structured data */
    familyName?: string;
    /** Additional name / nickname for Schema.org Person structured data */
    additionalName?: string;
    /** Full or alternate name for Schema.org Person structured data */
    alternateName?: string;
    /** Image in `src/images/` used for the author avatar chip and blog author bio box */
    avatar: string;
    /** Image in `src/images/` used for the `/about/` portrait (can be the same as `avatar` or a separate file) */
    aboutImage?: string;
    /** Short subtitle shown beneath the author name in AuthorChip */
    tagline: string;
    /** Formal role title used in Schema.org Person / ProfilePage */
    jobTitle: string;
    /** Short bio used in Schema.org Person, blog author box, and LLM index endpoints */
    bio: string;
    /** Geographic location label (shown on OG cards and metadata) */
    location: string;
    /** Public contact email address */
    email: string;
    /** Core topics listed in Schema.org `knowsAbout` */
    knowsAbout: string[];
    /** Wikidata entity URL used in Schema.org Person sameAs */
    wikidata?: string;
  };

  socials: {
    github?: string;
    gitlab?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    bluesky?: string;
    mastodon?: string;
    gravatar?: string;
  };
}

export const siteConfig: SiteIdentityConfig = {
  site: {
    url: 'https://www.example.com',
    domain: 'example.com',
    title: 'Alex Mercer',
    description:
      'Alex Mercer — Principal Cloud & Platform Architect. Distributed edge systems, multi-region AWS infrastructure, Terraform automation, and architectural photography.',
    locale: 'en_US',
    language: 'en-us',
    timeZone: 'America/Los_Angeles',
    defaultKeywords: [
      'Alex Mercer',
      'example.com',
      'Platform Architect',
      'Site Reliability Engineering',
      'Terraform',
      'AWS',
      'CloudFront',
      'Astro',
      'Tailwind CSS',
    ],
  },

  author: {
    name: 'Alex Mercer',
    alternateName: 'Alexander Mercer',
    avatar: 'author.jpg',
    aboutImage: 'author.jpg',
    tagline: 'Cloud & Platform Architecture',
    jobTitle: 'Principal Cloud & Platform Architect',
    bio: 'Principal Cloud & Platform Architect specializing in multi-region edge infrastructure, declarative Terraform automation, high-throughput distributed systems, and architectural photography.',
    location: 'San Francisco, CA',
    email: 'alex@example.com',
    knowsAbout: [
      'Cloud Architecture',
      'AWS Multi-Region Infrastructure',
      'Terraform',
      'Site Reliability Engineering',
      'Linux Systems',
      'Edge Networking',
      'Static Web Architecture',
    ],
  },

  socials: {
    github: 'https://github.com',
    gitlab: 'https://gitlab.com',
    linkedin: 'https://www.linkedin.com',
    instagram: 'https://www.instagram.com',
  },
};

export default siteConfig;
