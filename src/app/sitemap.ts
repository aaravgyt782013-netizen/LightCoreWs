import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: {
    path: string;
    priority: number;
    freq: "weekly" | "monthly";
  }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/docs", priority: 0.9, freq: "weekly" },
    { path: "/dashboard/demo", priority: 0.85, freq: "weekly" },
    { path: "/premium", priority: 0.8, freq: "weekly" },
    { path: "/status", priority: 0.75, freq: "weekly" },
    { path: "/security", priority: 0.7, freq: "monthly" },
    { path: "/privacy", priority: 0.6, freq: "monthly" },
    { path: "/terms", priority: 0.6, freq: "monthly" },
  ];
  const now = new Date();
  return routes.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
