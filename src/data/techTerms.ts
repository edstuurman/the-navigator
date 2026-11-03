export interface TechTerm {
  term: string;
  name: string;
  definition: string;
  category: 'Hardware' | 'Storage' | 'Cloud' | 'Networking' | 'Security' | 'Virtualization' | 'Reliability' | 'DevOps' | 'AI' | 'Architecture';
  aliases?: string[];
}

export const TECH_TERMS: Record<string, TechTerm> = {
  HBA: {
    term: 'HBA',
    name: 'Host Bus Adapter',
    definition: 'A dedicated expansion card or controller that interfaces a host server directly to storage drives (SAS/SATA/NVMe) without software abstraction.',
    category: 'Hardware',
    aliases: ['Host Bus Adapter', 'HBAs'],
  },
  MRAP: {
    term: 'MRAP',
    name: 'Multi-Region Access Point',
    definition: 'An Amazon S3 global endpoint that dynamically routes client requests across multiple AWS regions using AWS Global Accelerator for lowest latency.',
    category: 'Cloud',
    aliases: ['Multi-Region Access Point', 'S3 MRAP'],
  },
  S3: {
    term: 'S3',
    name: 'Simple Storage Service',
    definition: 'Amazon Web Services scalable object storage offering 99.999999999% (11 9s) of data durability with fine-grained IAM policies and versioning.',
    category: 'Cloud',
    aliases: ['AWS S3', 'Amazon S3'],
  },
  ZFS: {
    term: 'ZFS',
    name: 'Zettabyte File System',
    definition: 'An enterprise combined file system and logical volume manager featuring copy-on-write, data integrity checksumming, snapshots, and software RAID.',
    category: 'Storage',
    aliases: ['OpenZFS'],
  },
  PCIe: {
    term: 'PCIe',
    name: 'Peripheral Component Interconnect Express',
    definition: 'High-speed serial expansion bus standard connecting high-bandwidth peripherals like NVMe SSDs, network adapters, and HBAs directly to the CPU.',
    category: 'Hardware',
    aliases: ['PCI Express'],
  },
  NVMe: {
    term: 'NVMe',
    name: 'Non-Volatile Memory Express',
    definition: 'An open logical-device interface specification engineered specifically for solid-state storage over PCIe buses, maximizing parallel I/O queues.',
    category: 'Storage',
    aliases: ['NVMe SSD'],
  },
  SAS: {
    term: 'SAS',
    name: 'Serial Attached SCSI',
    definition: 'A point-to-point enterprise storage interface protocol enabling higher signal integrity, dual-porting, and direct hardware daisy-chaining.',
    category: 'Storage',
    aliases: ['Serial Attached SCSI'],
  },
  IOPS: {
    term: 'IOPS',
    name: 'Input/Output Operations Per Second',
    definition: 'A standard computer storage benchmark measuring how many individual read or write operations a drive or storage pool can complete in one second.',
    category: 'Storage',
    aliases: ['Input/Output Operations Per Second'],
  },
  BGP: {
    term: 'BGP',
    name: 'Border Gateway Protocol',
    definition: 'The exterior gateway routing protocol that manages how packets are routed across autonomous systems (AS) forming the backbone of the Internet.',
    category: 'Networking',
    aliases: ['Border Gateway Protocol'],
  },
  CIDR: {
    term: 'CIDR',
    name: 'Classless Inter-Domain Routing',
    definition: 'A flexible IP address allocation and routing method using prefix-length slash notation (e.g. 10.0.0.0/16) to specify subnet routing masks.',
    category: 'Networking',
    aliases: ['Classless Inter-Domain Routing'],
  },
  MTU: {
    term: 'MTU',
    name: 'Maximum Transmission Unit',
    definition: 'The largest physical packet size in bytes that a network interface or intermediate link can transmit without needing IP fragmentation (standard: 1500).',
    category: 'Networking',
    aliases: ['Maximum Transmission Unit', 'Jumbo Frames'],
  },
  VLAN: {
    term: 'VLAN',
    name: 'Virtual Local Area Network',
    definition: 'An isolated broadcast domain partitioned at the data link layer (Layer 2) of a switch network, separated via 802.1Q tag headers.',
    category: 'Networking',
    aliases: ['Virtual LAN'],
  },
  SPF: {
    term: 'SPF',
    name: 'Sender Policy Framework',
    definition: 'An email authentication standard allowing domain owners to publish DNS records specifying authorized mail transfer agents (MTAs) permitted to send on their behalf.',
    category: 'Security',
    aliases: ['Sender Policy Framework'],
  },
  DKIM: {
    term: 'DKIM',
    name: 'DomainKeys Identified Mail',
    definition: 'An email authentication standard using asymmetric public-key cryptography to verify sender domain identity and ensure in-transit message tampering prevention.',
    category: 'Security',
    aliases: ['DomainKeys Identified Mail'],
  },
  DMARC: {
    term: 'DMARC',
    name: 'Domain-based Message Authentication & Conformance',
    definition: 'A security policy framework leveraging SPF and DKIM validation results to instruct receiving mail servers how to treat fraudulent or spoofed messages.',
    category: 'Security',
    aliases: ['Domain-based Message Authentication, Reporting, and Conformance'],
  },
  DNS: {
    term: 'DNS',
    name: 'Domain Name System',
    definition: 'The distributed hierarchical naming system that translates human-readable hostnames into numerical IP addresses and directs mail routing via MX records.',
    category: 'Networking',
    aliases: ['Domain Name System'],
  },
  TLS: {
    term: 'TLS',
    name: 'Transport Layer Security',
    definition: 'Cryptographic protocol operating above transport protocols to provide mutual authentication, confidentiality, and data integrity over networks.',
    category: 'Security',
    aliases: ['Transport Layer Security', 'SSL/TLS'],
  },
  IAM: {
    term: 'IAM',
    name: 'Identity & Access Management',
    definition: 'A security framework of role-based and attribute-based policies controlling which identities (users, services, or roles) can perform actions on cloud resources.',
    category: 'Security',
    aliases: ['Identity and Access Management', 'AWS IAM'],
  },
  Terraform: {
    term: 'Terraform',
    name: 'HashiCorp Terraform',
    definition: 'An open-source Infrastructure as Code (IaC) tool that provisions, manages, and versions multi-cloud resources declaratively via HashiCorp Configuration Language.',
    category: 'DevOps',
    aliases: ['Terraform IaC', 'OpenTofu'],
  },
  HCL: {
    term: 'HCL',
    name: 'HashiCorp Configuration Language',
    definition: 'A structured, human-readable declarative configuration language used by Terraform to model and orchestrate cloud infrastructure states.',
    category: 'DevOps',
    aliases: ['HashiCorp Configuration Language'],
  },
  IaC: {
    term: 'IaC',
    name: 'Infrastructure as Code',
    definition: 'The paradigm of automating IT infrastructure provisioning and configuration management through machine-readable definition files rather than manual GUIs.',
    category: 'DevOps',
    aliases: ['Infrastructure as Code'],
  },
  Proxmox: {
    term: 'Proxmox',
    name: 'Proxmox Virtual Environment',
    definition: 'An open-source Debian-based enterprise virtualization platform tightly coupling KVM hypervisors, LXC containers, ZFS storage, and clustered management.',
    category: 'Virtualization',
    aliases: ['Proxmox VE', 'PVE'],
  },
  vSAN: {
    term: 'vSAN',
    name: 'VMware Virtual SAN',
    definition: 'VMware software-defined enterprise storage that aggregates server-attached flash and magnetic storage across cluster nodes into a shared resilient datastore.',
    category: 'Storage',
    aliases: ['VMware vSAN'],
  },
  KVM: {
    term: 'KVM',
    name: 'Kernel-based Virtual Machine',
    definition: 'A full virtualization module built into the Linux kernel that turns the host operating system kernel into a hardware-assisted Type-1 hypervisor.',
    category: 'Virtualization',
    aliases: ['Kernel-based Virtual Machine'],
  },
  LXC: {
    term: 'LXC',
    name: 'Linux Containers',
    definition: 'OS-level virtualization technology providing lightweight, near-bare-metal isolated Linux user spaces using kernel cgroups and namespaces.',
    category: 'Virtualization',
    aliases: ['Linux Containers'],
  },
  TTFB: {
    term: 'TTFB',
    name: 'Time to First Byte',
    definition: 'A foundational latency performance metric measuring the elapsed time from client connection initiation to receiving the first byte of response data from the server.',
    category: 'Reliability',
    aliases: ['Time to First Byte'],
  },
  LLM: {
    term: 'LLM',
    name: 'Large Language Model',
    definition: 'Deep learning models trained on vast multimodal or text corpora utilizing transformer architectures for contextual reasoning, code generation, and agentic workflows.',
    category: 'AI',
    aliases: ['Large Language Models'],
  },
  API: {
    term: 'API',
    name: 'Application Programming Interface',
    definition: 'A formal contract of endpoints, protocols, and data schemas that enables distinct software services to exchange commands and state predictably.',
    category: 'DevOps',
    aliases: ['Application Programming Interface', 'REST API'],
  },
  SRE: {
    term: 'SRE',
    name: 'Site Reliability Engineering',
    definition: 'An engineering discipline applying software engineering practices to infrastructure and operations problems to build ultra-scalable, self-healing distributed systems.',
    category: 'Reliability',
    aliases: ['Site Reliability Engineering'],
  },
  SLO: {
    term: 'SLO',
    name: 'Service Level Objective',
    definition: 'A target reliability metric (e.g., 99.99% successful requests over 30 days) agreed upon as the threshold determining infrastructure error budgets.',
    category: 'Reliability',
    aliases: ['Service Level Objective'],
  },
  NAT: {
    term: 'NAT',
    name: 'Network Address Translation',
    definition: 'A networking technique that re-maps an entire private IP address space into a public IP address by rewriting IP headers during gateway routing.',
    category: 'Networking',
    aliases: ['Network Address Translation', 'NAT Gateway'],
  },
  IDE: {
    term: 'IDE',
    name: 'Integrated Development Environment',
    definition: 'A comprehensive software suite that consolidates source code editing, syntax highlighting, debugging tools, and build automation into a single workspace.',
    category: 'DevOps',
    aliases: ['Integrated Development Environment'],
  },
  CDN: {
    term: 'CDN',
    name: 'Content Delivery Network',
    definition: 'A geographically distributed network of edge proxy servers that caches and serves static web assets close to end-users to reduce latency and origin load.',
    category: 'Networking',
    aliases: ['Content Delivery Network', 'Edge Network'],
  },
  SSL: {
    term: 'SSL',
    name: 'Secure Sockets Layer',
    definition: 'The predecessor cryptographic protocol to TLS for encrypting network communications; commonly used as the umbrella term for SSL/TLS certificates.',
    category: 'Security',
    aliases: ['Secure Sockets Layer', 'SSL Certificate'],
  },
  ECS: {
    term: 'ECS',
    name: 'Elastic Container Service',
    definition: 'Amazon Web Services fully managed container orchestration service for running, scaling, and managing Docker containers across EC2 instances or AWS Fargate.',
    category: 'Cloud',
    aliases: ['Amazon ECS', 'AWS ECS'],
  },
  EC2: {
    term: 'EC2',
    name: 'Elastic Compute Cloud',
    definition: 'Amazon Web Services foundational infrastructure service providing scalable, resizable on-demand virtual compute instances in the cloud.',
    category: 'Cloud',
    aliases: ['Amazon EC2', 'AWS EC2'],
  },
  RDS: {
    term: 'RDS',
    name: 'Relational Database Service',
    definition: 'Amazon Web Services managed relational database service automating provisioning, storage scaling, automated backups, and patching for engines like PostgreSQL.',
    category: 'Cloud',
    aliases: ['Amazon RDS', 'AWS RDS'],
  },
  SQL: {
    term: 'SQL',
    name: 'Structured Query Language',
    definition: 'The standardized domain-specific programming language engineered for managing, querying, and updating relational databases.',
    category: 'Storage',
    aliases: ['Structured Query Language'],
  },
  DSQL: {
    term: 'DSQL',
    name: 'Amazon Aurora DSQL',
    definition: 'A serverless, distributed SQL database from AWS offering active-active multi-Region availability, PostgreSQL compatibility, and zero idle compute costs.',
    category: 'Cloud',
    aliases: ['Aurora DSQL', 'AWS DSQL'],
  },
  OAC: {
    term: 'OAC',
    name: 'Origin Access Control',
    definition: 'AWS CloudFront security mechanism that signs viewer requests with SigV4 to restrict Amazon S3 bucket access strictly to authorized CloudFront distributions.',
    category: 'Security',
    aliases: ['Origin Access Control', 'CloudFront OAC'],
  },
  SigV4: {
    term: 'SigV4',
    name: 'AWS Signature Version 4',
    definition: 'AWS standard cryptographic protocol that authenticates HTTP requests using HMAC-SHA256 signatures derived from AWS credentials and request parameters.',
    category: 'Security',
    aliases: ['Signature Version 4', 'SigV4 signing'],
  },
  SigV4A: {
    term: 'SigV4A',
    name: 'AWS Signature Version 4 Asymmetric',
    definition: 'AWS asymmetric request signing protocol using ECC public-private key pairs to authenticate multi-Region requests across S3 Multi-Region Access Points.',
    category: 'Security',
    aliases: ['Signature Version 4A', 'SigV4A signing'],
  },
  ARN: {
    term: 'ARN',
    name: 'Amazon Resource Name',
    definition: 'Standardized global identifiers that uniquely reference individual AWS resources across accounts, services, and regions (e.g. arn:aws:s3:::bucket).',
    category: 'Cloud',
    aliases: ['Amazon Resource Name'],
  },
  ACM: {
    term: 'ACM',
    name: 'AWS Certificate Manager',
    definition: 'AWS service that provisions, manages, and automatically renews public and private SSL/TLS certificates for CloudFront, ALBs, and API Gateways.',
    category: 'Security',
    aliases: ['AWS Certificate Manager'],
  },
  VMUG: {
    term: 'VMUG',
    name: 'VMware User Group',
    definition: 'An independent global organization for virtualization professionals providing VMUG Advantage subscriptions with non-production enterprise VMware licensing.',
    category: 'Virtualization',
    aliases: ['VMware User Group', 'VMUG Advantage'],
  },
  'SFP+': {
    term: 'SFP+',
    name: 'Enhanced Small Form-Factor Pluggable',
    definition: 'A compact, hot-pluggable network interface module supporting 10 Gigabit Ethernet (10GbE) over fiber-optic cabling or direct attach copper (DAC).',
    category: 'Networking',
    aliases: ['Enhanced Small Form-Factor Pluggable', 'SFP Plus'],
  },
  RAM: {
    term: 'RAM',
    name: 'Random Access Memory',
    definition: 'High-speed volatile physical memory providing near-instantaneous read and write access for applications and operating system processes running on the CPU.',
    category: 'Hardware',
    aliases: ['Random Access Memory'],
  },
  AST: {
    term: 'AST',
    name: 'Abstract Syntax Tree',
    definition: 'A tree data structure representing the syntactic hierarchy of source code, generated by compilers and parsers to analyze, optimize, or transpile code.',
    category: 'Architecture',
    aliases: ['Abstract Syntax Tree'],
  },
  FOUT: {
    term: 'FOUT',
    name: 'Flash of Unstyled Text / Theme',
    definition: 'A momentary visual artifact occurring when a webpage briefly renders default system fonts or incorrect theme colors before stylesheets or scripts execute.',
    category: 'Architecture',
    aliases: ['Flash of Unstyled Text', 'Flash of Unstyled Content', 'FOUC'],
  },
  SVG: {
    term: 'SVG',
    name: 'Scalable Vector Graphics',
    definition: 'An XML-based two-dimensional vector graphics format that renders crisp graphics at any display resolution and can be styled dynamically with CSS.',
    category: 'Architecture',
    aliases: ['Scalable Vector Graphics'],
  },
  SEO: {
    term: 'SEO',
    name: 'Search Engine Optimization',
    definition: 'The practice of structuring HTML metadata, site architecture, and content crawlability to increase organic visibility across search engine results.',
    category: 'Architecture',
    aliases: ['Search Engine Optimization'],
  },
  'JSON-LD': {
    term: 'JSON-LD',
    name: 'JavaScript Object Notation for Linked Data',
    definition: 'A W3C standard for serializing linked data using JSON to provide search engines with structured Schema.org contextual meaning about web pages.',
    category: 'Architecture',
    aliases: ['JavaScript Object Notation for Linked Data'],
  },
  JSX: {
    term: 'JSX',
    name: 'JavaScript XML',
    definition: 'A declarative syntax extension for JavaScript that allows developers to write HTML-like markup directly within component logic.',
    category: 'Architecture',
    aliases: ['JavaScript XML'],
  },
  DOM: {
    term: 'DOM',
    name: 'Document Object Model',
    definition: 'The structured in-memory tree representation of an HTML or XML document provided by browsers, allowing scripts to programmatically manipulate elements.',
    category: 'Architecture',
    aliases: ['Document Object Model'],
  },
  CLI: {
    term: 'CLI',
    name: 'Command-Line Interface',
    definition: 'A text-based user interface mechanism that processes terminal commands to interact directly with programs, operating systems, and cloud APIs.',
    category: 'DevOps',
    aliases: ['Command Line Interface'],
  },
  SSG: {
    term: 'SSG',
    name: 'Static Site Generation',
    definition: 'A web architecture where all HTML pages, scripts, and stylesheets are pre-built at compile time, eliminating server processing at request time.',
    category: 'Architecture',
    aliases: ['Static Site Generation', 'Static Site Generator'],
  },
  SSR: {
    term: 'SSR',
    name: 'Server-Side Rendering',
    definition: 'A web rendering architecture where pages are dynamically generated by an application server on demand for each incoming client HTTP request.',
    category: 'Architecture',
    aliases: ['Server-Side Rendering'],
  },
  'CI/CD': {
    term: 'CI/CD',
    name: 'Continuous Integration & Continuous Delivery',
    definition: 'DevOps automation pipeline practice that automatically compiles, tests, and deploys software changes directly to staging or production environments.',
    category: 'DevOps',
    aliases: ['Continuous Integration', 'Continuous Delivery', 'CI/CD Pipeline'],
  },
  YAML: {
    term: 'YAML',
    name: 'YAML Ain\'t Markup Language',
    definition: 'A human-friendly, indentation-sensitive data serialization language widely used for configuration files, cloud manifests, and CI/CD pipelines.',
    category: 'DevOps',
    aliases: ['YAML Ain\'t Markup Language'],
  },
  ATS: {
    term: 'ATS',
    name: 'Applicant Tracking System',
    definition: 'Automated recruitment software that parses, filters, and ranks candidate resumes based on algorithmic keyword matching and timeline continuity prior to human review.',
    category: 'Architecture',
    aliases: ['Applicant Tracking Systems', 'ATS software'],
  },
  SLA: {
    term: 'SLA',
    name: 'Service Level Agreement',
    definition: 'A contractual commitment establishing formal service availability, latency targets, and remedies between a service provider and customer.',
    category: 'Reliability',
    aliases: ['Service Level Agreement'],
  },
  IoT: {
    term: 'IoT',
    name: 'Internet of Things',
    definition: 'The collective network of physical devices equipped with sensors, controllers, and network connectivity to transmit telemetry and automate systems.',
    category: 'Hardware',
    aliases: ['Internet of Things'],
  },
  MTA: {
    term: 'MTA',
    name: 'Mail Transfer Agent',
    definition: 'Software responsible for transferring and routing electronic mail messages between sending and receiving mail servers via SMTP (e.g. Postfix, Exim).',
    category: 'Networking',
    aliases: ['Mail Transfer Agent'],
  },
  URI: {
    term: 'URI',
    name: 'Uniform Resource Identifier',
    definition: 'A standard string of characters providing an unambiguous identifier for a specific resource on a computer network or the internet.',
    category: 'Networking',
    aliases: ['Uniform Resource Identifier'],
  },
  AI: {
    term: 'AI',
    name: 'Artificial Intelligence',
    definition: 'Computer systems and neural architectures capable of reasoning, code synthesis, pattern recognition, and autonomous agentic execution.',
    category: 'AI',
    aliases: ['Artificial Intelligence'],
  },
  CloudFront: {
    term: 'CloudFront',
    name: 'Amazon CloudFront',
    definition: 'AWS global content delivery network (CDN) that securely delivers data, static assets, and APIs at low latency with edge caching and Origin Access Control.',
    category: 'Cloud',
    aliases: ['Amazon CloudFront', 'AWS CloudFront'],
  },
  AWS: {
    term: 'AWS',
    name: 'Amazon Web Services',
    definition: 'Amazon global cloud computing platform offering on-demand compute, object storage, content delivery, and managed infrastructure services across dozens of geographic regions.',
    category: 'Cloud',
    aliases: ['Amazon Web Services'],
  },
  IPv4: {
    term: 'IPv4',
    name: 'Internet Protocol Version 4',
    definition: 'The fourth revision of the Internet Protocol using 32-bit addresses (e.g. 192.0.2.1), routed via DNS A records across packet-switched networks.',
    category: 'Networking',
    aliases: ['Internet Protocol version 4'],
  },
  IPv6: {
    term: 'IPv6',
    name: 'Internet Protocol Version 6',
    definition: 'The successor Internet Protocol standard utilizing 128-bit hexadecimal addresses (routed via DNS AAAA records) to solve IPv4 address exhaustion.',
    category: 'Networking',
    aliases: ['Internet Protocol version 6'],
  },
};

