import { handleAdminTeachersDelete } from '../../_backend.js';

export default async function handler(req, res) {
  return handleAdminTeachersDelete(req, res);
}
