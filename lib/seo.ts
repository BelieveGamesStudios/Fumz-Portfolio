// Set NEXT_PUBLIC_SITE_URL to the public production origin, including https://.
// Vercel supplies its production domain automatically when no custom URL is set.
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://fumz-portfolio.vercel.app")

export const siteUrl = configuredUrl ? new URL(configuredUrl).origin : undefined
export const fullName = "Afolabi Oluwafunmilade"
export const siteTitle = `${fullName} (Fumz) | XR & Game Developer`
export const siteDescription =
  "Explore the portfolio of Afolabi Oluwafunmilade, also known as Afolabi Funmilade or Fumz: XR and game developer creating games, immersive experiences, and 3D applications."
