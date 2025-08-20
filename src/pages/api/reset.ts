import type { NextApiRequest, NextApiResponse } from 'next';
import { sessions } from './_store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });
  delete sessions[sessionId];
  res.json({ success: true });
}
