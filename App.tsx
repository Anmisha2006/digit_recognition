import React, { useRef, useState } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import { recognizeDigit } from './services/geminiService';
import { DrawingCanvasRef, RecognitionResult } from './types';
import { BrainIcon, EraserIcon, LoaderIcon } from './components/Icons';

const App: React.FC = () => {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDrawnImage, setLastDrawnImage] = useState<string | null>(null);

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
      setResult(null);
      setError(null);
      setLastDrawnImage(null);
    }
  };

  const handleRecognize = async () => {
    if (!canvasRef.current) return;
    
    if (canvasRef.current.isEmpty()) {
      setError("Canvas is empty! Please draw a digit first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const dataUrl = canvasRef.current.getDataUrl();
      setLastDrawnImage(dataUrl);
      
      const recognitionResult = await recognizeDigit(dataUrl);
      setResult(recognitionResult);
    } catch (err) {
      setError("Failed to recognize the digit. Please check your API Key or try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          Digit Recognizer
        </h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Draw a single digit (0-9) below.
        </p>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Drawing Area */}
        <div className="flex flex-col items-center space-y-6 bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
            <div className="relative">
              <DrawingCanvas 
                ref={canvasRef} 
                width={300} 
                height={300}
                onDrawStart={() => {
                  if (result) setResult(null); // Clear previous result on new draw
                  if (error) setError(null);
                }}
              />
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 text-xs pointer-events-none select-none">
              Canvas
            </div>
          </div>

          <div className="flex space-x-4 w-full max-w-[300px]">
            <button
              onClick={handleClear}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-300"
              disabled={isAnalyzing}
            >
              <EraserIcon />
              <span>Clear</span>
            </button>
            <button
              onClick={handleRecognize}
              disabled={isAnalyzing}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isAnalyzing ? (
                <>
                  <LoaderIcon />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <BrainIcon />
                  <span>Recognize</span>
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm text-center w-full">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Results Area */}
        <div className="flex flex-col items-center justify-center space-y-6 min-h-[300px]">
          
          {/* Initial State / Placeholder */}
          {!result && !isAnalyzing && !lastDrawnImage && (
            <div className="text-center p-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 w-full h-full flex flex-col items-center justify-center bg-white/50">
              <BrainIcon />
              <p className="mt-4 font-medium">Ready to analyze</p>
              <p className="text-sm mt-2 text-slate-400/80">Draw a number and click Recognize</p>
            </div>
          )}

          {/* Thinking State */}
          {isAnalyzing && (
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-32 h-32 bg-slate-200 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-slate-200 rounded"></div>
            </div>
          )}

          {/* Result State */}
          {result && (
            <div className="w-full bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-fade-in-up">
               <div className="bg-indigo-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
                 <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">Result</span>
                 <span className="text-xs text-slate-400">Gemini 2.5 Flash</span>
               </div>
               <div className="p-8 flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="absolute -inset-4 bg-indigo-100 rounded-full blur-xl opacity-50"></div>
                    <span className="relative text-8xl font-black text-slate-800 leading-none">
                      {result.digit}
                    </span>
                  </div>
                  
                  <div className="w-full space-y-4">
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-sm font-semibold text-slate-500 mb-1">AI Analysis</p>
                        <p className="text-slate-800 italic">"{result.rawText}"</p>
                     </div>
                     
                     {lastDrawnImage && (
                       <div className="flex items-center justify-center space-x-3 mt-4 pt-4 border-t border-slate-50">
                         <span className="text-xs text-slate-400">Input Image:</span>
                         <img src={lastDrawnImage} alt="Drawn Digit" className="h-12 w-12 border border-slate-200 rounded bg-white object-contain" />
                       </div>
                     )}
                  </div>
               </div>
            </div>
          )}
        </div>

      </main>
      
      <footer className="mt-12 text-slate-400 text-sm">
        Powered by <a href="https://ai.google.dev/" className="text-indigo-500 hover:underline">Google Gemini API</a>
      </footer>
    </div>
  );
};

export default App;