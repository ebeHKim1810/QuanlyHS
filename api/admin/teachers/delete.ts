import type { IncomingMessage, ServerResponse } from 'http';
import { adminTeachersDeleteController } from '../../../server/controllers.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await adminTeachersDeleteController(req, res);
}
