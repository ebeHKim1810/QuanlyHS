import type { IncomingMessage, ServerResponse } from 'http';
import { resetPasswordController } from '../../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await resetPasswordController(req, res);
}
