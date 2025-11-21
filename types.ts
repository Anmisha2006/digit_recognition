import React from 'react';

export interface RecognitionResult {
  digit: string;
  confidence?: string;
  rawText: string;
}

export interface DrawingCanvasProps {
  width: number;
  height: number;
  onDrawStart?: () => void;
  onDrawEnd?: () => void;
  className?: string;
  ref?: React.RefObject<DrawingCanvasRef>;
}

export interface DrawingCanvasRef {
  clearCanvas: () => void;
  getDataUrl: () => string;
  isEmpty: () => boolean;
}