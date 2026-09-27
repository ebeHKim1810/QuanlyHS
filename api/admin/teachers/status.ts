import type { IncomingMessage, ServerResponse } from 'http';
import { adminTeachersStatusController } from '../../../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await adminTeachersStatusController(req, res);
}
