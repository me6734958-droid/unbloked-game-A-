import React, { useState } from 'react';
import { CLOAK_PROFILES, applyCloak } from '../utils/cloak.js';
import { X, Check, Shield, Globe } from 'lucide-react';
import { sounds } from '../utils/audio.js';

export default function CloakModal({ isOpen, onClose }) {
  const [selectedId, setSelectedId] = useState(() => {
    try {
      return localStorage.getItem('unblock_cloak_profile') || 'default';
    } catch {
      return 'default';
    }
  });
  const [customTitle, setCustomTitle] = useState(() => {
    try {
      return localStorage.getItem('unblock_custom_title') || '';
    } catch {
      return '';
    }
  });

  if (!isOpen) return null;

  const handleSelect = (profileId) => {
    setSelectedId(profileId);
    applyCloak(profileId, customTitle);
    sounds.playClick();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    applyCloak(selectedId, customTitle);
    sounds.playEat();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-white">Tab Disguise & Cloaker</h2>
              <p className="text-xs text-slate-400">Change your browser tab's title and icon instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profiles Grid */}
        <div className="space-y-2 mb-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Preset Disguises
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CLOAK_PROFILES.map(profile => {
              const isSelected = selectedId === profile.id;
              return (
                <button
                  key={profile.id}
                  onClick={() => handleSelect(profile.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className="w-5 h-5 shrink-0 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: profile.iconSvg }}
                    />
                    <div className="truncate">
                      <span className="text-xs font-medium block truncate">{profile.name}</span>
                      <span className="text-[11px] text-slate-500 block truncate">{profile.title}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Title Input */}
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" /> Custom Tab Title
            </label>
            <input
              type="text"
              placeholder="e.g. Science Homework - Period 2"
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Apply Disguise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
