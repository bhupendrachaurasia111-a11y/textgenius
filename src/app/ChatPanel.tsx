'use client';

import React, { useState } from 'react';

interface Message {
  role: 'user' | 'agent';
  content: string;
}

export default function ChatPanel({ onSend, messages }: { onSend: (msg: string) => void; messages: Message[] }) {
  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 bg-zinc-950">
        {messages.map((msg, i) => (
          <div key={i} className={`my-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block rounded px-3 py-2 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-100'}`}>{msg.content}</span>
          </div>
        ))}
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (input.trim()) {
            onSend(input);
            setInput('');
          }
        }}
        className="flex border-t border-zinc-800 p-2 bg-zinc-950"
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your prompt..."
          className="flex-1 px-3 py-2 rounded bg-zinc-900 text-zinc-100 placeholder-zinc-500 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button type="submit" className="ml-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">
          Send
        </button>
      </form>
    </div>
  );
}
