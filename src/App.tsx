import React from 'react';
import { SkinProvider } from './context/SkinContext';
import ToolBar from './components/ToolBar';
import PixelEditor from './components/PixelEditor';
import SkinViewer3D from './components/SkinViewer3D';
import ReferenceManager from './components/ReferenceManager';

function App() {
  return (
    <SkinProvider>
      <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-blue-500/30">
        {/* Left Sidebar - Tools (Top on mobile) */}
        <aside className="w-full md:w-80 h-1/3 md:h-full border-b md:border-b-0 md:border-r border-zinc-800 shrink-0">
          <ToolBar />
        </aside>

        {/* Main Content - Editor */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-auto bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-zinc-950 relative min-h-[400px]">
          <header className="absolute top-4 md:top-8 flex flex-col items-center gap-2 z-10">
             <h1 className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-br from-white via-blue-400 to-indigo-600 bg-clip-text text-transparent italic uppercase">
               Skin Studio
             </h1>
             <p className="hidden md:block text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
               Java Edition • Reference-Ready
             </p>
          </header>

          <div className="mt-8 md:mt-12">
            <PixelEditor />
          </div>

          <footer className="hidden md:block absolute bottom-6 text-[10px] text-zinc-700 font-medium">
             Use scroll to zoom • Click and drag to draw
          </footer>
        </main>

        {/* Right Sidebar - Preview & References (Bottom on mobile) */}
        <aside className="w-full md:w-80 h-1/3 md:h-full flex flex-col border-t md:border-t-0 md:border-l border-zinc-800 bg-zinc-900 shrink-0">
          <div className="p-4 md:p-5 border-b border-zinc-800 bg-zinc-950/30">
            <SkinViewer3D />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <ReferenceManager />
          </div>
        </aside>
      </div>
    </SkinProvider>
  );
}

export default App;
