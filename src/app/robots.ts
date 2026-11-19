import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/docs",
          "/premium",
          "/status",
          "/security",
          "/privacy",
          "/terms",
          "/login",
          "/dashboard/demo",
        ],
        disallow: ["/api/", "/oauth/", "/admin"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
