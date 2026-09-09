import { DisasterEvent } from '../types';
import { colorFor } from '../utils/colors';
import { RefreshCw, Share2, Presentation, BrainCircuit, Shield, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  categoryCounts: Record<string, number>;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenJudgePitch: () => void;
  onOpenShareModal: () => void;
  onOpenAIBriefing: () => void;
  isCached: boolean;
  totalEventsCount: number;
}

export default function Header({
  categories,
  activeCategory,
  onSelectCategory,
  categoryCounts,
  onRefresh,
  isRefreshing,
  onOpenJudgePitch,
  onOpenShareModal,
  onOpenAIBriefing,
  isCached,
  totalEventsCount,
}: HeaderProps) {
  return (
    <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 px-4 py-2.5 bg-[#0F1B29] border-b border-[#22374A] relative z-20">
      {/* Brand & Live Indicator */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="live-dot" title="Live Continuous Ingestion"></span>
          <div className="flex items-baseline gap-1.5">
            <h1 className="font-display text-lg lg:text-xl font-extrabold tracking-wider text-white">
              RAKSHA<span className="text-[#3FC7C0]">NET</span>
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold tracking-wide">
              SIH-1687
            </span>
          </div>

          <div className="hidden lg:flex items-center pl-2.5 border-l border-[#22374A] text-xs font-mono text-slate-400">
            <span>Real-Time Disaster Information Aggregation</span>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={onOpenJudgePitch}
            className="p-1.5 rounded bg-[#16283A] text-amber-300 border border-amber-500/40 text-xs font-mono"
            title="Judge Presentation"
          >
            <Presentation className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenShareModal}
            className="p-1.5 rounded bg-[#16283A] text-cyan-300 border border-cyan-500/40 text-xs font-mono"
            title="Share with Team"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded bg-[#16283A] text-slate-300 border border-slate-700 text-xs"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Filter Pills (Scrollable horizontally if needed) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const count = cat === 'All' ? totalEventsCount : (categoryCounts[cat] || 0);
          const color = cat === 'All' ? '#3FC7C0' : colorFor(cat);

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-slate-100 text-[#0B1420] font-bold shadow-sm'
                  : 'bg-[#16283A] text-slate-300 border-[#22374A] hover:text-white hover:border-slate-500'
              }`}
              style={{
                borderColor: isActive ? color : undefined,
                backgroundColor: isActive ? color : undefined,
                color: isActive ? '#0B1420' : undefined,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isActive ? '#0B1420' : color }}
              />
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1 rounded-full ${
                  isActive ? 'bg-black/20 text-black' : 'bg-black/30 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Presentation, AI Briefing & Team Share Actions */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={onOpenJudgePitch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-medium shadow transition"
          title="SIH 1687 Judge Presentation Mode"
        >
          <Presentation className="w-3.5 h-3.5 text-amber-400" />
          <span>Judge Pitch</span>
        </button>

        <button
          onClick={onOpenAIBriefing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-medium transition"
          title="AI Automated Threat Briefing"
        >
          <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Briefing</span>
        </button>

        <button
          onClick={onOpenShareModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#16283A] hover:bg-[#22374A] text-slate-200 border border-[#22374A] text-xs font-mono font-medium transition"
          title="Share prototype link & QR code with team"
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Share</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-md bg-[#16283A] hover:bg-[#22374A] text-slate-300 border border-[#22374A] transition"
          title="Force refresh upstream live feeds"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    </header>
  );
}
