'use client';

import React, { useState } from 'react';

export default function MenuDrawer({ onDownload, onReset }: { onDownload: () => void; onReset: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ position: 'fixed', left: 8, top: 8, zIndex: 1000, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 12px' }}
      >
        ☰
      </button>
      {open && (
        <div
          style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 220, background: '#f3f4f6', boxShadow: '2px 0 8px #0001', zIndex: 1001, display: 'flex', flexDirection: 'column', padding: 16 }}
        >
          <button onClick={() => setOpen(false)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: 20, marginBottom: 16 }}>×</button>
          <button onClick={onDownload} style={{ margin: '8px 0', padding: '10px', borderRadius: 4, background: '#2563eb', color: '#fff', border: 'none' }}>Download ZIP</button>
          <button onClick={onReset} style={{ margin: '8px 0', padding: '10px', borderRadius: 4, background: '#ef4444', color: '#fff', border: 'none' }}>Reset Session</button>
        </div>
      )}
    </>
  );
}
