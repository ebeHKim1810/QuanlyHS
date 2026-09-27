import type { IncomingMessage, ServerResponse } from 'http';
import { dbController } from '../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await dbController(req, res);
}
