import type { IncomingMessage, ServerResponse } from 'http';
import { handleApiRequest } from '../server/viteMiddleware.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleApiRequest(req, res);
}
