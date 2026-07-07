import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Iron Milestones — The Codex of Iron",
    short_name: "Iron Milestones",
    description:
      "Gamified strength tracking: log the big three, unlock the deeds of the iron legends.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0d130a",
    theme_color: "#141c0f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
