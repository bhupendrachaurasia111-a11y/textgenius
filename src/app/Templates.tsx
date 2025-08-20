"use client";
import React from 'react';

const templates = [
  { name: 'Portfolio', prompt: 'Create a modern portfolio website with hero, projects grid, about, and contact sections.' },
  { name: 'Blog', prompt: 'Create a clean blog with homepage, posts list, post page, and categories.' },
  { name: 'Landing Page', prompt: 'Create a SaaS landing page with hero, features, pricing, and CTA.' },
  { name: 'Dashboard', prompt: 'Create an admin dashboard with sidebar, topbar, cards, charts, and tables.' },
];

export default function Templates({ onChoose }: { onChoose: (prompt: string) => void }) {
  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {templates.map(t => (
        <button key={t.name} onClick={() => onChoose(t.prompt)} className="p-4 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-left">
          <div className="font-semibold mb-1">{t.name}</div>
          <div className="text-sm text-zinc-400">Click to generate a {t.name} template</div>
        </button>
      ))}
    </div>
  );
}

