import { handleLogout } from '../_backend.js';

export default async function handler(req, res) {
  return handleLogout(req, res);
}
