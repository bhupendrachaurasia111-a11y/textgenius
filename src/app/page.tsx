'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import ChatPanel from './ChatPanel';
import PreviewPanel from './PreviewPanel';
import Templates from './Templates';

function generateSessionId() {
  return Math.random().toString(36).slice(2);
}

type Project = { id: string; name: string; files: any };

export default function Home() {
  const [messages, setMessages] = useState([{ role: "user" | "agent"; content: string }]);
  const [files, setFiles] = useState<any>(null);
  const [site, setSite] = useState({ html: '', css: '', js: '' });
  const [sessionId, setSessionId] = useState(generateSessionId());
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [status, setStatus] = useState('Preview Ready');
  const [view, setView] = useState<'app' | 'templates'>('app');
  const [projectName, setProjectName] = useState('Untitled Project');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('aiwb.projects');
    if (saved) setProjects(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('aiwb.projects', JSON.stringify(projects));
  }, [projects]);

  const saveCurrentProject = () => {
    const updated: Project = { id: sessionId, name: projectName, files };
    setProjects(prev => {
      const others = prev.filter(p => p.id !== sessionId);
      return [updated, ...others].slice(0, 10);
    });
  };

  const loadProject = (id: string) => {
    const p = projects.find(p => p.id === id);
    if (!p) return;
    setFiles(p.files);
    setSite({
      html: p.files?.['index.html']?.content || '',
      css: p.files?.['styles.css']?.content || '',
      js: p.files?.['script.js']?.content || '',
    });
    setSessionId(id);
    setProjectName(p.name);
    setSelectedFile(null);
  };

  const handleSend = async (prompt: string) => {
    setMessages(msgs => [
      ...msgs,
      { role: 'user', content: prompt },
      { role: 'agent', content: '⏳ Generating website...' }
    ]);
    setLoading(true);
    setStatus('Generating…');
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, sessionId, mode: files ? 'edit' : 'generate', files }),
    });
    const data = await res.json();
    setFiles(data.files || null);
    setSite({
      html: data.files?.['index.html']?.content || data.html || '',
      css: data.files?.['styles.css']?.content || data.css || '',
      js: data.files?.['script.js']?.content || data.js || '',
    });
    setSelectedFile(null);
    // Choose first html file as preview
    const htmlPaths = Object.keys(data.files || {}).filter((p: string) => p.endsWith('.html'));
    setPreviewPath(htmlPaths[0] || 'index.html');
    setMessages(msgs => [
      ...msgs.slice(0, -1),
      { role: 'agent', content: '✅ Website generated! You can refine it with more prompts.' },
    ]);
    setLoading(false);
    setStatus('Preview Ready');
    saveCurrentProject();
  };

  const handleDownload = () => {
    window.open(`/api/download?sessionId=${sessionId}`, '_blank');
  };

  const handleReset = async () => {
    await fetch('/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    setMessages([{ role: 'agent', content: '👋 Session reset. Describe your new website!' }]);
    setFiles(null);
    setSite({ html: '', css: '', js: '' });
    const newId = generateSessionId();
    setSessionId(newId);
    setProjectName('Untitled Project');
    setSelectedFile(null);
    setPreviewPath(null);
  };

  // Simple resizer
  const [leftWidth, setLeftWidth] = useState(380);
  const dragging = useRef(false);
  const onMouseDown = () => { dragging.current = true; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const newWidth = Math.min(Math.max(280, e.clientX), window.innerWidth - 280);
    setLeftWidth(newWidth);
  };
  const onMouseUp = () => { dragging.current = false; };

  return (
    <div onMouseMove={onMouseMove} onMouseUp={onMouseUp} className="min-h-screen">
      <Layout projectName={projectName} status={status} onNav={(nav) => {
        if (nav === 'Downloads') handleDownload();
        if (nav === 'Home') { setView('app'); }
        if (nav === 'New Project') handleReset();
        if (nav === 'Templates') setView('templates');
        if (nav === 'Settings') {
          const name = prompt('Project name:', projectName) || projectName;
          setProjectName(name);
          saveCurrentProject();
        }
      }}>
        {view === 'templates' ? (
          <Templates onChoose={(t) => { setView('app'); handleSend(t); }} />
        ) : (
          <div className="flex flex-1 min-h-0">
            {/* Left: Agent chat */}
            <div className="border-r border-zinc-800 bg-zinc-950 text-white flex flex-col" style={{ width: leftWidth }}>
              <div className="flex-1 overflow-y-auto transition-all">
                <ChatPanel onSend={handleSend} messages={messages} />
              </div>
              {loading && (
                <div className="p-2 text-center text-zinc-400 animate-pulse">Typing…</div>
              )}
              <div className="flex gap-2 p-2 border-t border-zinc-800">
                <button className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500" onClick={handleDownload}>Download ZIP</button>
                <button className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700" onClick={handleReset}>Reset</button>
              </div>
            </div>

            {/* Resizer */}
            <div onMouseDown={onMouseDown} className="w-1.5 cursor-col-resize bg-zinc-800 hover:bg-blue-600 transition-colors" />

            {/* Right: Preview */}
            <div className="flex-1 min-w-0 bg-zinc-900 flex flex-col p-4">
              {/* Pages tabs + back button */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-wrap gap-2">
                  {files && Object.keys(files).filter(p => p.endsWith('.html')).map(p => (
                    <button key={p} onClick={() => { setSelectedFile(null); setPreviewPath(p); }} className={`px-3 py-1.5 rounded border ${previewPath === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'}`}>{p}</button>
                  ))}
                </div>
                <button onClick={() => setSelectedFile(null)} className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700">Back</button>
              </div>
              <div className="w-full flex-1 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-white">
                {selectedFile && files && files[selectedFile] && selectedFile !== 'index.html' ? (
                  <pre className="w-full h-full p-4 overflow-auto text-sm text-zinc-900 bg-zinc-100">{files[selectedFile].content}</pre>
                ) : (
                  <PreviewPanel files={files} html={site.html} css={site.css} js={site.js} previewPath={previewPath || undefined} />
                )}
              </div>
            </div>
          </div>
        )}
      </Layout>
    </div>
  );
}
