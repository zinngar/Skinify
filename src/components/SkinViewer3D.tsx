import React, { useEffect, useRef } from 'react';
import { SkinViewer, IdleAnimation } from 'skinview3d';
import { useSkin } from '../context/SkinContext';
import { Maximize2, RotateCcw } from 'lucide-react';

const SkinViewer3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<SkinViewer | null>(null);
  const { skinData, resetCameraCount } = useSkin();

  useEffect(() => {
    if (canvasRef.current && !viewerRef.current) {
      const viewer = new SkinViewer({
        canvas: canvasRef.current,
        preserveDrawingBuffer: true
      });

      viewer.autoRotate = true;
      viewer.animation = new IdleAnimation();
      viewer.background = 0x18181b;

      viewerRef.current = viewer;

      // Handle initial sizing
      const resize = () => {
        if (canvasRef.current && viewerRef.current) {
          viewerRef.current.width = canvasRef.current.clientWidth;
          viewerRef.current.height = canvasRef.current.clientHeight;
        }
      };

      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (viewerRef.current && skinData) {
      viewerRef.current.loadSkin(skinData);
    }
  }, [skinData]);

  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.resetCameraPose();
    }
  }, [resetCameraCount]);

  return (
    <div className="relative border border-zinc-700 bg-zinc-900 rounded-xl overflow-hidden shadow-xl group aspect-[3/4] min-h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => viewerRef.current?.resetCameraPose()}
          className="p-1.5 bg-zinc-800/80 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
          title="Reset Camera"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-zinc-950/50 rounded-md backdrop-blur-sm">
        <Maximize2 size={12} className="text-zinc-500" />
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">3D Preview</span>
      </div>
    </div>
  );
};

export default SkinViewer3D;
