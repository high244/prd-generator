import React, { useState } from 'react';

/**
 * Gold Standard: PRDFeatureCard
 * Reference exemplar for PRD Generator & Studio components.
 * Adheres to DESIGN.md (Cockpit Dense, Asymmetric Variance, Spring Micro-interactions).
 */
export interface PRDFeatureCardProps {
  readonly id: string;
  readonly featureId: string; // e.g. "REQ-FEAT-004"
  readonly title: string;
  readonly description: string;
  readonly priority: 'P0' | 'P1' | 'P2';
  readonly complexity: 'Low' | 'Medium' | 'High';
  readonly tags: readonly string[];
  readonly tokenEstimate?: number;
  readonly onSelect?: (id: string) => void;
  readonly isSelected?: boolean;
}

const PRIORITY_BADGES: Record<PRDFeatureCardProps['priority'], { label: string; className: string }> = {
  P0: {
    label: 'P0 Critical',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  P1: {
    label: 'P1 High',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  P2: {
    label: 'P2 Medium',
    className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
};

export const PRDFeatureCard: React.FC<PRDFeatureCardProps> = ({
  id,
  featureId,
  title,
  description,
  priority,
  complexity,
  tags,
  tokenEstimate,
  onSelect,
  isSelected = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const badge = PRIORITY_BADGES[priority];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(id);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col justify-between rounded-xl border transition-all duration-200 ease-out p-4 text-left outline-none cursor-pointer select-none active:scale-[0.99] ${
        isSelected
          ? 'bg-slate-900/90 border-brand-500 ring-1 ring-brand-500/50 shadow-lg shadow-brand-500/10'
          : 'bg-slate-900/40 border-white/[0.08] hover:border-white/[0.18] hover:bg-slate-900/70'
      }`}
    >
      {/* Top Header: ID & Priority */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-slate-400 tracking-wider">
            {featureId}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        {tokenEstimate && (
          <span className="font-mono text-[11px] text-slate-500">
            ~{tokenEstimate.toLocaleString()} tokens
          </span>
        )}
      </div>

      {/* Title & Description */}
      <div className="space-y-1.5 mb-3">
        <h3 className="text-[15px] font-semibold text-slate-100 group-hover:text-brand-400 transition-colors tracking-tight">
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-slate-400 line-clamp-2">
          {description}
        </p>
      </div>

      {/* Footer: Tags & Complexity */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05] text-xs">
        <div className="flex flex-wrap gap-1.5 items-center">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 font-mono text-[10px] border border-white/[0.04]"
            >
              #{tag}
            </span>
          ))}
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          Complexity: <span className="text-slate-300">{complexity}</span>
        </span>
      </div>
    </div>
  );
};

export default PRDFeatureCard;
