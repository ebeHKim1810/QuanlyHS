import type { IncomingMessage, ServerResponse } from 'http';
import { loginController } from '../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await loginController(req, res);
}
