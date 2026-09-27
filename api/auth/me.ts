import type { IncomingMessage, ServerResponse } from 'http';
import { meController } from '../../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await meController(req, res);
}
