/** Image source: a path under /public (e.g. "/images/logo/logo-600-600.png") or an uploaded data URL. */
export type ImageSource = string;

/** Shared by every editable list, so items can be hidden without being deleted. */
export interface ListItem {
  id: string;
  isVisible: boolean;
}

export interface SiteSettings {
  brandName: string;
  logo: ImageSource;
  pageTitle: string;
  metaDescription: string;
}

export interface HeroSlide extends ListItem {
  /** Line breaks are kept, so the title can sit on several lines. */
  title: string;
  tagline: string;
  subtext: string;
  image: ImageSource;
  productsButtonLabel: string;
  contactButtonLabel: string;
}

export interface Product extends ListItem {
  name: string;
  /** Whole stars, 1–5. */
  rating: number;
  description: string;
  image: ImageSource;
}

export interface AboutSection {
  productsHeading: string;
  companyName: string;
  heading: string;
  /** Shown after the brand name, e.g. "ARIFA PACK specializes in …". */
  intro: string;
  paragraphs: string[];
  image: ImageSource;
  pillars: string[];
}

export interface TitledText extends ListItem {
  title: string;
  /** Wrap words in **double stars** to show them in bold. */
  text: string;
}

export interface SustainabilitySection {
  eyebrow: string;
  heading: string;
  statValue: string;
  statText: string;
  features: TitledText[];
}

export interface EssentialsCategory extends ListItem {
  title: string;
  icon: ImageSource;
  items: string[];
}

export interface EssentialsSection {
  heading: string;
  categories: EssentialsCategory[];
}

export interface ServicesSection {
  heading: string;
  intro: string;
  services: TitledText[];
  buttonLabel: string;
}

export interface TeamMember extends ListItem {
  name: string;
  role: string;
  photo: ImageSource;
}

export interface LeadershipSection {
  eyebrow: string;
  heading: string;
  members: TeamMember[];
}

export interface ContactSection {
  eyebrow: string;
  heading: string;
  headOfficeAddress: string;
  headOfficePhone: string;
  headOfficeEmail: string;
  divisionName: string;
  divisionAddress: string;
  divisionPhone: string;
  divisionEmail: string;
  submitLabel: string;
}

/** Everything the website shows. The CMS edits a draft copy and publishes it as a whole. */
export interface SiteContent {
  settings: SiteSettings;
  hero: HeroSlide[];
  products: Product[];
  about: AboutSection;
  sustainability: SustainabilitySection;
  essentials: EssentialsSection;
  services: ServicesSection;
  leadership: LeadershipSection;
  contact: ContactSection;
}

export type ContentKey = keyof SiteContent;

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: string;
  isRead: boolean;
}
