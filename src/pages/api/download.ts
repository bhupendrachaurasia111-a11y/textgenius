import type { NextApiRequest, NextApiResponse } from 'next';
import archiver from 'archiver';
import { sessions } from './_store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = req.query;
  if (!sessionId || typeof sessionId !== 'string') return res.status(400).json({ error: 'Missing sessionId' });
  const fileTree = sessions[sessionId];
  if (!fileTree) return res.status(404).json({ error: 'No site found for session' });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=website.zip');

  const archive = archiver('zip');
  Object.entries(fileTree).forEach(([filePath, file]) => {
    if (file.type.startsWith('image/') && file.content.startsWith('base64')) {
      // Decode base64 for images
      const base64 = file.content.replace(/^base64,?/, '');
      archive.append(Buffer.from(base64, 'base64'), { name: filePath });
    } else {
      archive.append(file.content, { name: filePath });
    }
  });
  archive.finalize();
  archive.pipe(res);
}
