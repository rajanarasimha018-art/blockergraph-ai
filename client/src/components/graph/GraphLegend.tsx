import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Sparkles } from 'lucide-react';

export const GraphLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute bottom-4 left-4 z-20 w-60 bg-[#0D111B]/95 border border-[#263044] rounded-xl shadow-xl overflow-hidden text-xs">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[#111827] hover:bg-[#162033] transition-colors border-b border-[#263044] text-slate-300 font-semibold"
      >
        <span className="flex items-center gap-1.5 text-xs">
          <Info className="w-3.5 h-3.5 text-[#22D3EE]" />
          Graph Legend & States
        </span>
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {isExpanded && (
        <div className="p-3 space-y-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-slate-300">Ready (Prerequisites Met)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
            <span className="text-slate-300">In Progress (Active)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
            <span className="text-[#F87171] font-semibold">Blocked (Prerequisite Pending)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
            <span className="text-slate-400">Completed (Deliverable Done)</span>
          </div>

          <div className="pt-2 border-t border-[#263044] space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded-full bg-[#F59E0B]" />
              <span className="text-[#FCD34D] font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Critical Path (0 Float)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-b border-dashed border-[#EF4444]" />
              <span className="text-[#F87171]">Blocked Dependency Link</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
