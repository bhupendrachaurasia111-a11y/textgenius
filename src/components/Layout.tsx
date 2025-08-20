import React, { useEffect, useState } from 'react';

export default function Layout({ children, projectName = 'Untitled Project', status = 'Preview Ready', onNav }: {
  children: React.ReactNode;
  projectName?: string;
  status?: string;
  onNav?: (nav: string) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const cls = document.documentElement.classList;
    if (darkMode) cls.remove('light'); else cls.add('light');
  }, [darkMode]);

  const navItems = ['Home', 'New Project', 'Templates', 'Downloads', 'Settings'];

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? '' : 'light'}`}>
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900 text-white">
        <div className="flex items-center gap-2">
          <button className="md:hidden rounded p-2 hover:bg-zinc-800" onClick={() => setSidebarOpen(v => !v)}>
            ☰
          </button>
          <span className="font-bold text-lg tracking-tight">{projectName}</span>
          <span className={`ml-3 px-2 py-1 rounded text-xs font-semibold ${status.includes('Generating') ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{status}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">{darkMode ? 'Dark' : 'Light'}</span>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all relative"></div>
          </label>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className={`transition-all duration-200 bg-zinc-900 text-white border-r border-zinc-800 flex flex-col ${sidebarOpen ? 'w-56' : 'w-0'} overflow-hidden`}>
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map(item => (
              <button key={item} className="text-left w-full px-3 py-2 rounded hover:bg-zinc-800" onClick={() => onNav?.(item)}>
                {item}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col">{children}</main>
      </div>
    </div>
  );
}
