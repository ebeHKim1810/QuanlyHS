import type { IncomingMessage, ServerResponse } from 'http';
import { forgotPasswordController } from '../../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await forgotPasswordController(req, res);
}
