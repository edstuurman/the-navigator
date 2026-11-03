import { themeConfig } from '../theme.config';

export interface NavItem {
  label: string;
  href: string;
  active: boolean;
}

export function getNavLinks(pathname: string): NavItem[] {
  const cleanPath = pathname.replace(/\/$/, '');

  return themeConfig.navigation.items
    .filter((item) => item.enabled !== false)
    .map((item) => {
      const cleanHref = item.href.replace(/\/$/, '');
      const matchesHref =
        cleanHref === ''
          ? cleanPath === ''
          : cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`);
      const matchesPrefix = (item.activePrefixes || []).some((prefix) =>
        cleanPath.startsWith(prefix)
      );

      return {
        label: item.label,
        href: item.href,
        active: matchesHref || matchesPrefix,
      };
    });
}
