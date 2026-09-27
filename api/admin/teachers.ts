import type { IncomingMessage, ServerResponse } from 'http';
import { adminTeachersController } from '../../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await adminTeachersController(req, res);
}
