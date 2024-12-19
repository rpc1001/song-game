import React from "react";

interface ProgressBarProps {
  progress: number;
  snippetDuration: number;
  maxDuration: number;
}

export default function ProgressBar({
  progress,
  snippetDuration,
  maxDuration,
}: ProgressBarProps) {
  return (
    <div className="relative w-full mt-4 h-2 bg-zinc-700 rounded-full overflow-hidden">
      <div
        className="absolute top-0 left-0 h-full bg-gray-500"
        style={{ width: `${(snippetDuration / maxDuration) * 100}%` }}
      >
        <div
          className="h-full bg-violet-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
