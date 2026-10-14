# Visit Locals CMS connection

This build uses the **native WordPress REST API** from the Visit Locals CMS:

`https://cms.visitindonesia.co.id/wp-json/wp/v2/experience`

The Vercel frontend calls same-origin `/api/*` serverless functions, which proxy to the CMS. This avoids exposing WordPress credentials and avoids browser cross-origin issues.

## Architecture

CSV import → WordPress + ACF → native REST API → Vercel `/api` proxy → Visit Locals frontend

## WordPress

The Experience Custom Post Type must use:

- Post Type Key: `experience`
- Show in REST API: ON
- Namespace Route: `wp/v2`
- Controller Class: `WP_REST_Posts_Controller`

The CMS endpoint should return records at:

`https://cms.visitindonesia.co.id/wp-json/wp/v2/experience?per_page=2`

The response includes the native WordPress fields plus the ACF values under the `acf` object.

## ACF fields used by the frontend

- short_description
- full_description
- destination
- category
- hero_image
- region
- experience_type
- gallery_image_1
- gallery_image_2
- gallery_image_3
- gallery_image_4
- gallery_image_5
- duration
- price
- currency
- group_size
- meeting_point
- itinerary
- whats_included
- whats_not_included
- local_guide
- best_time_to_visit
- difficulty_level
- whatsapp_cta
- booking_url
- featured_experience
- experience_status
- know_before_you_go
- guest_guidelines
- health_and_safety

`post_title` remains the native WordPress title.

## Frontend API

The browser uses:

- `/api/experiences` — returns published Experience posts from the CMS
- `/api/experiences/{slug}` — returns one published Experience

The Experience page then renders the CMS records into the Curated Journeys catalogue and the existing detail modal.

No WordPress admin credentials or application passwords are stored in frontend JavaScript.
