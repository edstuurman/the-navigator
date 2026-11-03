import { siteConfig } from '../site.config';

export interface RecommendationItem {
  initials: string;
  paragraphs: string[];
}

export const LINKEDIN_PROFILE_URL = siteConfig.socials.linkedin ?? '';

export const featuredRecommendation: RecommendationItem = {
  initials: 'JL',
  paragraphs: [
    '“Working alongside Alex over the past three years transformed how our platform group approaches multi-region resilience and infrastructure automation. Alex has a rare ability to take deeply complex distributed systems problems and distil them into clean, maintainable Terraform and CI/CD workflows.',
    'Whenever a critical architectural decision or cross-region latency bottleneck surfaced, Alex combined rigorous first-principles diagnostics with pragmatic execution—delivering production-grade solutions without unnecessary complexity.',
    'Beyond technical depth, Alex is a generous mentor who elevates the engineering bar for everyone on the team.”',
  ],
};

export const leftStackRecommendations: RecommendationItem[] = [
  {
    initials: 'SR',
    paragraphs: [
      '“Alex is the kind of principal engineer every infrastructure organization hopes to find. From SigV4a multi-region storage routing to zero-SSR static edge delivery, every system Alex designs is fast, observable, and rock-solid.”',
    ],
  },
  {
    initials: 'MK',
    paragraphs: [
      '“Clear communicator, methodical debugger, and relentless automator. Alex turned our manual cloud provisioning into a reproducible, self-documenting GitLab CI/CD pipeline in a matter of weeks.”',
    ],
  },
];

export const midLeftRecommendation: RecommendationItem = {
  initials: 'DT',
  paragraphs: [
    '“An exceptional systems architect who pairs deep Linux and networking fundamentals with modern cloud-native patterns.”',
  ],
};

export const midRightRecommendation: RecommendationItem = {
  initials: 'EC',
  paragraphs: [
    '“Alex brings clarity, calm, and deep technical mastery to every architecture review and production incident.”',
  ],
};

export const rightStackRecommendations: RecommendationItem[] = [
  {
    initials: 'RN',
    paragraphs: [
      '“Collaborating with Alex on our global edge migration was a highlight of my career. The documentation, diagrams, and Terraform modules Alex authored remain the gold standard across our engineering org.”',
    ],
  },
  {
    initials: 'HP',
    paragraphs: [
      '“Thoughtful, proactive, and detail-oriented—Alex consistently bridges the gap between low-level infrastructure reliability and polished developer experience.”',
    ],
  },
];
