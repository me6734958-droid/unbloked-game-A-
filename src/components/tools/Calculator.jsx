import React, { useState } from 'react';
import { sounds } from '../../utils/audio.js';
import { Delete, RotateCcw } from 'lucide-react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState([]);
  const [newNumber, setNewNumber] = useState(true);

  const handleDigit = (d) => {
    sounds.playClick();
    if (newNumber) {
      setDisplay(d === '.' ? '0.' : d);
      setNewNumber(false);
    } else {
      if (d === '.' && display.includes('.')) return;
      setDisplay(display + d);
    }
  };

  const handleOp = (op) => {
    sounds.playClick();
    setDisplay(display + ' ' + op + ' ');
    setNewNumber(false);
  };

  const handleClear = () => {
    sounds.playClick();
    setDisplay('0');
    setNewNumber(true);
  };

  const handleDelete = () => {
    sounds.playClick();
    if (display.length <= 1) {
      setDisplay('0');
      setNewNumber(true);
    } else {
      setDisplay(display.trimEnd().slice(0, -1).trimEnd());
    }
  };

  const handleCalculate = () => {
    try {
      const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result)) {
        const rounded = Math.round(result * 100000000) / 100000000;
        setHistory(prev => [`${display} = ${rounded}`, ...prev.slice(0, 5)]);
        setDisplay(rounded.toString());
        setNewNumber(true);
        sounds.playEat();
      } else {
        setDisplay('Error');
        setNewNumber(true);
      }
    } catch {
      setDisplay('Error');
      setNewNumber(true);
      sounds.playGameOver();
    }
  };

  const handleFunction = (fn) => {
    try {
      const num = parseFloat(display);
      let res = 0;
      if (fn === 'sqrt') res = Math.sqrt(num);
      else if (fn === 'sq') res = num * num;
      else if (fn === 'sin') res = Math.sin((num * Math.PI) / 180);
      else if (fn === 'cos') res = Math.cos((num * Math.PI) / 180);

      const rounded = Math.round(res * 100000000) / 100000000;
      setHistory(prev => [`${fn}(${display}) = ${rounded}`, ...prev.slice(0, 5)]);
      setDisplay(rounded.toString());
      setNewNumber(true);
      sounds.playClear();
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
      {/* Screen */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 text-right">
        <div className="h-5 text-xs font-mono text-slate-500 truncate mb-1">
          {history[0] || 'Ready'}
        </div>
        <div className="text-3xl font-mono font-bold text-white tracking-wider tabular-nums overflow-x-auto whitespace-nowrap">
          {display}
        </div>
      </div>

      {/* Scientific Row */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        <button
          onClick={() => handleFunction('sqrt')}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
        >
          √x
        </button>
        <button
          onClick={() => handleFunction('sq')}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
        >
          x²
        </button>
        <button
          onClick={() => handleFunction('sin')}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
        >
          sin
        </button>
        <button
          onClick={() => handleFunction('cos')}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
        >
          cos
        </button>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-1.5 text-sm font-mono font-medium">
        <button
          onClick={handleClear}
          className="p-3 bg-red-950/60 hover:bg-red-900/80 text-red-300 rounded-lg transition-colors"
        >
          C
        </button>
        <button
          onClick={handleDelete}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleOp('%')}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
        >
          %
        </button>
        <button
          onClick={() => handleOp('÷')}
          className="p-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-lg font-bold"
        >
          ÷
        </button>

        <button onClick={() => handleDigit('7')} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">7</button>
        <button onClick={() => handleDigit('8')} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">8</button>
        <button onClick={() => handleDigit('9')} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">9</button>
        <button onClick={() => handleOp('×')} className="p-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-lg font-bold">×</button>

        <button onClick={() => handleDigit('4')} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">4</button>
        <button onClick={() => handleDigit('5')} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">5</button>
        <button onClick={() => handleDigit('6')} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">6</button>
        <button onClick={() => handleOp('-')} className="p-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-lg font-bold">−</button>

        <button onClick={() => handleDigit('1')} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">1</button>
        <button onClick={() => handleDigit('2')} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">2</button>
        <button onClick={() => handleDigit('3')} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">3</button>
        <button onClick={() => handleOp('+')} className="p-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-lg font-bold">+</button>

        <button onClick={() => handleDigit('0')} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg col-span-2">0</button>
        <button onClick={() => handleDigit('.')} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg font-bold">.</button>
        <button onClick={handleCalculate} className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-lg font-bold">=</button>
      </div>

      {/* Recent History */}
      {history.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Calculation Log</span>
            <button onClick={() => setHistory([])} className="hover:text-slate-300 flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>
          <div className="space-y-1">
            {history.map((h, i) => (
              <div key={i} className="text-xs font-mono text-slate-400 bg-slate-950/40 px-2 py-1 rounded">
                {h}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
