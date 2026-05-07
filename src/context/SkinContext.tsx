import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import type { FC, ReactNode, RefObject } from 'react';

export interface ReferenceItem {
  id: string;
  url: string;
  opacity: number;
  visible: boolean;
  name: string;
  x: number;
  y: number;
  scale: number;
}

interface SkinContextType {
  skinData: string;
  setSkinData: (data: string) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  tool: 'brush' | 'eraser' | 'picker' | 'fill';
  setTool: (tool: 'brush' | 'eraser' | 'picker' | 'fill') => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  clearCanvas: () => void;
  resetCameraCount: number;
  resetCamera: () => void;
  references: ReferenceItem[];
  setReferences: React.Dispatch<React.SetStateAction<ReferenceItem[]>>;
  templateVisible: boolean;
  setTemplateVisible: (visible: boolean) => void;
  templateOpacity: number;
  setTemplateOpacity: (opacity: number) => void;
}

const SkinContext = createContext<SkinContextType | undefined>(undefined);

export const SkinProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [skinData, setSkinData] = useState<string>('');
  const [brushColor, setBrushColor] = useState<string>('#ffffff');
  const [tool, setTool] = useState<'brush' | 'eraser' | 'picker' | 'fill'>('brush');
  const [brushSize, setBrushSize] = useState<number>(1);
  const [resetCameraCount, setResetCameraCount] = useState(0);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [templateVisible, setTemplateVisible] = useState(false);
  const [templateOpacity, setTemplateOpacity] = useState(0.5);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<string[]>([]);
  const redoRef = useRef<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !skinData) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 64;
        canvas.height = 64;
        ctx.clearRect(0, 0, 64, 64);
        const initialData = canvas.toDataURL();
        setSkinData(initialData);
        historyRef.current = [initialData];
      }
    }
  }, [skinData]);

  const saveHistory = useCallback(() => {
    if (canvasRef.current) {
      const newData = canvasRef.current.toDataURL();
      if (newData !== historyRef.current[historyRef.current.length - 1]) {
        historyRef.current.push(newData);
        if (historyRef.current.length > 50) historyRef.current.shift();
        redoRef.current = [];
        setSkinData(newData);
      }
    }
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length > 1) {
      const current = historyRef.current.pop()!;
      redoRef.current.push(current);
      const previous = historyRef.current[historyRef.current.length - 1];
      setSkinData(previous);

      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 64, 64);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = previous;
    }
  }, []);

  const redo = useCallback(() => {
    if (redoRef.current.length > 0) {
      const next = redoRef.current.pop()!;
      historyRef.current.push(next);
      setSkinData(next);

      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 64, 64);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = next;
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 64, 64);
        saveHistory();
      }
    }
  }, [saveHistory]);

  const resetCamera = useCallback(() => {
    setResetCameraCount(c => c + 1);
  }, []);

  return (
    <SkinContext.Provider value={{
      skinData, setSkinData,
      brushColor, setBrushColor,
      tool, setTool,
      brushSize, setBrushSize,
      canvasRef,
      undo, redo, saveHistory,
      clearCanvas,
      resetCameraCount, resetCamera,
      references, setReferences,
      templateVisible, setTemplateVisible,
      templateOpacity, setTemplateOpacity
    }}>
      {children}
      <canvas ref={canvasRef} style={{ display: 'none' }} width={64} height={64} />
    </SkinContext.Provider>
  );
};

export function useSkin() {
  const context = useContext(SkinContext);
  if (!context) throw new Error('useSkin must be used within a SkinProvider');
  return context;
}
