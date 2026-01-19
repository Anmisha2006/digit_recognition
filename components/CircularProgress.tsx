import React from 'react';

interface CircularProgressProps {
  percentage: number;
  label: string;
  color: 'green' | 'blue' | 'indigo';
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, label, color }) => {
  // SVG Configuration
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color Themes
  const colorMap = {
    green: {
      text: 'text-green-600',
      bg: 'text-green-100',
      stroke: 'text-green-500'
    },
    blue: {
      text: 'text-blue-600',
      bg: 'text-blue-100',
      stroke: 'text-blue-500'
    },
    indigo: {
      text: 'text-indigo-600',
      bg: 'text-indigo-100',
      stroke: 'text-indigo-500'
    }
  };

  const styles = colorMap[color] || colorMap.indigo;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-24">
        {/* Rotated SVG so progress starts from top (12 o'clock) */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          {/* Background Track Circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className={`${styles.bg}`}
          />
          {/* Progress Indicator Circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${styles.stroke} transition-[stroke-dashoffset] duration-1000 ease-out`}
          />
        </svg>
        {/* Center Percentage Text */}
        <div className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${styles.text}`}>
          {Math.round(percentage)}%
        </div>
      </div>
      {/* Label */}
      <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${styles.text}`}>{label}</span>
    </div>
  );
};

export default CircularProgress;