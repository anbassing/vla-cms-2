const CMS_URL = 'https://cms.visitindonesia.co.id/wp-json/wp/v2/experience';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const slug = req.query?.slug;
  if (!slug) return res.status(400).json({ error: 'Missing experience slug' });

  try {
    const url = new URL(CMS_URL);
    url.searchParams.set('slug', String(slug));
    url.searchParams.set('per_page', '1');
    url.searchParams.set('status', 'publish');

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch (_) { data = null; }

    if (!response.ok) {
      res.status(response.status);
      res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
      return res.send(text);
    }

    if (!Array.isArray(data) || !data.length) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(data[0]);
  } catch (error) {
    return res.status(502).json({
      error: 'CMS request failed',
      message: error?.message || 'Unknown error',
    });
  }
}
