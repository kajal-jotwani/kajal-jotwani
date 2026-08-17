import content from "@/data/content.json";

export type Accent = "violet" | "pink" | "green";

export interface Social {
  label: string;
  icon?: string;
  url: string;
}

export interface StackItem {
  name: string;
  icon: string;
}

export interface ExperienceEntry {
  id: string;
  time: string;
  title: string;
  org: string;
  short: string;
  detail: string;
  tags: string[];
  link?: { label: string; url: string };
  accent: string;
}

export interface Project {
  id: string;
  name: string;
  oneLiner: string;
  description: string;
  myWork: string;
  tags: string[];
  links: { label: string; url: string }[];
  accent: string;
}

export interface FallbackPost {
  title: string;
  link: string;
  date: string;
  snippet: string;
}

export const site = content;
export default content;
