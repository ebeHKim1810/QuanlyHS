import { handleLogin } from '../_backend.js';

export default async function handler(req, res) {
  return handleLogin(req, res);
}
