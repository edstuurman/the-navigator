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
  /**
   * Set to `false` to disable this section entirely (hides it from the header/floating menus,
   * skips building its routes/sub-streams, and removes its carousels, tag sections, and feed entries).
   */
  enabled?: boolean;
  /** Additional path prefixes that should highlight this nav item as active */
  activePrefixes?: string[];
}

export type HomePageKey =
  | 'home'
  | 'blog'
  | 'about'
  | 'now'
  | 'photography'
  | 'log'
  | 'tags'
  | 'contact';

export type FeatureKey =
  | HomePageKey
  | 'contactForm'
  | 'rss'
  | 'llms';

export interface FeaturesConfig {
  /**
   * Which section is rendered at the root `/` URL (default: `'home'`).
   * For example, set `defaultHomePage: 'blog'` to make the blog index the front page of your site.
   */
  defaultHomePage: HomePageKey;
  /** Enable the `/home` personal overview & multi-stream carousels page (`true` by default) */
  home: boolean;
  /** Enable `/about/`, career experience timeline, and author profile links (`true` by default) */
  about: boolean;
  /** Enable `/now/` current focus page (`true` by default) */
  now: boolean;
  /** Enable `/blog/`, article routes, homepage blog carousel, and tag article listings (`true` by default) */
  blog: boolean;
  /** Enable `/photography/`, photo routes, homepage photo roll, `/log/photos/`, and photo feeds (`true` by default) */
  photography: boolean;
  /** Enable `/log/`, status micro-updates, changelog stream, and homepage log carousel (`true` by default) */
  log: boolean;
  /** Enable `/tags/` topic index, `/tags/[tag]/` archive pages, and interactive tag badges (`true` by default) */
  tags: boolean;
  /** Enable `/contact/` page and contact CTAs (`true` by default) */
  contact: boolean;
  /** Enable the Formspree `<ContactForm />` on `/contact/`, `/about/`, and at the bottom of blog articles (`true` by default) */
  contactForm: boolean;
  /** Enable `/rss.xml` and `/atom.xml` syndication feeds (`true` by default) */
  rss: boolean;
  /** Enable `/llms.txt`, `/llms-full.txt`, and `/llms.json` AI discovery feeds (`true` by default) */
  llms: boolean;
}

export interface PoweredByLinkConfig {
  label: string;
  href: string;
  icon: 's3' | 'mrap' | 'cloudfront' | 'info';
  highlight?: boolean;
}

export interface HeroMetricItem {
  /** Primary metric value rendered in tabular numerals (e.g. '12+', '17', '0 KB', '100%') */
  value: string;
  /** Short descriptive label rendered beneath the metric value */
  label: string;
  /** Visual accent color for the metric value (default: 'default') */
  accent?: 'default' | 'amber' | 'emerald';
}

export interface HeroActionConfig {
  /** Button or inline link text */
  label: string;
  /** Target route or anchor (hidden automatically if the target feature route is disabled in `features`) */
  href: string;
  /** Visual weight: 'primary' (amber pill), 'secondary' (ringed pill), or 'ghost' (inline link) */
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface HeroTelemetryConfig {
  /** Render the `#edge-telemetry` pill and load CloudFront POP detection in 'metrics' mode */
  enabled: boolean;
  /** Static fallback text shown before POP detection or on non-CloudFront hosts */
  fallbackText: string;
  /** Optional suffix appended after detected POP location (e.g. 'Multi-Region Edge Mesh') */
  meshLabel?: string;
}

export interface HeroConfig {
  /**
   * Homepage hero layout mode:
   * - 'metrics': High-impact systems hero with eyebrow, headline, lead summary, metric bar, CTA pills, and optional edge telemetry pill.
   * - 'classic': Original editorial 2-column narrative card driven by `src/content/pages/home.md`.
   */
  style: 'classic' | 'metrics';
  /** Optional eyebrow override for 'metrics' mode (falls back to `home.md` `intro.eyebrow`) */
  eyebrow?: string;
  /** Optional headline override for 'metrics' mode (falls back to `home.md` `intro.heading`) */
  heading?: string;
  /** Optional bold lead-in phrase prepended to the 'metrics' lead paragraph */
  leadHighlight?: string;
  /** Optional lead paragraph override for 'metrics' mode (falls back to `home.md` `intro.leftColumn`) */
  lead?: string;
  /** Quick-facts metric bar items rendered in 'metrics' mode (recommended: 4 items) */
  metrics: HeroMetricItem[];
  /** Action CTAs rendered in 'metrics' mode (auto-filtered via `isUrlEnabled`) */
  actions?: HeroActionConfig[];
  /** Optional CloudFront edge POP telemetry pill configuration */
  telemetry?: HeroTelemetryConfig;
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
     * Optional Formspree endpoint for the message form (`src/components/ContactForm.astro`).
     * Create a free account at https://formspree.io and paste your form URL here,
     * or set `features.contactForm: false` (or leave `endpoint` empty) to disable the form.
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

  /**
   * End-to-end feature toggles and configurable root homepage.
   * Disabling a feature here (or setting `enabled: false` on its item in `navigation.items`)
   * completely disables its routes, carousels, sub-streams, tag sections, and feed entries.
   */
  features: FeaturesConfig;

  /**
   * Homepage hero layout and metrics bar configuration (`src/components/views/HomeView.astro`).
   * Set `style: 'classic'` to restore the 2-column narrative hero from `src/content/pages/home.md`.
   */
  hero: HeroConfig;

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

  features: {
    defaultHomePage: 'home',
    home: true,
    about: true,
    now: true,
    blog: true,
    photography: true,
    log: true,
    tags: true,
    contact: true,
    contactForm: true,
    rss: true,
    llms: true,
  },

  hero: {
    style: 'classic',
    eyebrow: 'Alex Mercer • Cloud & Platform Architecture',
    heading: 'Alex Mercer — Systems built to hold up under real production pressure.',
    leadHighlight: 'The Navigator',
    lead: 'is an open-source Astro 7 static architecture and engineering showcase by Alex Mercer, a Principal Cloud & Platform Architect. Built around declarative Terraform automation, optional 17-region AWS S3 MRAP + CloudFront SigV4a delivery, and zero-bloat web performance.',
    metrics: [
      { value: '12+', label: 'Years Cloud & Platform Architecture', accent: 'amber' },
      { value: '17', label: 'AWS Storage Mesh Regions (Optional)', accent: 'default' },
      { value: '0 KB', label: 'Client Framework Overhead', accent: 'default' },
      { value: '100%', label: 'Terraform-Declared & Automated', accent: 'emerald' },
    ],
    actions: [
      { label: 'Read Background', href: '/about/', variant: 'primary' },
      { label: 'Setup & Tech Articles', href: '/blog/', variant: 'secondary' },
      { label: 'Photo Roll', href: '/photography/', variant: 'ghost' },
    ],
    telemetry: {
      enabled: true,
      fallbackText: 'Static Edge Build • CloudFront POP Ready',
      meshLabel: 'Multi-Region Edge Mesh',
    },
  },

  pagination: {
    olderBlogsCount: 10,
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
    showPoweredBy: false,
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
