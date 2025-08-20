import type { NextApiRequest, NextApiResponse } from 'next';
// Use require for CommonJS compatibility in Next.js API routes
const OpenAI = require('openai');
import { sessions } from './_store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { prompt, sessionId, mode, files } = req.body as { prompt: string; sessionId: string; mode?: 'generate' | 'edit'; files?: Record<string, { content: string; type: string }> };
  if (!prompt || !sessionId) return res.status(400).json({ error: 'Missing prompt or sessionId' });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'Missing OpenAI API key' });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // System prompt for multi-file, modular, scalable code
    const systemPrompt = `You are an expert web developer AI. Given a user prompt, generate a production-ready, multi-page website project. IMPORTANT:
 - Never use markdown fences or backticks in values.
 - Use relative paths without quotes around paths.
 - If you include images, include base64 data in the file content and set a proper image/* MIME type.
 - Minimize external network references.
  - Prefer generating at least 5 pages (e.g., index.html, about.html, contact.html, features.html, blog.html) with a shared styles.css and script.js.
  - Include a consistent header/navbar and footer across pages, with working links between pages.
  - Fill pages with rich, meaningful content and semantic markup, not placeholders.
  - Make sure each page is a full HTML document that can render standalone.
  - If the user requests React, produce a single-page app using React via CDN in a single index.html with components and hash-based routing, plus styles.css and script.js.
Respond ONLY in this JSON format:
{
  "files": {
    "index.html": { "content": "...", "type": "html" },
    "styles.css": { "content": "...", "type": "css" },
    "script.js": { "content": "...", "type": "js" },
    "assets/logo.png": { "content": "base64...", "type": "image/png" },
    ...
  }
}
No explanation, no markdown, just valid JSON. For large projects, create folders and multiple files as needed. Use best practices for scalable code. If the user requests a React or Next.js app, generate the appropriate file structure.`;
    // For editing, provide the current file tree context
    const userPrompt = mode === 'edit'
      ? `You will improve an existing project. Here is the current file tree as JSON {"files": {...}}. Carefully apply the user's changes across all necessary files while keeping existing functionality. Return the FULL updated file tree.
Current project:\n${JSON.stringify({ files: files || sessions[sessionId] || {} }).slice(0, 50000)}\n---\nUser request: ${prompt}`
      : prompt;
    async function callModel(currentUserPrompt: string) {
      return await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: currentUserPrompt }
        ],
        max_tokens: 8000,
        temperature: 0.1,
      });
    }

    const completion = await callModel(userPrompt);
    const content = completion.choices[0]?.message?.content || '';
    let fileTree = {};
    try {
      const parsed = JSON.parse(content);
      if (parsed.files) fileTree = parsed.files;
      else if (parsed.html || parsed.css || parsed.js) {
        // fallback for single-file output
        fileTree = {
          'index.html': { content: parsed.html || '', type: 'html' },
          'styles.css': { content: parsed.css || '', type: 'css' },
          'script.js': { content: parsed.js || '', type: 'js' },
        };
      }
    } catch (e) {
      // fallback: show error in a file
      fileTree = {
        'index.html': { content: `<pre>AI response was not valid JSON:\n${content}</pre>`, type: 'html' },
      };
    }
    // If the site is too small, try one more expansion pass
    const htmlPages = Object.keys(fileTree).filter((p: string) => p.endsWith('.html'));
    const totalChars = Object.values(fileTree).reduce((sum: number, f: any) => sum + (f?.content?.length || 0), 0);
    if (htmlPages.length < 4 || totalChars < 4000) {
      const expandPrompt = `The current project is too small. Expand it substantially: add multiple rich pages with detailed content, accessible navigation, and a cohesive design system. Keep existing files and augment them. Return the FULL updated file tree.`;
      const expanded = await callModel(`${userPrompt}\n\n${expandPrompt}\n\nCurrent project as JSON {"files": {...}}:\n${JSON.stringify({ files: fileTree }).slice(0, 50000)}`);
      const expandedContent = expanded.choices[0]?.message?.content || '';
      try {
        const parsed2 = JSON.parse(expandedContent);
        if (parsed2.files) fileTree = parsed2.files;
      } catch {}
    }

    sessions[sessionId] = fileTree;
    res.json({ files: fileTree });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'OpenAI error' });
  }
}
