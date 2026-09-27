import type { IncomingMessage, ServerResponse } from 'http';
import { verifyEmailController } from '../../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await verifyEmailController(req, res);
}
