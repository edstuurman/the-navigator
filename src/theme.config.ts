/**
 * Theme & UI Mechanics Configuration (`theme.config.ts`)
 *
 * Controls visual styling, SVG logo geometry, navigation links, pagination sizes,
 * technical acronym tooltips, third-party integrations (Formspree, Umami), Open Graph
 * card labels, and footer options.
 *
 * Personal/site identity and author metadata live in `site.config.ts` (and are
 * merged into `themeConfig` below for convenient single-import access).
 */

import { siteConfig, type SiteIdentityConfig } from './site.config.ts';

export interface NavLinkConfig {
  label: string;
  href: string;
  /** Set to `false` to hide this route from the header and floating navigation menus */
  enabled?: boolean;
  /** Additional path prefixes that should highlight this nav item as active */
  activePrefixes?: string[];
}

export interface PoweredByLinkConfig {
  label: string;
  href: string;
  icon: 's3' | 'mrap' | 'cloudfront' | 'info';
  highlight?: boolean;
}

export interface ThemeMechanicsConfig {
  logo: {
    /** Text wordmark rendered inside the SVG logo (`src/components/Logo.astro`) */
    text: string;
    /** Accessible label for the SVG logo (defaults to `site.title`) */
    ariaLabel?: string;
    /** Letter spacing of the SVG wordmark (default: '0.22em') */
    letterSpacing?: string;
    /** Font size of the SVG wordmark in px (default: 14) */
    fontSize?: number;
    /** Whether to render the angled compass needle emblem on the underline (default: true) */
    showCompass?: boolean;
    /** Rotation angle in degrees for the compass needle (default: 42) */
    compassAngle?: number;
  };

  integrations: {
    /**
     * Formspree endpoint for the static `/contact/` form (`src/components/ContactForm.astro`).
     * Create a free account at https://formspree.io and paste your form URL here.
     */
    formspree: {
      endpoint: string;
    };

    /**
     * Optional privacy-friendly Umami Analytics (`src/components/Head.astro`).
     * Set `enabled: false` or leave `websiteId` empty to disable analytics script injection.
     */
    umami: {
      enabled: boolean;
      scriptUrl: string;
      websiteId: string;
    };
  };

  navigation: {
    /** Primary site navigation links rendered in the top bar and floating capsule menu */
    items: NavLinkConfig[];
  };

  pagination: {
    /** Number of older blog articles per page on `/blog/` */
    olderBlogsCount: number;
    /** Number of timeline entries per page on `/log/` */
    logCount: number;
    /** Number of photographs per page on `/photography/` */
    galleryCount: number;
    /** Number of cards in each homepage horizontal carousel (`#photos`, `#blog`, `#log`) */
    homepageCarouselCount: number;
  };

  openGraph: {
    /** Uppercase brand label rendered in the top-right corner of 1200x630 OG cards */
    brandLabel: string;
    /** Location pin text rendered in the bottom metadata bar of OG cards */
    locationPinLabel: string;
  };

  tooltips: {
    /** Enable technical acronym tooltips across Markdown articles and logs */
    enabled: boolean;
    /**
     * Automatically detect and wrap plain-text occurrences of dictionary terms from `src/data/techTerms.ts`
     * in Markdown without needing manual `<abbr>` tags:
     * - `'first'`: Auto-wrap the first occurrence of each term per article/entry (recommended)
     * - `'all'`: Auto-wrap every occurrence of each term
     * - `'off'`: Only upgrade explicit `<abbr>` tags
     */
    autoLink: 'first' | 'all' | 'off';
  };

  footer: {
    /** Heading for the site links column in the footer */
    siteColumnTitle: string;
    /** Show the "Powered by" infrastructure column in the footer */
    showPoweredBy: boolean;
    /** Links displayed under the "Powered by" column in the footer */
    poweredByLinks: PoweredByLinkConfig[];
    /**
     * Toggle the "Crafted by Ed Stuurman with Astro, ❤️ and 🤖 in Japan 🇯🇵" attribution line in the footer.
     * This is a free theme — feel free to set this to `false`, though it'd be cool to keep that one link!
     */
    showThemeAttribution: boolean;
  };
}

export type ThemeConfig = SiteIdentityConfig & ThemeMechanicsConfig;

export const themeMechanics: ThemeMechanicsConfig = {
  logo: {
    text: 'ALEX MERCER',
    ariaLabel: siteConfig.site.title,
    letterSpacing: '0.22em',
    fontSize: 14,
    showCompass: true,
    compassAngle: 42,
  },

  integrations: {
    formspree: {
      endpoint: 'https://formspree.io/f/your-form-id',
    },
    umami: {
      enabled: false,
      scriptUrl: 'https://cloud.umami.is/script.js',
      websiteId: '',
    },
  },

  navigation: {
    items: [
      { label: 'Home', href: '/', enabled: true },
      { label: 'About', href: '/about/', enabled: true },
      { label: 'Now', href: '/now/', enabled: true },
      { label: 'Blog', href: '/blog/', enabled: true, activePrefixes: ['/tags'] },
      { label: 'Photography', href: '/photography/', enabled: true },
      { label: 'Log', href: '/log/', enabled: true },
      { label: 'Contact', href: '/contact/', enabled: true },
    ],
  },

  pagination: {
    olderBlogsCount: 20,
    logCount: 20,
    galleryCount: 50,
    homepageCarouselCount: 7,
  },

  openGraph: {
    brandLabel: 'ALEX MERCER',
    locationPinLabel: siteConfig.author.location,
  },

  tooltips: {
    enabled: true,
    autoLink: 'first',
  },

  footer: {
    siteColumnTitle: 'Example.com',
    showPoweredBy: true,
    poweredByLinks: [
      { label: 'AWS S3', href: 'https://aws.amazon.com/s3/', icon: 's3' },
      { label: 'AWS MRAP', href: 'https://aws.amazon.com/s3/features/multi-region-access-points/', icon: 'mrap' },
      { label: 'AWS CloudFront', href: 'https://aws.amazon.com/cloudfront/', icon: 'cloudfront' },
      { label: 'Colophon', href: '/blog/2026-11-03-part-2-provisioning-aws-mrap-cloudfront-terraform-gitlab-ci/', icon: 'info', highlight: true },
    ],
    // It's a free theme — set this to `true` if you'd like to display the footer credit!
    showThemeAttribution: false,
  },
};

export const themeConfig: ThemeConfig = {
  ...siteConfig,
  ...themeMechanics,
};

export default themeConfig;
