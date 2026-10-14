import React, { useState } from 'react';
import {
  Code,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { sounds } from '../utils/audio.js';

export default function JsonGameManager({
  games,
  onUpdateGames,
  onResetDefaults,
}) {
  const [viewMode, setViewMode] = useState('visual');
  const [rawText, setRawText] = useState(() => JSON.stringify(games, null, 2));
  const [jsonError, setJsonError] = useState(null);
  const [copied, setCopied] = useState(false);

  // New game form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Arcade');
  const [newIframeUrl, setNewIframeUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTag, setNewTag] = useState('Custom');

  const handleAddGame = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newIframeUrl.trim()) return;

    const newGame = {
      id: newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4),
      title: newTitle.trim(),
      category: newCategory.trim() || 'Arcade',
      description: newDescription.trim() || 'Custom added iframe game.',
      iframeUrl: newIframeUrl.trim(),
      tag: newTag.trim() || 'Custom',
      rating: 5.0,
    };

    const updated = [newGame, ...games];
    onUpdateGames(updated);
    setRawText(JSON.stringify(updated, null, 2));

    // Reset inputs
    setNewTitle('');
    setNewIframeUrl('');
    setNewDescription('');
    sounds.playEat();
  };

  const handleDeleteGame = (id) => {
    const updated = games.filter(g => g.id !== id);
    onUpdateGames(updated);
    setRawText(JSON.stringify(updated, null, 2));
    sounds.playGameOver();
  };

  const handleRawChange = (text) => {
    setRawText(text);
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        onUpdateGames(parsed);
        setJsonError(null);
      } else {
        setJsonError('JSON must be an array of game objects [ { ... } ]');
      }
    } catch (err) {
      setJsonError(err.message || 'Invalid JSON format');
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(games, null, 2));
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(games, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'games.json';
    a.click();
    URL.revokeObjectURL(url);
    sounds.playClear();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-400" /> JSON Iframe Game Storage
          </h1>
          <p className="text-xs text-slate-400">
            Each game in the library is defined and stored as an iframe URL entry inside <code className="text-emerald-400 font-mono">games.json</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex">
            <button
              onClick={() => { setViewMode('visual'); sounds.playClick(); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'visual' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              List & Add
            </button>
            <button
              onClick={() => {
                setRawText(JSON.stringify(games, null, 2));
                setViewMode('raw');
                sounds.playClick();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'raw' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw games.json
            </button>
          </div>

          <button
            onClick={handleDownloadJson}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg transition-colors"
            title="Download games.json"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Game Form */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-fit">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Add Iframe Game to JSON
            </h2>
            <form onSubmit={handleAddGame} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Game Title</label>
                <input
                  type="text"
                  placeholder="e.g. Slope / Asteroids"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Iframe Source URL</label>
                <input
                  type="text"
                  placeholder="e.g. /games/snake/index.html or https://..."
                  value={newIframeUrl}
                  onChange={e => setNewIframeUrl(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-[11px] outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Relative local path or any iframe-friendly URL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white outline-none"
                  >
                    <option value="Arcade">Arcade</option>
                    <option value="Puzzle">Puzzle</option>
                    <option value="Action">Action</option>
                    <option value="Sports">Sports</option>
                    <option value="Shooter">Shooter</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. 2D / 3D"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Description</label>
                <textarea
                  placeholder="Short description of the gameplay..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Insert into games.json
              </button>
            </form>
          </div>

          {/* Current Entries in JSON */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>{games.length} games configured in JSON</span>
              <button
                onClick={onResetDefaults}
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Restore Default JSON
              </button>
            </div>

            <div className="space-y-2.5">
              {games.map(game => (
                <div
                  key={game.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">{game.title}</span>
                      <span className="text-xs text-slate-500">· {game.category}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">[{game.tag}]</span>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400 truncate flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                      {game.iframeUrl}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{game.description}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteGame(game.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                    title="Remove from JSON"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Raw JSON Editor */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              {jsonError ? (
                <span className="text-rose-400 flex items-center gap-1 font-mono">
                  <AlertCircle className="w-3.5 h-3.5" /> {jsonError}
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Valid JSON format
                </span>
              )}
            </div>

            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-[#080c16]">
            <textarea
              value={rawText}
              onChange={e => handleRawChange(e.target.value)}
              rows={20}
              className="w-full p-4 font-mono text-xs text-emerald-300 bg-transparent outline-none resize-y leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
