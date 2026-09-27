import { handleUpdateProfile } from '../_backend.js';

export default async function handler(req, res) {
  return handleUpdateProfile(req, res);
}
