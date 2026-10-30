import React from 'react';
import { Modal } from '../ui/Modal';
import { ShieldAlert, ArrowRight, AlertOctagon } from 'lucide-react';

interface CycleAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  cyclePath?: string[];
  message?: string;
  sourceTaskTitle?: string;
  targetTaskTitle?: string;
}

export const CycleAlertModal: React.FC<CycleAlertModalProps> = ({
  isOpen,
  onClose,
  cyclePath = [],
  message,
  sourceTaskTitle,
  targetTaskTitle
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Circular Dependency Rejected"
      description="BlockerGraph AI Graph Engine detected an invalid cyclic dependency loop."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Danger Alert Box */}
        <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-[#EF4444]/20 text-[#EF4444] shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              Infinite Execution Loop Invariant Violated
            </h4>
            <p className="text-[11px] text-[#FCA5A5] mt-1 leading-relaxed">
              {message ||
                'A task cannot depend on a predecessor that transitively depends on it. In CPM scheduling, cycles create a deadlock where neither task can ever start.'}
            </p>
          </div>
        </div>

        {/* Attempted Relationship */}
        {sourceTaskTitle && targetTaskTitle && (
          <div className="p-3 rounded-lg bg-[#0D111B] border border-[#263044] text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Attempted Dependency Link:
            </span>
            <div className="flex items-center gap-2 font-medium">
              <span className="px-2 py-0.5 rounded bg-[#111827] border border-[#263044] text-[#38BDF8] truncate max-w-[170px]">
                {sourceTaskTitle}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#EF4444]" />
              <span className="px-2 py-0.5 rounded bg-[#111827] border border-[#263044] text-[#F87171] truncate max-w-[170px]">
                {targetTaskTitle}
              </span>
            </div>
          </div>
        )}

        {/* Cycle Path Visualization */}
        {cyclePath.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Cycle Chain Path Sequence
            </span>
            <div className="p-3 rounded-lg bg-[#080B12] border border-[#EF4444]/20 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                {cyclePath.map((nodeName, idx) => (
                  <React.Fragment key={idx}>
                    <span
                      className={`px-2 py-0.5 rounded border text-[11px] font-medium ${
                        idx === 0 || idx === cyclePath.length - 1
                          ? 'bg-[#EF4444]/20 border-[#EF4444]/50 text-[#FCA5A5]'
                          : 'bg-[#111827] border-[#263044] text-slate-300'
                      }`}
                    >
                      {nodeName}
                    </span>
                    {idx < cyclePath.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-[#EF4444] shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Guidance */}
        <div className="p-3 rounded-lg bg-[#111827] border border-[#263044] text-[11px] text-slate-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">DAG Integrity Invariant:</strong> BlockerGraph AI enforces Directed Acyclic Graph constraints to guarantee deterministic Critical Path Method (CPM) solutions.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#111827] hover:bg-[#1A2333] text-white font-medium text-xs border border-[#263044] transition-colors"
          >
            Dismiss & Cancel Link
          </button>
        </div>
      </div>
    </Modal>
  );
};
