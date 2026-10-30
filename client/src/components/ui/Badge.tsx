import React from 'react';
import { Priority, TaskStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'ready' | 'blocked' | 'progress' | 'completed' | 'critical' | 'cyan' | 'indigo' | 'amber';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  size = 'md'
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  const variantClasses = {
    default: 'bg-[#1F293D] text-slate-300 border border-[#263044]',
    ready: 'bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/25',
    blocked: 'bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/30 font-medium',
    progress: 'bg-[#0284C7]/15 text-[#38BDF8] border border-[#0284C7]/30',
    completed: 'bg-[#1E293B] text-slate-400 border border-[#334155]',
    critical: 'bg-[#EF4444]/15 text-[#FCA5A5] border border-[#EF4444]/40 font-semibold',
    cyan: 'bg-[#06B6D4]/15 text-[#22D3EE] border border-[#06B6D4]/30',
    indigo: 'bg-[#6366F1]/15 text-[#A5B4FC] border border-[#6366F1]/30',
    amber: 'bg-[#F59E0B]/15 text-[#FCD34D] border border-[#F59E0B]/30 font-medium'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium tracking-wide ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  switch (status) {
    case 'Blocked':
      return (
        <Badge variant="blocked" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
          Blocked
        </Badge>
      );
    case 'In Progress':
      return (
        <Badge variant="progress" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
          In Progress
        </Badge>
      );
    case 'Ready':
      return (
        <Badge variant="ready" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          Ready
        </Badge>
      );
    case 'Completed':
      return (
        <Badge variant="completed" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Completed
        </Badge>
      );
    default:
      return <Badge size={size}>{status}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: Priority; size?: 'sm' | 'md' }> = ({ priority, size = 'md' }) => {
  switch (priority) {
    case 'Critical':
      return (
        <Badge variant="critical" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          Critical
        </Badge>
      );
    case 'High':
      return (
        <Badge variant="amber" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          High
        </Badge>
      );
    case 'Medium':
      return (
        <Badge variant="indigo" size={size}>
          Medium
        </Badge>
      );
    case 'Low':
      return (
        <Badge variant="default" size={size}>
          Low
        </Badge>
      );
    default:
      return <Badge size={size}>{priority}</Badge>;
  }
};
