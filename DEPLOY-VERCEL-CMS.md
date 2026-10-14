# Visit Locals — Vercel + WordPress/ACF CMS

## Correct architecture
- Frontend: Vercel
- CMS: https://cms.visitindonesia.co.id/
- CMS REST endpoint: /wp-json/wp/v2/experience
- Vercel proxy: /api/experiences

## Important
This ZIP is already flattened. The Vercel project root must contain `api/`, `assets/`, `experience/`, `index.html`, etc. Do not deploy the parent folder around these files as the project root.

## Test after deployment
1. `/api/health` should return JSON with `ok: true`.
2. `/api/experiences` should return the published Experience records from WordPress.
3. `/experience/` should render the CMS-driven catalogue.
4. `/experience.html` is also wired to the same CMS-driven catalogue for compatibility.

## CMS
WordPress REST API and ACF are expected to remain enabled for the `experience` post type.
