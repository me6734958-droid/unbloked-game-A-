import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/audio.js';
import { Download, Trash2, Copy, Check } from 'lucide-react';

export default function Scratchpad() {
  const [content, setContent] = useState(() => {
    try {
      return localStorage.getItem('unblock_scratchpad') || '# Quick Study Notes\n- Unit 4 notes\n- Math formula: a² + b² = c²\n- Remember assignment due Friday';
    } catch {
      return '';
    }
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('unblock_scratchpad', content);
    } catch {}
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    sounds.playEat();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sounds.playClick();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Clear all notes?')) {
      setContent('');
      sounds.playGameOver();
    }
  };

  const wordCount = content.trim().length > 0 ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col h-[520px]">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>Words: <strong className="text-white font-mono">{wordCount}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Chars: <strong className="text-white font-mono">{charCount}</strong></span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400">Auto-saved locally</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            title="Copy all text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            title="Download as .txt"
          >
            <Download className="w-3.5 h-3.5" /> Save .txt
          </button>
          <button
            onClick={handleClear}
            className="p-2 bg-slate-800 hover:bg-red-950/70 text-slate-400 hover:text-red-300 rounded-lg transition-colors"
            title="Clear notes"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Type or paste your notes here... Notes stay saved in your browser even after closing the tab."
        className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm font-mono text-slate-200 outline-none resize-none leading-relaxed focus:border-emerald-500/80 transition-colors"
      />
    </div>
  );
}
