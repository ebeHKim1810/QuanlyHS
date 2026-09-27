import { handleResendVerification } from '../_backend.js';

export default async function handler(req, res) {
  return handleResendVerification(req, res);
}