const TECH_TERMS_LOOKUP = new Map<string, TechTerm>();

for (const [key, entry] of Object.entries(TECH_TERMS)) {
  TECH_TERMS_LOOKUP.set(key.toLowerCase(), entry);
  TECH_TERMS_LOOKUP.set(entry.term.toLowerCase(), entry);
  TECH_TERMS_LOOKUP.set(entry.name.toLowerCase(), entry);
  if (entry.aliases) {
    for (const alias of entry.aliases) {
      const aliasLower = alias.toLowerCase();
      if (!TECH_TERMS_LOOKUP.has(aliasLower)) {
        TECH_TERMS_LOOKUP.set(aliasLower, entry);
      }
    }
  }
}

/**
 * O(1) case-insensitive lookup for technical acronyms and industry terms
 */
export function getTechTerm(query: string): TechTerm | undefined {
  if (!query) return undefined;
  const trimmed = query.trim();
  const direct = TECH_TERMS_LOOKUP.get(trimmed.toLowerCase());
  if (direct) return direct;
  // Support pluralized acronyms like "ASTs", "HBAs", "LLMs", "VLANs"
  if (trimmed.length > 2 && trimmed.endsWith('s')) {
    return TECH_TERMS_LOOKUP.get(trimmed.slice(0, -1).toLowerCase());
  }
  return undefined;
}

