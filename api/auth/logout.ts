import type { IncomingMessage, ServerResponse } from 'http';
import { logoutController } from '../../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await logoutController(req, res);
}
