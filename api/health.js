export default function handler(req, res) {
  res.status(200).json({ ok: true, service: 'visit-locals-vercel-api', cmsProxy: '/api/experiences' });
}
