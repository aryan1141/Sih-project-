import { colorFor } from '../utils/colors';
import { timeAgo } from '../utils/time';
import { Activity, Radio, PhoneCall, CheckCircle } from 'lucide-react';

interface StatsBarProps {
  totalCount: number;
  categoryCounts: Record<string, number>;
  updatedAt: number;
  isCached: boolean;
  sources?: {
    nasaEonet: { count: number; status: 'ok' | 'degraded' | 'cached' };
    usgs: { count: number; status: 'ok' | 'degraded' | 'cached' };
  };
}

export default function StatsBar({
  totalCount,
  categoryCounts,
  updatedAt,
  isCached,
  sources,
}: StatsBarProps) {
  const sortedCategories = Object.keys(categoryCounts).sort(
    (a, b) => categoryCounts[b] - categoryCounts[a]
  );

  return (
    <footer className="px-4 py-2 bg-[#0F1B29] border-t border-[#22374A] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 select-none z-10">
      {/* Total Events Count */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-sm text-slate-100">{totalCount}</span>
          <span className="uppercase text-[11px] tracking-wider text-slate-400">Active Events</span>
        </div>

        <div className="h-4 w-[1px] bg-[#22374A] hidden sm:block" />

        {/* Dynamic Category Counts */}
        <div className="hidden md:flex items-center gap-3 overflow-x-auto">
          {sortedCategories.slice(0, 5).map((cat) => {
            const count = categoryCounts[cat];
            const color = colorFor(cat);
            return (
              <div key={cat} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-slate-100 font-semibold">{count}</span>
                <span className="text-[11px] text-slate-400">{cat}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upstream Data Sources Status & Last Updated */}
      <div className="flex items-center gap-3 ml-auto text-[11px]">
        <div className="hidden lg:flex items-center gap-2 px-2 py-0.5 rounded bg-[#16283A] border border-[#22374A]">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-slate-300">NASA EONET &amp; USGS API:</span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <span>Synced:</span>
          <span className="text-slate-200 font-medium">{updatedAt ? timeAgo(new Date(updatedAt).toISOString()) : 'just now'}</span>
          {isCached && <span className="text-[10px] text-cyan-400">(cached)</span>}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-[#22374A] text-amber-300/80">
          <PhoneCall className="w-3 h-3 text-amber-400" />
          <span>NDRF: 1078 / 112</span>
        </div>
      </div>
    </footer>
  );
}
