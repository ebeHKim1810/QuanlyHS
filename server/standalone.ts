import http from 'http';
import { handleApiRequest } from './viteMiddleware.ts';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer(async (req, res) => {
  await handleApiRequest(req, res, () => {
    // If not handled by handleApiRequest
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Endpoint not found', path: req.url }));
  });
});

server.listen(PORT, HOST, () => {
  console.log('================================================================');
  console.log(`[Tuition Manager Backend] Server is running on http://${HOST}:${PORT}`);
  console.log(`[Health Check] http://${HOST}:${PORT}/api/health`);
  console.log('================================================================');
});
