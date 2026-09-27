import { handleForgotPassword } from '../_backend.js';

export default async function handler(req, res) {
  return handleForgotPassword(req, res);
}
