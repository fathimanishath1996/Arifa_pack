import { Building2, Images, LayoutDashboard, LayoutGrid, Leaf, type LucideIcon, Mail, Package, Phone, Settings, Users, Wrench } from "lucide-react";
import type { ContentKey } from "@/lib/website-types";

export interface ContentNavItem {
  key: ContentKey;
  label: string;
  href: string;
  icon: LucideIcon;
}

/** One CMS screen per part of the website, in the same order as the page. */
export const CONTENT_NAV: ContentNavItem[] = [
  { key: "hero", label: "Hero slides", href: "/website/hero", icon: Images },
  { key: "products", label: "Products", href: "/website/products", icon: Package },
  { key: "about", label: "About", href: "/website/about", icon: Building2 },
  { key: "sustainability", label: "Sustainability", href: "/website/sustainability", icon: Leaf },
  { key: "essentials", label: "Home Essentials", href: "/website/essentials", icon: LayoutGrid },
  { key: "services", label: "Services", href: "/website/services", icon: Wrench },
  { key: "leadership", label: "Leadership", href: "/website/leadership", icon: Users },
  { key: "contact", label: "Contact", href: "/website/contact", icon: Phone },
  { key: "settings", label: "Site settings", href: "/website/settings", icon: Settings },
];

export const OVERVIEW_NAV = { label: "Overview", href: "/website", icon: LayoutDashboard };
export const MESSAGES_NAV = { label: "Messages", href: "/website/messages", icon: Mail };

export const sectionLabel = (key: ContentKey) => CONTENT_NAV.find((item) => item.key === key)?.label ?? key;
