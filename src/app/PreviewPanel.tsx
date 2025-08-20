'use client';

import React, { useEffect, useRef } from 'react';

interface FileTree {
  [filePath: string]: { content: string; type: string };
}

function stripCodeFences(text: string): string {
  return text.replace(/```[a-zA-Z]*\n?[\s\S]*?```/g, (m) => m.replace(/```[a-zA-Z]*\n?|```/g, ''));
}

function extractBodyContent(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) return bodyMatch[1];
  // If no body tags, return as-is
  return html;
}

function buildHTML(files?: FileTree, fallbackHtml?: string, fallbackCss?: string, fallbackJs?: string): string {
  let body = '';
  let css = '';
  let js = '';

  if (files) {
    const idx = files['index.html']?.content || '';
    body = extractBodyContent(stripCodeFences(idx));
    css = files['styles.css']?.content || '';
    js = files['script.js']?.content || '';

    // Inline asset images as data URLs
    const assetEntries = Object.entries(files).filter(([p, f]) => f.type?.startsWith('image/'));
    for (const [path, file] of assetEntries) {
      const dataUrl = `data:${file.type};base64,${file.content.replace(/^base64,?/, '')}`;
      const simplePath = path.replace(/^\.\//, '');
      // Replace both single and double-quoted references
      body = body.replace(new RegExp(simplePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), dataUrl);
    }
  } else {
    body = fallbackHtml || '';
    css = fallbackCss || '';
    js = fallbackJs || '';
  }

  return `<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/><style>${css}</style></head><body>${body}<script>${js}<\/script></body></html>`;
}

export default function PreviewPanel({ files, html, css, js, previewPath }: { files?: FileTree; html?: string; css?: string; js?: string; previewPath?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (!doc) return;
      let useFiles = files;
      let fHtml = html;
      let fCss = css;
      let fJs = js;
      if (files && previewPath && files[previewPath]) {
        // Build from specific html path and sibling assets
        const folder = previewPath.includes('/') ? previewPath.slice(0, previewPath.lastIndexOf('/')) : '';
        const cssPath = folder ? `${folder}/styles.css` : 'styles.css';
        const jsPath = folder ? `${folder}/script.js` : 'script.js';
        const proj: FileTree = { ...files };
        // Ensure we prefer folder css/js if present
        if (files[cssPath]) {
          proj['styles.css'] = files[cssPath];
        }
        if (files[jsPath]) {
          proj['script.js'] = files[jsPath];
        }
        // Set index.html temporarily to selected html for renderer simplicity
        proj['index.html'] = files[previewPath];
        useFiles = proj;
        fHtml = undefined;
        fCss = undefined;
        fJs = undefined;
      }
      const full = buildHTML(useFiles, fHtml, fCss, fJs);
      doc.open();
      doc.write(full);
      doc.close();
    }
  }, [files, html, css, js, previewPath]);

  return (
    <iframe
      ref={iframeRef}
      title="Website Preview"
      className="w-full h-full border-0 bg-white"
    />
  );
}
