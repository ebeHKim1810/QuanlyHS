import type { IncomingMessage, ServerResponse } from 'http';
import { updateProfileController } from '../../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await updateProfileController(req, res);
}
