export default async function handler(req, res) {
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(
    JSON.stringify({
      name: 'Tuition Manager API',
      status: 'active',
      version: '1.0.0',
      routes: [
        '/api/health',
        '/api/login',
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/verify',
        '/api/auth/me',
        '/api/db',
        '/api/admin/teachers'
      ]
    })
  );
}
