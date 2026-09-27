import { handleDb } from './_backend.js';

export default async function handler(req, res) {
  return handleDb(req, res);
}
