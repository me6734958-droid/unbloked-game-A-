import React, { useState } from 'react';
import { X, Search, FileText, Share2, MessageSquare, Printer, Undo, Redo } from 'lucide-react';

export default function PanicDecoy({ onDismiss, initialType = 'docs' }) {
  const [decoyType, setDecoyType] = useState(initialType);
  const [docContent, setDocContent] = useState(
    `AP World History: Unit 4 - Transoceanic Interconnections (c. 1450 to c. 1750)

1. Technological Innovations in Navigation
During the period between 1450 and 1750, European maritime exploration was facilitated by cross-cultural technological transfers from the Islamic world and Asia. Crucial developments included:
- The Magnetic Compass: Originally developed in Han China, allowing direction determination without stellar reference.
- Astrolabe & Quadrant: Refined by Muslim navigators, enabling sailors to calculate their latitude using the horizon and stars.
- Lateen Sail: Triangular sails developed in the Indian Ocean maritime networks, permitting ships to sail against opposing winds (tacking).
- Caravel and Carrack: Composite ship designs developed in Portugal and Spain that combined multi-mast configurations with shallow drafts suitable for open-ocean exploration.

2. The Columbian Exchange and Global Demographics
The transfer of crops, animals, and pathogens between the Eastern and Western Hemispheres permanently reshaped ecological and human geography.
- Biological Impacts: Introduction of Old World diseases (smallpox, measles, influenza) caused catastrophic demographic collapse among indigenous populations in the Americas, with mortality estimates exceeding 80% in many regions.
- Agricultural Diffusion: American staple crops such as maize, potatoes, and cassava stimulated significant population rebounds in Europe, West Africa, and East Asia due to their high caloric yields.

3. Mercantilism and Colonial Trade Systems
European joint-stock companies (e.g., the Dutch East India Company and British East India Company) acted as state-chartered monopolies directing global commerce and territorial consolidation.`
  );

  return (
    <div className="fixed inset-0 z-50 bg-white text-slate-900 overflow-y-auto font-sans select-text">
      {/* Discreet restore button */}
      <div className="fixed top-2 right-2 z-50 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs border border-slate-300 opacity-20 hover:opacity-100 transition-opacity">
        <select
          value={decoyType}
          onChange={e => setDecoyType(e.target.value)}
          className="bg-transparent border-none text-xs outline-none cursor-pointer"
        >
          <option value="docs">Google Docs</option>
          <option value="wikipedia">Wikipedia</option>
          <option value="classroom">Google Classroom</option>
        </select>
        <button
          onClick={onDismiss}
          className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-0.5 ml-1"
          title="Return to UnblockHub"
        >
          <X className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      {/* DECOY 1: GOOGLE DOCS */}
      {decoyType === 'docs' && (
        <div className="min-h-screen bg-[#F9FBFD] flex flex-col">
          {/* Top Bar */}
          <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-10 bg-blue-600 rounded-sm flex items-center justify-center text-white font-bold shadow-xs">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium text-slate-800">
                    AP World History - Unit 4 Study Guide
                  </span>
                  <span className="text-xs text-slate-400">· Saved to Drive</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600 mt-0.5">
                  <span className="hover:text-slate-900 cursor-pointer">File</span>
                  <span className="hover:text-slate-900 cursor-pointer">Edit</span>
                  <span className="hover:text-slate-900 cursor-pointer">View</span>
                  <span className="hover:text-slate-900 cursor-pointer">Insert</span>
                  <span className="hover:text-slate-900 cursor-pointer">Format</span>
                  <span className="hover:text-slate-900 cursor-pointer">Tools</span>
                  <span className="hover:text-slate-900 cursor-pointer">Extensions</span>
                  <span className="hover:text-slate-900 cursor-pointer">Help</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md">
                <MessageSquare className="w-3.5 h-3.5" /> Comments
              </button>
              <button className="flex items-center gap-1.5 px-4 py-1.5 bg-[#C2E7FF] hover:bg-[#a9dbfa] text-slate-800 font-medium text-xs rounded-full">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                S
              </div>
            </div>
          </header>

          {/* Formatting Toolbar */}
          <div className="bg-[#EDF2FA] border-b border-slate-200 px-6 py-1.5 flex items-center gap-4 text-xs text-slate-700">
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-slate-200 rounded"><Undo className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:bg-slate-200 rounded"><Redo className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:bg-slate-200 rounded"><Printer className="w-3.5 h-3.5" /></button>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <span>100%</span>
            <div className="h-4 w-px bg-slate-300" />
            <span className="font-serif">Normal text</span>
            <div className="h-4 w-px bg-slate-300" />
            <span>Arial</span>
            <span>11</span>
            <div className="h-4 w-px bg-slate-300" />
            <span className="font-bold cursor-pointer">B</span>
            <span className="italic cursor-pointer">I</span>
            <span className="underline cursor-pointer">U</span>
            <span className="cursor-pointer text-blue-600 font-bold">A</span>
          </div>

          {/* Page Document Canvas */}
          <div className="flex-1 py-8 px-4 flex justify-center">
            <div className="w-full max-w-[816px] min-h-[1056px] bg-white shadow-md border border-slate-200 p-12 sm:p-16">
              <textarea
                value={docContent}
                onChange={e => setDocContent(e.target.value)}
                className="w-full h-full min-h-[900px] border-none outline-none resize-none font-serif text-[15px] leading-relaxed text-slate-800 bg-transparent"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* DECOY 2: WIKIPEDIA */}
      {decoyType === 'wikipedia' && (
        <div className="min-h-screen bg-white">
          <header className="border-b border-slate-200 px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-serif text-2xl font-bold tracking-tight">WIKIPEDIA</span>
              <span className="text-xs text-slate-500">The Free Encyclopedia</span>
            </div>
            <div className="flex items-center gap-2 border border-slate-300 rounded-md px-3 py-1.5 w-72">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                defaultValue="Photosynthesis"
                className="w-full text-xs outline-none bg-transparent"
              />
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-6 py-8">
            <h1 className="font-serif text-3xl font-normal border-b border-slate-300 pb-2 mb-4 text-slate-900">
              Photosynthesis
            </h1>
            <p className="text-xs text-slate-500 mb-6">From Wikipedia, the free encyclopedia</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4 text-sm leading-relaxed text-slate-800">
                <p>
                  <strong>Photosynthesis</strong> is a biological process utilized by plants, algae, and
                  certain cyanobacteria to convert light energy into chemical energy that can later be
                  released to fuel cellular activities.
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center font-mono text-xs my-4">
                  6 CO₂ + 6 H₂O + light energy → C₆H₁₂O₆ + 6 O₂
                </div>
                <h2 className="font-serif text-xl border-b border-slate-200 pb-1 mt-6 text-slate-900">
                  Light-dependent reactions
                </h2>
                <p>
                  In the light-dependent reactions, one molecule of the pigment chlorophyll absorbs one
                  photon and loses one electron. This electron is passed to a modified form of chlorophyll
                  called pheophytin, which passes the electron to a quinone molecule, starting the flow of
                  electrons down an electron transport chain that leads to the ultimate reduction of NADP
                  to NADPH.
                </p>
                <h2 className="font-serif text-xl border-b border-slate-200 pb-1 mt-6 text-slate-900">
                  Carbon fixation (Calvin cycle)
                </h2>
                <p>
                  In light-independent (or "dark") reactions, the enzyme RuBisCO captures CO₂ from the
                  atmosphere and, in a process called the Calvin cycle, uses the newly formed NADPH and
                  releases three-carbon sugars, which are later combined to form sucrose and starch.
                </p>
              </div>

              {/* Infobox */}
              <div className="border border-slate-300 bg-slate-50 p-4 rounded text-xs space-y-2 h-fit">
                <div className="font-bold text-center border-b border-slate-200 pb-2">Photosynthesis</div>
                <div className="py-2 text-center text-slate-600 bg-slate-100 rounded">
                  Chloroplast Overview Diagram
                </div>
                <div className="grid grid-cols-2 gap-1 border-t border-slate-200 pt-2">
                  <span className="font-semibold text-slate-600">Primary reactants:</span>
                  <span>Carbon dioxide, water, light</span>
                </div>
                <div className="grid grid-cols-2 gap-1 border-t border-slate-200 pt-2">
                  <span className="font-semibold text-slate-600">Main products:</span>
                  <span>Glucose, Oxygen (O₂)</span>
                </div>
                <div className="grid grid-cols-2 gap-1 border-t border-slate-200 pt-2">
                  <span className="font-semibold text-slate-600">Primary site:</span>
                  <span>Thylakoid membrane & Stroma</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* DECOY 3: GOOGLE CLASSROOM */}
      {decoyType === 'classroom' && (
        <div className="min-h-screen bg-slate-50">
          <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-700 rounded-md flex items-center justify-center text-white font-bold text-sm">
                C
              </div>
              <span className="font-medium text-slate-800">English 11: Literary Analysis Essay</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Period 3 · Room 204</span>
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                S
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-6 py-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                    Essay Assignment: Themes in The Great Gatsby
                  </h1>
                  <p className="text-xs text-slate-500">Mr. Davies · Due Tomorrow, 11:59 PM · 100 points</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                  Assigned
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4 mb-4">
                Compose a 3 to 4-page MLA formatted essay analyzing the symbolism of the Green Light at the end of Daisy's dock and the Valley of Ashes in F. Scott Fitzgerald's <em>The Great Gatsby</em>. Cite at least 3 textual quotes from the novel.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Your Work</h2>
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-xs font-medium text-slate-800 block">
                      Student_Essay_Draft_Final.docx
                    </span>
                    <span className="text-[11px] text-slate-400">Attached Google Doc</span>
                  </div>
                </div>
                <span className="text-xs text-slate-500">Ready</span>
              </div>
              <button className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer">
                Turn In Assignment
              </button>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
