import type { IncomingMessage, ServerResponse } from 'http';
import { resendVerificationController } from '../../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await resendVerificationController(req, res);
}
