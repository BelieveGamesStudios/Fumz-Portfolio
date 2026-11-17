import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  // Only advertise the public homepage; admin and authentication pages are excluded.
  return siteUrl ? [{ url: siteUrl, priority: 1 }] : []
}
