import { handleResetPassword } from '../_backend.js';

export default async function handler(req, res) {
  return handleResetPassword(req, res);
}
