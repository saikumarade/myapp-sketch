import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Undo, Redo, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface DrawingPoint {
  x: number;
  y: number;
  color: string;
  size: number;
  tool: 'brush' | 'eraser';
}

export interface DrawingStroke {
  points: DrawingPoint[];
  id: string;
}

interface DrawingCanvasProps {
  currentTool: 'brush' | 'eraser';
  currentColor: string;
  currentSize: number;
  onStrokeAdded?: (stroke: DrawingStroke) => void;
  onCanvasCleared?: () => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  currentTool,
  currentColor,
  currentSize,
  onStrokeAdded,
  onCanvasCleared,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [undoStack, setUndoStack] = useState<DrawingStroke[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingStroke[][]>([]);
  const { toast } = useToast();

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.scale(dpr, dpr);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;
        
        // Redraw all strokes
        redrawCanvas();
      }
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    return () => window.removeEventListener('resize', setCanvasSize);
  }, []);

  // Redraw entire canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      stroke.points.forEach((point, index) => {
        if (index === 0) {
          context.beginPath();
          context.moveTo(point.x, point.y);
        } else {
          const prevPoint = stroke.points[index - 1];
          context.lineWidth = point.size;
          context.strokeStyle = point.tool === 'eraser' ? '#FFFFFF' : point.color;
          context.globalCompositeOperation = point.tool === 'eraser' ? 'destination-out' : 'source-over';
          
          context.beginPath();
          context.moveTo(prevPoint.x, prevPoint.y);
          context.lineTo(point.x, point.y);
          context.stroke();
        }
      });
    });
  }, [strokes]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Get coordinates relative to canvas
  const getCoordinates = (event: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }
  };

  // Start drawing
  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const coordinates = getCoordinates(event);
    
    setIsDrawing(true);
    setCurrentStroke([{
      x: coordinates.x,
      y: coordinates.y,
      color: currentColor,
      size: currentSize,
      tool: currentTool,
    }]);
  };

  // Continue drawing
  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing) return;

    const coordinates = getCoordinates(event);
    const newPoint: DrawingPoint = {
      x: coordinates.x,
      y: coordinates.y,
      color: currentColor,
      size: currentSize,
      tool: currentTool,
    };

    setCurrentStroke(prev => [...prev, newPoint]);

    // Draw current stroke in real-time
    const context = contextRef.current;
    if (context && currentStroke.length > 0) {
      const prevPoint = currentStroke[currentStroke.length - 1];
      
      context.lineWidth = currentSize;
      context.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
      context.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
      
      context.beginPath();
      context.moveTo(prevPoint.x, prevPoint.y);
      context.lineTo(coordinates.x, coordinates.y);
      context.stroke();
    }
  };

  // End drawing
  const finishDrawing = () => {
    if (!isDrawing || currentStroke.length === 0) return;

    setIsDrawing(false);
    
    // Add stroke to history
    const newStroke: DrawingStroke = {
      points: currentStroke,
      id: Date.now().toString(),
    };

    setUndoStack(prev => [...prev, strokes]);
    setRedoStack([]);
    setStrokes(prev => [...prev, newStroke]);
    setCurrentStroke([]);
    
    onStrokeAdded?.(newStroke);
  };

  // Undo last stroke
  const undo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, strokes]);
    setStrokes(previousState);
    setUndoStack(prev => prev.slice(0, -1));
    
    toast({
      title: "Undone",
      description: "Last action has been undone",
    });
  };

  // Redo last undone stroke
  const redo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, strokes]);
    setStrokes(nextState);
    setRedoStack(prev => prev.slice(0, -1));
    
    toast({
      title: "Redone",
      description: "Action has been redone",
    });
  };

  // Clear canvas
  const clearCanvas = () => {
    setUndoStack(prev => [...prev, strokes]);
    setRedoStack([]);
    setStrokes([]);
    onCanvasCleared?.();
    
    toast({
      title: "Canvas cleared",
      description: "All drawings have been removed",
    });
  };

  // Download canvas as PNG
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a new canvas with white background
    const downloadCanvas = document.createElement('canvas');
    const downloadContext = downloadCanvas.getContext('2d');
    if (!downloadContext) return;

    downloadCanvas.width = canvas.width;
    downloadCanvas.height = canvas.height;
    
    // Fill white background
    downloadContext.fillStyle = '#FFFFFF';
    downloadContext.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
    
    // Draw the original canvas on top
    downloadContext.drawImage(canvas, 0, 0);
    
    // Download
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = downloadCanvas.toDataURL();
    link.click();
    
    toast({
      title: "Download started",
      description: "Your drawing is being downloaded",
    });
  };

  return (
    <div className="relative w-full h-full bg-canvas-bg rounded-lg shadow-floating overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={finishDrawing}
        onMouseLeave={finishDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={finishDrawing}
        style={{
          touchAction: 'none',
        }}
      />

      {/* Canvas Actions */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={undoStack.length === 0}
          className="bg-white/90 backdrop-blur-sm shadow-toolbar hover:shadow-primary transition-all duration-200"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={redoStack.length === 0}
          className="bg-white/90 backdrop-blur-sm shadow-toolbar hover:shadow-primary transition-all duration-200"
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          className="bg-white/90 backdrop-blur-sm shadow-toolbar hover:shadow-destructive hover:text-destructive transition-all duration-200"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={downloadCanvas}
          className="bg-white/90 backdrop-blur-sm shadow-toolbar hover:shadow-accent hover:text-accent transition-all duration-200"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};