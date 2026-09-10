/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import DisasterMap from './components/DisasterMap';
import FeedPanel from './components/FeedPanel';
import StatsBar from './components/StatsBar';
import EventDetailModal from './components/EventDetailModal';
import JudgePresentationModal from './components/JudgePresentationModal';
import ShareTeamModal from './components/ShareTeamModal';
import AIBriefingModal from './components/AIBriefingModal';
import { DisasterEvent, EventsApiResponse } from './types';
import { Bell, Map, ListFilter, X } from 'lucide-react';

export default function App() {
  const [allEvents, setAllEvents] = useState<DisasterEvent[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<DisasterEvent | null>(null);
  const [inspectingEvent, setInspectingEvent] = useState<DisasterEvent | null>(null);
  
  // Modals state
  const [showJudgePitch, setShowJudgePitch] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAIBriefing, setShowAIBriefing] = useState(false);
  const [notificationEvent, setNotificationEvent] = useState<DisasterEvent | null>(null);
  const knownEventIdsRef = useRef<Set<string> | null>(null);
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const showNotificationFor = useCallback((event: DisasterEvent) => {
    setNotificationEvent(event);
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    notificationTimeoutRef.current = setTimeout(() => setNotificationEvent(null), 8000);
  }, []);

  // Fetch events from server
  const loadEvents = useCallback(async (force = false) => {
    if (force) setIsRefreshing(true);
    try {
      const url = force ? '/api/events?force=true' : '/api/events';
      const res = await fetch(url);
      const data: EventsApiResponse = await res.json();

      if (data.ok && Array.isArray(data.events)) {
        const knownEventIds = knownEventIdsRef.current;
        const nextEvents = data.events;

        if (!knownEventIds && nextEvents.length > 0) {
          const demoEvent: DisasterEvent = {
            ...nextEvents[0],
            title: `Emergency alert: ${nextEvents[0].title}`,
          };
          showNotificationFor(demoEvent);
        } else if (knownEventIds) {
          const newEvent = nextEvents.find((event) => !knownEventIds.has(event.id));
          if (newEvent) showNotificationFor(newEvent);
        }

        knownEventIdsRef.current = new Set(nextEvents.map((event) => event.id));
        setAllEvents(nextEvents);
        setUpdatedAt(data.updatedAt || Date.now());
        setIsCached(Boolean(data.cached));
        if (data.sources) setSources(data.sources);

        // If no event selected yet, default to first critical or first event
        if (!selectedEvent && nextEvents.length > 0) {
          const firstCritical = nextEvents.find((e) => e.severityLevel === 'critical') || nextEvents[0];
          setSelectedEvent(firstCritical);
        }
      }
    } catch (err) {
      console.error('Failed to load disaster telemetry:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedEvent, showNotificationFor]);

  // Initial load and periodic 5-minute refresh
  useEffect(() => {
    loadEvents();
    const interval = setInterval(() => {
      loadEvents();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadEvents]);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    };
  }, []);

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

      {notificationEvent && (
        <div className="fixed top-20 right-4 z-[1000] w-[min(360px,calc(100vw-2rem))]" role="status" aria-live="polite">
          <button
            type="button"
            onClick={() => {
              setSelectedEvent(notificationEvent);
              setNotificationEvent(null);
            }}
            className="w-full text-left bg-[#101D2B]/95 border border-amber-400/60 rounded-lg shadow-2xl backdrop-blur-md p-3 pr-9 hover:bg-[#16283A] transition"
          >
            <Bell className="absolute left-3 top-3.5 w-4 h-4 text-amber-300" />
            <span className="block pl-7 text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase">
              New incident detected
            </span>
            <span className="block pl-7 mt-1 text-sm font-semibold text-white leading-tight">
              {notificationEvent.title}
            </span>
            <span className="block pl-7 mt-1 text-xs text-slate-400">
              {notificationEvent.category} | Click to inspect on the map
            </span>
          </button>
          <button
            type="button"
            onClick={() => setNotificationEvent(null)}
            aria-label="Dismiss incident notification"
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
