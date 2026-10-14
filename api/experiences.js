const CMS_URL = 'https://cms.visitindonesia.co.id/wp-json/wp/v2/experience';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = new URL(CMS_URL);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('status', 'publish');

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    const body = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.send(body);
  } catch (error) {
    return res.status(502).json({
      error: 'CMS request failed',
      message: error?.message || 'Unknown error',
    });
  }
}
