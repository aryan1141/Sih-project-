import { useState, useMemo } from 'react';
import { DisasterEvent } from '../types';
import { colorFor, getSeverityBadge } from '../utils/colors';
import { timeAgo } from '../utils/time';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronRight, ExternalLink, AlertTriangle } from 'lucide-react';

interface FeedPanelProps {
  events: DisasterEvent[];
  selectedEvent: DisasterEvent | null;
  onSelectEvent: (event: DisasterEvent) => void;
  onOpenDetailModal: (event: DisasterEvent) => void;
  activeCategory: string;
  loading: boolean;
}

export default function FeedPanel({
  events,
  selectedEvent,
  onSelectEvent,
  onOpenDetailModal,
  activeCategory,
  loading,
}: FeedPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'severity'>('recent');

  const filteredEvents = useMemo(() => {
    let list = [...events];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.detail && e.detail.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'severity') {
      list.sort((a, b) => {
        const score = (ev: DisasterEvent) => {
          if (ev.severityLevel === 'critical') return 4;
          if (ev.severityLevel === 'high') return 3;
          if (ev.severityLevel === 'moderate') return 2;
          return 1;
        };
        return score(b) - score(a);
      });
    } else {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return list;
  }, [events, searchQuery, sortBy]);

  return (
    <aside className="w-full md:w-[360px] lg:w-[400px] h-full flex flex-col bg-[#0F1B29] border-l border-[#22374A] min-h-0 select-none">
      {/* Feed Panel Header */}
      <div className="p-3.5 border-b border-[#22374A] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-sm tracking-wide text-[#EAF1F7]">
              LIVE INCIDENT FEED
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setSortBy(sortBy === 'recent' ? 'severity' : 'recent')}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#16283A] hover:bg-[#22374A] text-slate-300 text-[11px] border border-[#22374A] transition"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3 h-3 text-cyan-400" />
              <span>{sortBy === 'recent' ? 'Latest' : 'Severity'}</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search region, city, or disaster type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#16283A] text-xs font-mono text-slate-200 placeholder-slate-500 rounded-md border border-[#22374A] focus:outline-none focus:border-cyan-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Feed List Items */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs font-mono gap-2">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Synchronizing live telemetry from NASA & USGS...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-400 text-xs font-mono">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2 opacity-80" />
            <p>No active incidents found matching filter criteria.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-cyan-400 underline hover:text-cyan-300"
              >
                Clear search query
              </button>
            )}
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const isSelected = selectedEvent?.id === ev.id;
            const color = colorFor(ev.category);
            const severity = getSeverityBadge(ev.severityLevel);

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className={`group relative rounded-md p-2.5 cursor-pointer border transition-all text-left ${
                  isSelected
                    ? 'bg-[#1a3148] border-cyan-400 shadow-md translate-x-1'
                    : 'bg-[#16283A] border-[#22374A] hover:border-slate-500 hover:translate-x-0.5'
                }`}
                style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className="text-[11px] font-mono font-bold tracking-wider uppercase"
                    style={{ color }}
                  >
                    {ev.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {ev.severityLevel === 'critical' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                        CRITICAL
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-400">
                      {timeAgo(ev.date)}
                    </span>
                  </div>
                </div>

                <h3 className="text-xs font-medium text-slate-100 line-clamp-2 leading-snug mb-1.5 group-hover:text-cyan-200 transition-colors">
                  {ev.title}
                </h3>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="truncate max-w-[190px]">
                    {ev.detail ? ev.detail : `${ev.lat.toFixed(2)}°, ${ev.lon.toFixed(2)}°`}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetailModal(ev);
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-cyan-600/40 text-slate-300 hover:text-cyan-200 text-[10px] flex items-center gap-1 transition"
                      title="Inspect full telemetry & response guidelines"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
