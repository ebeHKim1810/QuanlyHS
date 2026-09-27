import type { IncomingMessage, ServerResponse } from 'http';
import { healthController } from '../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await healthController(req, res);
}
