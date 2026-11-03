import { slugify } from '../utils/slugify';

export interface ExperienceItem {
  year: string;
  role: string;
  company: string;
  location: string;
  period: string;
  duration?: string;
  isCurrent?: boolean;
  progression?: string;
  highlights: string[];
  skills: string[];
}

export const experiences: ExperienceItem[] = [
  {
    year: '2024 – Present',
    role: 'Principal Cloud & Platform Architect',
    company: 'Aether Cloud Systems',
    location: 'San Francisco, CA',
    period: 'March 2024 – Present',
    isCurrent: true,
    highlights: [
      'Architected active-active multi-region AWS edge platforms utilizing S3 Multi-Region Access Points (MRAP), CloudFront SigV4a Origin Access Control, and Global Accelerator.',
      'Standardized organization-wide Terraform modules and GitLab CI/CD pipelines with native S3 state locking, cutting deployment lead times by 68%.',
      'Led reliability engineering reviews, SLO error-budget governance, and automated chaos testing across 14 global points of presence.',
    ],
    skills: ['AWS', 'Terraform', 'Infrastructure', 'CI/CD', 'Architecture'],
  },
  {
    year: '2020 – 2024',
    role: 'Staff Site Reliability Engineer',
    company: 'Veridian Edge Networks',
    location: 'Seattle, WA',
    period: 'June 2020 – February 2024',
    duration: '3 yrs 9 mos',
    progression: 'Progression: Senior SRE → Staff Site Reliability Engineer',
    highlights: [
      'Designed high-throughput observability pipelines and zero-downtime release automation supporting 40,000+ requests per second at the edge.',
      'Engineered automated TLS/ACM certificate lifecycle tooling, DNSSEC validation, and strict IAM least-privilege boundaries across production AWS accounts.',
      'Authored internal developer documentation and static architecture portals built with Astro and Tailwind CSS.',
    ],
    skills: ['AWS', 'Terraform', 'CI/CD', 'AstroJS', 'Tailwind CSS'],
  },
  {
    year: '2017 – 2020',
    role: 'Senior Systems & Virtualization Engineer',
    company: 'Helios Datacenter Solutions',
    location: 'Austin, TX',
    period: 'January 2017 – May 2020',
    duration: '3 yrs 5 mos',
    highlights: [
      'Managed hybrid bare-metal Linux clusters, Proxmox VE hypervisors, and ZFS storage pools with PCIe HBA passthrough for low-latency workloads.',
      'Automated bare-metal provisioning, BGP Anycast routing policies, and hardware health telemetry across three regional facilities.',
    ],
    skills: ['Infrastructure', 'Architecture'],
  },
];

export const experienceTagSlugs = new Set<string>(
  experiences.flatMap((exp) => exp.skills.map((skill) => slugify(skill)))
);
