import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSkin } from '../context/SkinContext';

const PixelEditor: React.FC = () => {
  const {
    skinData,
    brushColor, tool, brushSize,
    canvasRef: hiddenCanvasRef,
    saveHistory, setBrushColor, setSkinData,
    references, templateVisible, templateOpacity
  } = useSkin();

  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // Cache for loaded images
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [, forceUpdate] = useState({});

  // Template image
  const templateImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = 'https://raw.githubusercontent.com/bspt9/skinview3d/master/examples/skins/steve.png';
    img.onload = () => {
      templateImgRef.current = img;
      forceUpdate({});
    };
  }, []);

  // Pre-load reference images
  useEffect(() => {
    references.forEach(ref => {
      if (!imageCache.current.has(ref.url)) {
        const img = new Image();
        img.src = ref.url;
        img.onload = () => {
          imageCache.current.set(ref.url, img);
          forceUpdate({});
        };
      }
    });
  }, [references]);

  const updateDisplay = useCallback(() => {
    const displayCanvas = displayCanvasRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    if (!displayCanvas || !hiddenCanvas) return;

    const ctx = displayCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    ctx.imageSmoothingEnabled = false;

    // Draw Template if visible
    if (templateVisible && templateImgRef.current) {
      ctx.globalAlpha = templateOpacity;
      ctx.drawImage(templateImgRef.current, 0, 0, 64, 64, 0, 0, displayCanvas.width, displayCanvas.height);
      ctx.globalAlpha = 1.0;
    }

    // Draw Reference Items
    references.forEach(ref => {
      if (ref.visible) {
        const img = imageCache.current.get(ref.url);
        if (img && img.complete && img.width > 0) {
          ctx.globalAlpha = ref.opacity;
          const drawW = 64 * zoom * ref.scale;
          const drawH = (img.height / img.width) * drawW;
          ctx.drawImage(img, ref.x * zoom, ref.y * zoom, drawW, drawH);
          ctx.globalAlpha = 1.0;
        }
      }
    });

    // Draw actual skin
    ctx.drawImage(hiddenCanvas, 0, 0, 64, 64, 0, 0, displayCanvas.width, displayCanvas.height);

    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      const step = displayCanvas.width / 64;
      for (let i = 0; i <= 64; i++) {
        ctx.beginPath();
        ctx.moveTo(i * step, 0);
        ctx.lineTo(i * step, displayCanvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * step);
        ctx.lineTo(displayCanvas.width, i * step);
        ctx.stroke();
      }
    }
  }, [hiddenCanvasRef, showGrid, references, templateVisible, templateOpacity, zoom]);

  useEffect(() => {
    updateDisplay();
  }, [updateDisplay, skinData]);

  const getCoordinates = (e: React.PointerEvent) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * 64);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * 64);

    return { x, y };
  };

  const draw = (x: number, y: number) => {
    const hiddenCanvas = hiddenCanvasRef.current;
    if (!hiddenCanvas || x < 0 || x >= 64 || y < 0 || y >= 64) return;
    const ctx = hiddenCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (tool === 'brush') {
      ctx.fillStyle = brushColor;
      ctx.fillRect(x - Math.floor(brushSize/2), y - Math.floor(brushSize/2), brushSize, brushSize);
    } else if (tool === 'eraser') {
      ctx.clearRect(x - Math.floor(brushSize/2), y - Math.floor(brushSize/2), brushSize, brushSize);
    } else if (tool === 'picker') {
      const data = ctx.getImageData(x, y, 1, 1).data;
      if (data[3] > 0) {
        const hex = '#' + Array.from(data.slice(0, 3)).map(b => b.toString(16).padStart(2, '0')).join('');
        setBrushColor(hex);
      }
    } else if (tool === 'fill') {
      floodFill(ctx, x, y, brushColor);
    }

    updateDisplay();

    // Trigger real-time 3D update
    // We use setSkinData but avoid adding to history every move
    setSkinData(hiddenCanvas.toDataURL());
  };

  const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
    const imageData = ctx.getImageData(0, 0, 64, 64);
    const data = imageData.data;
    const targetColor = getPixelColor(data, x, y);
    const fillRGBA = hexToRgba(fillColor);

    if (colorsMatch(targetColor, fillRGBA)) return;

    const stack: [number, number][] = [[x, y]];
    while (stack.length > 0) {
      const [curX, curY] = stack.pop()!;
      if (curX < 0 || curX >= 64 || curY < 0 || curY >= 64) continue;

      const currentColor = getPixelColor(data, curX, curY);
      if (colorsMatch(currentColor, targetColor)) {
        setPixelColor(data, curX, curY, fillRGBA);
        stack.push([curX - 1, curY]);
        stack.push([curX + 1, curY]);
        stack.push([curX, curY - 1]);
        stack.push([curX, curY + 1]);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const getPixelColor = (data: Uint8ClampedArray, x: number, y: number) => {
    const i = (y * 64 + x) * 4;
    return [data[i], data[i+1], data[i+2], data[i+3]];
  };

  const setPixelColor = (data: Uint8ClampedArray, x: number, y: number, color: number[]) => {
    const i = (y * 64 + x) * 4;
    data[i] = color[0];
    data[i+1] = color[1];
    data[i+2] = color[2];
    data[i+3] = color[3];
  };

  const colorsMatch = (c1: number[], c2: number[]) => {
    return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3];
  };

  const hexToRgba = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 255];
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (coords) draw(coords.x, coords.y);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (coords) draw(coords.x, coords.y);
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistory();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-4 p-2 bg-zinc-800/50 rounded-xl border border-zinc-700 shadow-inner">
        <div className="flex items-center gap-2 px-2 border-r border-zinc-700">
           <span className="text-xs font-bold text-zinc-500 uppercase">View</span>
           <button
            onClick={() => setZoom(Math.max(1, zoom - 1))}
            className="w-8 h-8 flex items-center justify-center bg-zinc-700 rounded hover:bg-zinc-600 transition-colors"
          >
            -
          </button>
          <span className="text-xs font-mono w-8 text-center">{zoom}x</span>
          <button
            onClick={() => setZoom(Math.min(20, zoom + 1))}
            className="w-8 h-8 flex items-center justify-center bg-zinc-700 rounded hover:bg-zinc-600 transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            showGrid ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
          }`}
        >
          {showGrid ? 'Grid On' : 'Grid Off'}
        </button>
      </div>

      <div
        className="relative group border-8 border-zinc-800 rounded-lg bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAACpJREFUGFdjZEACJycnh/9AAsSByYByYByYByYByYByYByYByYByYByYADvEwkL8X4pXAAAAABJRU5ErkJggg==')] bg-repeat shadow-2xl overflow-hidden"
        style={{ width: 64 * zoom, height: 64 * zoom, touchAction: 'none' }}
      >
        <canvas
          ref={displayCanvasRef}
          width={64 * zoom}
          height={64 * zoom}
          className="pixel-canvas cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>
    </div>
  );
};

export default PixelEditor;
