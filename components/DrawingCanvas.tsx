import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { DrawingCanvasRef, DrawingCanvasProps } from '../types';

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  ({ width, height, onDrawStart, onDrawEnd, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    useImperativeHandle(ref, () => ({
      clearCanvas: () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            setHasDrawn(false);
          }
        }
      },
      getDataUrl: () => {
        const canvas = canvasRef.current;
        return canvas ? canvas.toDataURL('image/png') : '';
      },
      isEmpty: () => !hasDrawn
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Initial white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          
          // Drawing settings
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = 15; // Thicker line for better recognition
          ctx.strokeStyle = '#000000';
        }
      }
    }, [width, height]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCoordinates(e, canvas);
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      if (onDrawStart) onDrawStart();
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCoordinates(e, canvas);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      if (!hasDrawn) setHasDrawn(true);
    };

    const stopDrawing = () => {
      if (isDrawing) {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.closePath();
        }
        if (onDrawEnd) onDrawEnd();
      }
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`${className} touch-none cursor-crosshair bg-white shadow-inner rounded-lg border-2 border-slate-200`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ width, height }} // Explicit style for layout stability
      />
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
