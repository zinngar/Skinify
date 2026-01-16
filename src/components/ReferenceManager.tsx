import React from 'react';
import { useSkin, ReferenceItem } from '../context/SkinContext';
import { Image as ImageIcon, X, Eye, EyeOff, Plus } from 'lucide-react';

const ReferenceManager: React.FC = () => {
  const { references, setReferences, templateVisible, setTemplateVisible, templateOpacity, setTemplateOpacity } = useSkin();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setReferences(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        url,
        opacity: 0.5,
        visible: true,
        name: file.name,
        x: 0,
        y: 0,
        scale: 1
      }]);
    }
  };

  const updateRef = (id: string, updates: Partial<ReferenceItem>) => {
    setReferences(refs => refs.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const removeRef = (id: string) => {
    setReferences(refs => {
        const ref = refs.find(r => r.id === id);
        if (ref) URL.revokeObjectURL(ref.url);
        return refs.filter(r => r.id !== id);
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon size={16} /> Reference Items
        </h3>

        <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg cursor-pointer transition-colors text-zinc-400 hover:text-zinc-200 bg-zinc-800/50">
          <Plus size={18} />
          <span className="text-sm">Add Reference</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>

        <div className="space-y-3">
          {/* Template Toggle */}
          <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Skin Template</span>
              <button
                onClick={() => setTemplateVisible(!templateVisible)}
                className={templateVisible ? 'text-blue-400' : 'text-zinc-500'}
              >
                {templateVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            {templateVisible && (
               <input
                type="range" min="0" max="1" step="0.01"
                value={templateOpacity}
                onChange={(e) => setTemplateOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            )}
          </div>

          {references.map((ref) => (
            <div key={ref.id} className="bg-zinc-800/80 border border-zinc-700 p-3 rounded-lg space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm truncate flex-1 font-medium">{ref.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateRef(ref.id, { visible: !ref.visible })} className="text-zinc-400 hover:text-white transition-colors">
                    {ref.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => removeRef(ref.id)} className="text-zinc-400 hover:text-red-400 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-bold">Opacity</label>
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={ref.opacity}
                  onChange={(e) => updateRef(ref.id, { opacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-bold">Scale</label>
                <input
                  type="range" min="0.1" max="4" step="0.1"
                  value={ref.scale}
                  onChange={(e) => updateRef(ref.id, { scale: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold">X</label>
                  <input
                    type="number" value={ref.x}
                    onChange={(e) => updateRef(ref.id, { x: parseInt(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold">Y</label>
                  <input
                    type="number" value={ref.y}
                    onChange={(e) => updateRef(ref.id, { y: parseInt(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferenceManager;
