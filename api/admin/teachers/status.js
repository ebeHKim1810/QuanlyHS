import { handleAdminTeachersStatus } from '../../_backend.js';

export default async function handler(req, res) {
  return handleAdminTeachersStatus(req, res);
}
