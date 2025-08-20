'use client';
import React, { useState } from 'react';

interface FileTree {
  [filePath: string]: { content: string; type: string };
}

export default function FileExplorer({ files, onSelect }: { files: FileTree; onSelect: (filePath: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const fileList = Object.keys(files || {}).sort();
  return (
    <div style={{ width: 220, background: '#23232a', color: '#fff', height: '100%', overflowY: 'auto', borderRight: '1px solid #18181b', padding: 8 }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Files</div>
      {fileList.length === 0 && <div style={{ color: '#aaa' }}>No files</div>}
      {fileList.map((file) => (
        <div
          key={file}
          onClick={() => { setSelected(file); onSelect(file); }}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            background: selected === file ? '#2563eb' : 'none',
            color: selected === file ? '#fff' : '#eee',
            cursor: 'pointer',
            marginBottom: 2,
            fontFamily: 'monospace',
            fontSize: 14,
            transition: 'background 0.15s',
          }}
        >
          {file}
        </div>
      ))}
    </div>
  );
}


