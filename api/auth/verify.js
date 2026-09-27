import { handleVerify } from '../_backend.js';

export default async function handler(req, res) {
  return handleVerify(req, res);
}
