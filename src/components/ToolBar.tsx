import React from 'react';
import { useSkin } from '../context/SkinContext';
import { Paintbrush, Eraser, Pipette, PaintBucket, Undo, Redo, Download, Upload, Trash2, Camera } from 'lucide-react';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/css';

const ToolBar: React.FC = () => {
  const {
    tool, setTool, undo, redo, brushColor, setBrushColor,
    setSkinData, saveHistory, canvasRef, clearCanvas, resetCamera
  } = useSkin();
  const [color, setColor] = useColor(brushColor);

  const handleColorChange = (newColor: any) => {
    setColor(newColor);
    setBrushColor(newColor.hex);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'minecraft-skin.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, 64, 64);
              ctx.drawImage(img, 0, 0, 64, 64);
              saveHistory();
              setSkinData(canvas.toDataURL());
            }
          }
        };
        img.src = data;
      };
      reader.readAsDataURL(file);
    }
  };

  const tools = [
    { id: 'brush', icon: Paintbrush, label: 'Brush' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'picker', icon: Pipette, label: 'Picker' },
    { id: 'fill', icon: PaintBucket, label: 'Fill' },
  ] as const;

  const palette = [
    '#ff0000', '#ff8800', '#ffff00', '#00ff00',
    '#00ffff', '#0000ff', '#8800ff', '#ff00ff',
    '#ffffff', '#888888', '#444444', '#000000',
    '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3',
    '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc'
  ];

  return (
    <div className="flex flex-col gap-6 p-4 bg-zinc-900 border-r border-zinc-800 w-80 h-full overflow-y-auto">
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all ${
                tool === t.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-y-[-1px]'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              <t.icon size={16} />
              <span className="text-xs font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Quick Palette</h3>
        <div className="grid grid-cols-8 gap-1.5">
          {palette.map((c) => (
            <button
              key={c}
              onClick={() => {
                setBrushColor(c);
                // @ts-ignore
                setColor({ ...color, hex: c });
              }}
              className="w-full aspect-square rounded-sm border border-zinc-800 hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">History & View</h3>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={undo} className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <Undo size={16} />
            <span className="text-xs">Undo</span>
          </button>
          <button onClick={redo} className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <Redo size={16} />
            <span className="text-xs">Redo</span>
          </button>
          <button onClick={clearCanvas} className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 rounded-lg text-zinc-400 transition-colors">
            <Trash2 size={16} />
            <span className="text-xs">Clear</span>
          </button>
          <button onClick={resetCamera} className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <Camera size={16} />
            <span className="text-xs">Camera</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Color Picker</h3>
        <div className="rounded-xl overflow-hidden border border-zinc-800">
            <ColorPicker color={color} onChange={handleColorChange} hideInput={['rgb', 'hsv']} />
        </div>
      </div>

      <div className="space-y-4 mt-auto">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Actions</h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer text-zinc-300 transition-colors">
            <Upload size={16} />
            <span className="text-xs font-bold">Import Skin</span>
            <input type="file" className="hidden" accept="image/png" onChange={handleUpload} />
          </label>
          <button onClick={handleDownload} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-bold transition-all shadow-lg shadow-indigo-900/20">
            <Download size={16} />
            <span className="text-xs">Export Skin (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolBar;
