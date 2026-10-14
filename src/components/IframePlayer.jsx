import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  Code2,
  Share2,
  Check
} from 'lucide-react';
import { sounds } from '../utils/audio.js';

export default function IframePlayer({ game, onBack }) {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleReload = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = game.iframeUrl;
      sounds.playClick();
    }
  };

  const handleFullscreenToggle = () => {
    sounds.playClick();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Open in stealth about:blank window
  const handleOpenAboutBlank = () => {
    sounds.playEat();
    const newWin = window.open('about:blank', '_blank');
    if (newWin) {
      newWin.document.title = game.title;
      newWin.document.body.style.margin = '0';
      newWin.document.body.style.height = '100vh';
      newWin.document.body.style.overflow = 'hidden';
      newWin.document.body.style.backgroundColor = '#000';
      
      const frame = newWin.document.createElement('iframe');
      frame.style.border = 'none';
      frame.style.width = '100%';
      frame.style.height = '100%';
      frame.style.margin = '0';
      frame.src = window.location.origin + game.iframeUrl;
      frame.allow = 'autoplay; fullscreen; gamepad';
      newWin.document.body.appendChild(frame);
    }
  };

  const handleCopyUrl = () => {
    const fullUrl = window.location.origin + game.iframeUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    sounds.playClick();
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col w-full ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4' : 'max-w-4xl mx-auto'
      }`}
    >
      {/* Top Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
              onBack();
              sounds.playClick();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">{game.title}</h2>
              <span className="text-xs text-slate-500 font-mono">· {game.category}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono truncate max-w-xs block">
              iframe: {game.iframeUrl}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReload}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Reload Iframe"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyUrl}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Copy Iframe URL"
          >
            {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleOpenAboutBlank}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Open in stealth about:blank window"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Popout
          </button>

          <button
            onClick={handleFullscreenToggle}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Responsive Iframe Frame */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#090d16] min-h-[520px] sm:min-h-[580px] flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-slate-400 text-xs gap-2 z-10">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading game iframe...</span>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={game.iframeUrl}
          title={game.title}
          onLoad={() => setIsLoading(false)}
          className="w-full h-full min-h-[520px] sm:min-h-[580px] border-none block"
          allow="autoplay; fullscreen; gamepad"
        />
      </div>

      {/* Description & JSON schema info */}
      <div className="mt-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <p className="max-w-xl">{game.description}</p>
        <span className="font-mono text-[11px] text-slate-500 shrink-0 ml-4 flex items-center gap-1">
          <Code2 className="w-3.5 h-3.5 text-slate-400" /> Loaded via games.json
        </span>
      </div>
    </div>
  );
}
