# Visit Locals — GitHub/Vercel Ready V4

Static multi-page Visit Locals website.

## Main navigation

- `/` — Home
- `/explore/` — Explore
- `/business/` — Business
- `/experience/` — Experience
- `/insight/` — Insight
- `/partner/` — Partner With Us

## Mobile navigation

All six main pages now share a responsive mobile navigation:

- Hamburger menu below XL desktop width
- Full-screen mobile navigation panel
- Active page indication
- Close button
- Escape-key close
- Automatic close after selecting a link
- Body scroll lock while the menu is open
- No horizontal overflow from the menu

## Deployment

Static website. No npm/build step is required.

Push the contents of this ZIP to the root of a GitHub repository and import that repository into Vercel.


## Visit Locals CMS connection

The Experience page reads the native WordPress REST API from `https://cms.visitindonesia.co.id/wp-json/wp/v2/experience` through Vercel serverless proxies in `/api/experiences.js` and `/api/experiences/[slug].js`. No custom WordPress API plugin or custom REST endpoint is required. The WordPress Experience post type must have **Show in REST API** enabled, as configured in ACF.
