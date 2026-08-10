import {
  siGithub,
  siMedium,
  siPython,
  siTypescript,
  siCplusplus,
  siNodedotjs,
  siThreedotjs,
  siBlender,
  siOpengl,
  siPostgresql,
  siGit,
  siLinux,
} from "simple-icons";

const simple: Record<string, string> = {
  github: siGithub.path,
  medium: siMedium.path,
  python: siPython.path,
  typescript: siTypescript.path,
  cplusplus: siCplusplus.path,
  nodedotjs: siNodedotjs.path,
  threedotjs: siThreedotjs.path,
  blender: siBlender.path,
  opengl: siOpengl.path,
  postgresql: siPostgresql.path,
  git: siGit.path,
  linux: siLinux.path,
};

// LinkedIn isn't in simple-icons (brand policy) — classic "in" glyph, hand-set.
const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z";

const MAIL_PATH =
  "M1.5 4.5h21a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5h-21A1.5 1.5 0 010 18V6a1.5 1.5 0 011.5-1.5zm10.5 8.25L2.25 6.375v11.25h19.5V6.375L12 12.75zm0-2.25l9.3-6H2.7l9.3 6z";

export default function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const key = name.toLowerCase();
  const path = key === "linkedin" ? LINKEDIN_PATH : key === "mail" || key === "email" ? MAIL_PATH : simple[key];
  if (!path)
    return (
      <span aria-hidden className={`${className} inline-flex items-center justify-center text-[10px] font-bold`}>
        ●
      </span>
    );
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  );
}
