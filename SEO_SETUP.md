# Search indexing setup

The homepage identifies Afolabi Oluwafunmilade, Afolabi Funmilade, and Fumz as the same person in its visible content, search metadata, and ProfilePage/Person structured data. Private admin and authentication pages use `noindex`.

Before deploying, set these environment variables in your hosting provider:

- `NEXT_PUBLIC_SITE_URL`: the public production origin, including `https://` (set this if moving to a custom domain). This supplies the homepage canonical URL, structured data URLs, social preview image, and sitemap. Without an override, Vercel's production domain is used, falling back to `https://fumz-portfolio.vercel.app`.
- `GOOGLE_SITE_VERIFICATION`: optional Google Search Console HTML tag verification value. Paste only the `content` value from Google's tag. You can also verify domain ownership using DNS instead.

Redeploy after changing these values. Check the published homepage source for your full name, canonical URL, and `application/ld+json`. Check that `/robots.txt` links to `/sitemap.xml` and that the sitemap contains your public homepage URL. The sitemap currently lists the homepage; project pages can be added when they render project content and individual metadata on the server.

In [Google Search Console](https://search.google.com/search-console), add and verify your domain or URL-prefix property, submit `sitemap.xml`, then use URL Inspection on the homepage and choose **Request indexing**. If prompted, use **Test live URL** to confirm Google can access the published page.

Link the portfolio from your LinkedIn and GitHub profiles, and use your full name consistently there. Google controls whether and when a page is indexed and how it ranks; a request does not guarantee inclusion or first position. See [Google's recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).
