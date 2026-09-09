/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import DisasterMap from './components/DisasterMap';
import FeedPanel from './components/FeedPanel';
import StatsBar from './components/StatsBar';
import EventDetailModal from './components/EventDetailModal';
import JudgePresentationModal from './components/JudgePresentationModal';
import ShareTeamModal from './components/ShareTeamModal';
import AIBriefingModal from './components/AIBriefingModal';
import { DisasterEvent, EventsApiResponse } from './types';
import { Map, ListFilter } from 'lucide-react';

export default function App() {
  const [allEvents, setAllEvents] = useState<DisasterEvent[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<DisasterEvent | null>(null);
  const [inspectingEvent, setInspectingEvent] = useState<DisasterEvent | null>(null);
  
  // Modals state
  const [showJudgePitch, setShowJudgePitch] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAIBriefing, setShowAIBriefing] = useState(false);

  // Loading and network state
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number>(0);
  const [isCached, setIsCached] = useState(false);
  const [sources, setSources] = useState<EventsApiResponse['sources']>({
    nasaEonet: { count: 0, status: 'ok' },
    usgs: { count: 0, status: 'ok' },
  });

  // Mobile view toggle ('map' | 'feed')
  const [mobileTab, setMobileTab] = useState<'map' | 'feed'>('map');

  // Fetch events from server
  const loadEvents = useCallback(async (force = false) => {
    if (force) setIsRefreshing(true);
    try {
      const url = force ? '/api/events?force=true' : '/api/events';
      const res = await fetch(url);
      const data: EventsApiResponse = await res.json();

      if (data.ok && Array.isArray(data.events)) {
        setAllEvents(data.events);
        setUpdatedAt(data.updatedAt || Date.now());
        setIsCached(Boolean(data.cached));
        if (data.sources) setSources(data.sources);

        // If no event selected yet, default to first critical or first event
        if (!selectedEvent && data.events.length > 0) {
          const firstCritical = data.events.find((e) => e.severityLevel === 'critical') || data.events[0];
          setSelectedEvent(firstCritical);
        }
      }
    } catch (err) {
      console.error('Failed to load disaster telemetry:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedEvent]);

  // Initial load and periodic 5-minute refresh
  useEffect(() => {
    loadEvents();
    const interval = setInterval(() => {
      loadEvents();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadEvents]);

  // Compute categories & category counts
  const { categories, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    const catSet = new Set<string>();

    allEvents.forEach((ev) => {
      const cat = ev.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
      catSet.add(cat);
    });

    return {
      categories: ['All', ...Array.from(catSet)],
      categoryCounts: counts,
    };
  }, [allEvents]);

  // Filtered list of events based on active category
  const filteredEvents = useMemo(() => {
    if (activeCategory === 'All') return allEvents;
    return allEvents.filter((ev) => ev.category === activeCategory);
  }, [allEvents, activeCategory]);

  const handleSelectEvent = (event: DisasterEvent) => {
    setSelectedEvent(event);
  };

  const handleOpenDetail = (event: DisasterEvent) => {
    setInspectingEvent(event);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B1420] text-[#EAF1F7] select-none font-sans">
      {/* Top Header Command Bar */}
      <Header
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        categoryCounts={categoryCounts}
        onRefresh={() => loadEvents(true)}
        isRefreshing={isRefreshing}
        onOpenJudgePitch={() => setShowJudgePitch(true)}
        onOpenShareModal={() => setShowShareModal(true)}
        onOpenAIBriefing={() => setShowAIBriefing(true)}
        isCached={isCached}
        totalEventsCount={allEvents.length}
      />

      {/* Mobile Tab Switcher (Visible on small screens) */}
      <div className="flex md:hidden border-b border-[#22374A] bg-[#0F1B29] text-xs font-mono">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition ${
            mobileTab === 'map' ? 'text-cyan-300 border-b-2 border-cyan-400 font-bold bg-[#16283A]' : 'text-slate-400'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Interactive GIS Map</span>
        </button>
        <button
          onClick={() => setMobileTab('feed')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition ${
            mobileTab === 'feed' ? 'text-cyan-300 border-b-2 border-cyan-400 font-bold bg-[#16283A]' : 'text-slate-400'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Incident Feed ({filteredEvents.length})</span>
        </button>
      </div>

      {/* Main Operational Workspace: GIS Map + Live Feed Sidebar */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 relative overflow-hidden">
        {/* Left GIS Map View */}
        <div className={`flex-1 h-full min-h-0 relative ${mobileTab === 'feed' ? 'hidden md:block' : 'block'}`}>
          <DisasterMap
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={handleSelectEvent}
            activeCategory={activeCategory}
          />
        </div>

        {/* Right Live Feed Sidebar */}
        <div className={`h-full min-h-0 ${mobileTab === 'map' ? 'hidden md:flex' : 'flex'}`}>
          <FeedPanel
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={(ev) => {
              handleSelectEvent(ev);
              if (window.innerWidth < 768) setMobileTab('map');
            }}
            onOpenDetailModal={handleOpenDetail}
            activeCategory={activeCategory}
            loading={loading}
          />
        </div>
      </main>

      {/* Bottom Global Telemetry & Status Bar */}
      <StatsBar
        totalCount={allEvents.length}
        categoryCounts={categoryCounts}
        updatedAt={updatedAt}
        isCached={isCached}
        sources={sources}
      />

      {/* Incident Detail Inspection Drawer / Modal */}
      {inspectingEvent && (
        <EventDetailModal
          event={inspectingEvent}
          onClose={() => setInspectingEvent(null)}
          onFlyTo={(ev) => {
            setSelectedEvent(ev);
            if (window.innerWidth < 768) setMobileTab('map');
          }}
        />
      )}

      {/* SIH Hackathon Judge Presentation Pitch Modal */}
      {showJudgePitch && (
        <JudgePresentationModal
          onClose={() => setShowJudgePitch(false)}
          onFocusIndia={() => {
            // Jumps to India event if exists or centers on India
            const indiaEvent = allEvents.find((e) => e.lat > 8 && e.lat < 36 && e.lon > 68 && e.lon < 97);
            if (indiaEvent) {
              setSelectedEvent(indiaEvent);
            }
          }}
        />
      )}

      {/* Team Collaboration & Mobile QR Code Share Modal */}
      {showShareModal && (
        <ShareTeamModal
          onClose={() => setShowShareModal(false)}
          events={filteredEvents}
        />
      )}

      {/* AI Automated Situation Briefing Modal */}
      {showAIBriefing && (
        <AIBriefingModal
          onClose={() => setShowAIBriefing(false)}
          events={filteredEvents}
        />
      )}
    </div>
  );
}
