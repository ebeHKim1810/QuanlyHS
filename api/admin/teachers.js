import { handleAdminTeachers } from '../_backend.js';

export default async function handler(req, res) {
  return handleAdminTeachers(req, res);
}
