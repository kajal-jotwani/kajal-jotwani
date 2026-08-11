import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.meta.title,
    short_name: site.identity.firstName,
    description: site.meta.description,
    start_url: "/",
    display: "standalone",
    background_color: "#100d16",
    theme_color: "#6d4aff",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
