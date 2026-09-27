import type { IncomingMessage, ServerResponse } from 'http';
import { registerController } from '../../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await registerController(req, res);
}
