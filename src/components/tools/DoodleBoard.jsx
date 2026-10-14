import React, { useRef, useState, useEffect } from 'react';
import { sounds } from '../../utils/audio.js';
import { Download, RotateCcw, Eraser } from 'lucide-react';

const COLORS = [
  '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#10b981', '#06b6d4', '#3b82f6', '#a855f7'
];

export default function DoodleBoard() {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#10b981');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#090d16' : color;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    sounds.playGameOver();
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `doodle_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    sounds.playEat();
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center select-none">
      {/* Palette Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setIsEraser(false);
                sounds.playClick();
              }}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full transition-transform ${
                color === c && !isEraser ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
              }`}
            />
          ))}
          <button
            onClick={() => {
              setIsEraser(!isEraser);
              sounds.playClick();
            }}
            className={`ml-2 p-1.5 rounded-lg transition-colors ${
              isEraser ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Brush sizes */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {[2, 4, 8, 16].map(s => (
            <button
              key={s}
              onClick={() => {
                setBrushSize(s);
                sounds.playClick();
              }}
              className={`px-2 py-0.5 text-xs font-mono rounded ${
                brushSize === s ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}px
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Clear canvas"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={downloadImage}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download PNG"
          >
            <Download className="w-3.5 h-3.5" /> Save PNG
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-[#090d16]">
        <canvas
          ref={canvasRef}
          width={450}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-[320px] h-[300px] sm:w-[450px] sm:h-[400px] block cursor-crosshair touch-none"
        />
      </div>

      <div className="text-xs text-slate-500 mt-4 flex items-center gap-3">
        <span>Click and drag to sketch</span>
        <span aria-hidden="true">·</span>
        <span>Download high-res PNG anytime</span>
      </div>
    </div>
  );
}
