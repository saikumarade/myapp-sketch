import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Brush, Eraser, Palette, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawingToolbarProps {
  currentTool: 'brush' | 'eraser';
  onToolChange: (tool: 'brush' | 'eraser') => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  currentSize: number;
  onSizeChange: (size: number) => void;
  connectedUsers?: number;
}

const PRESET_COLORS = [
  '#000000', // Black
  '#FF4444', // Red
  '#44FF44', // Green
  '#4444FF', // Blue
  '#FFFF44', // Yellow
  '#FF44FF', // Magenta
  '#44FFFF', // Cyan
  '#FF8844', // Orange
  '#8844FF', // Purple
  '#44FF88', // Light Green
  '#FF4488', // Pink
  '#88FF44', // Lime
  '#4488FF', // Light Blue
  '#FF8844', // Light Orange
  '#8888FF', // Lavender
  '#FFFFFF', // White
];

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  currentTool,
  onToolChange,
  currentColor,
  onColorChange,
  currentSize,
  onSizeChange,
  connectedUsers = 1,
}) => {
  return (
    <div className="bg-gradient-toolbar backdrop-blur-lg border border-toolbar-border rounded-2xl shadow-floating p-4 animate-slide-up">
      {/* Tool Selection */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <Button
            variant={currentTool === 'brush' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToolChange('brush')}
            className={cn(
              "transition-all duration-200",
              currentTool === 'brush' 
                ? "bg-gradient-primary text-primary-foreground shadow-primary" 
                : "hover:bg-muted"
            )}
          >
            <Brush className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === 'eraser' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToolChange('eraser')}
            className={cn(
              "transition-all duration-200",
              currentTool === 'eraser' 
                ? "bg-destructive text-destructive-foreground shadow-primary" 
                : "hover:bg-muted"
            )}
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Connected Users Indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-medium">{connectedUsers}</span>
        </div>
      </div>

      {/* Brush Size */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-sm font-medium text-foreground">Size</div>
          <div className="text-xs text-muted-foreground">{currentSize}px</div>
        </div>
        <Slider
          value={[currentSize]}
          onValueChange={(value) => onSizeChange(value[0])}
          min={1}
          max={50}
          step={1}
          className="w-full"
        />
        {/* Size Preview */}
        <div className="flex justify-center mt-2">
          <div
            className="rounded-full border-2 border-muted transition-all duration-200"
            style={{
              width: Math.max(currentSize, 4),
              height: Math.max(currentSize, 4),
              backgroundColor: currentTool === 'brush' ? currentColor : '#e5e5e5',
            }}
          />
        </div>
      </div>

      {/* Color Picker */}
      {currentTool === 'brush' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4" />
            <div className="text-sm font-medium text-foreground">Color</div>
          </div>
          
          {/* Custom Color Input */}
          <div className="mb-3">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-full h-12 rounded-lg border-2 border-muted cursor-pointer hover:border-primary transition-colors duration-200"
            />
          </div>

          {/* Preset Colors */}
          <div className="grid grid-cols-8 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={cn(
                  "w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110",
                  currentColor === color
                    ? "border-primary shadow-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-primary/50",
                  color === '#FFFFFF' ? "bg-white" : ""
                )}
                style={{
                  backgroundColor: color,
                }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};