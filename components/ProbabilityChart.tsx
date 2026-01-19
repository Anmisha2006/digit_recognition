import React from 'react';

interface ProbabilityChartProps {
  data: number[];
  highlightIndex: number | null;
}

const ProbabilityChart: React.FC<ProbabilityChartProps> = ({ data, highlightIndex }) => {
  return (
    <div className="w-full h-40 flex items-end justify-between gap-2">
      {data.map((value, index) => {
        const isHighlighted = index === highlightIndex;
        // Ensure a minimum height so the bar is visible even at 0
        const height = Math.max(value, 2); 
        
        return (
          <div key={index} className="flex flex-col items-center justify-end flex-1 h-full group relative">
            {/* Tooltip on hover */}
            <div className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {value}%
            </div>

            {/* The Bar */}
            <div 
              className={`w-full rounded-t-sm transition-all duration-1000 ease-out ${
                isHighlighted ? 'bg-indigo-500' : 'bg-slate-200 hover:bg-slate-300'
              }`}
              style={{ height: `${height}%` }}
            ></div>
            
            {/* X-Axis Label */}
            <div className={`mt-2 text-xs font-medium ${isHighlighted ? 'text-indigo-600' : 'text-slate-400'}`}>
              {index}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProbabilityChart;