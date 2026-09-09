import { X, Award, CheckCircle2, Cpu, Zap, Shield, Globe2, Layers, Users, Play } from 'lucide-react';

interface JudgePresentationModalProps {
  onClose: () => void;
  onFocusIndia: () => void;
}

export default function JudgePresentationModal({
  onClose,
  onFocusIndia,
}: JudgePresentationModalProps) {
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0F1B29] border border-[#22374A] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#22374A] bg-[#16283A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  SIH HACKATHON PITCH
                </span>
                <span className="text-xs font-mono text-slate-400">Problem Statement ID: SIH1687</span>
              </div>
              <h2 className="text-base font-display font-bold text-white mt-0.5">
                RakshaNet: Real-Time Disaster Aggregation Platform
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs font-mono text-slate-300">
          {/* Problem Statement Card */}
          <div className="p-3.5 rounded-lg bg-[#122232] border border-cyan-900/50">
            <h3 className="text-cyan-300 font-bold tracking-wider text-[11px] uppercase mb-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>The Problem (SIH 1687)</span>
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Disaster response agencies and citizens currently face critical information fragmentation across disparate departmental silos (geological, meteorological, and hydrological feeds). Lack of a unified, low-latency situational dashboard causes delays in relief dispatch and emergency mobilization.
            </p>
          </div>

          {/* 4 Core Pillars of RakshaNet */}
          <div>
            <h3 className="text-white font-bold tracking-wider text-[11px] uppercase mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Core Architectural Pillars</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-md bg-[#16283A] border border-[#22374A]">
                <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>1. Multi-Stream Ingestion</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  Continuous asynchronous pooling from NASA EONET and USGS GeoJSON feeds with an in-memory 5-minute caching layer and offline fallback guarantee.
                </p>
              </div>

              <div className="p-3 rounded-md bg-[#16283A] border border-[#22374A]">
                <div className="flex items-center gap-2 text-emerald-300 font-bold mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>2. Geospatial Normalization</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  Unifies disparate coordinates, severity rankings, and disaster taxonomies into a standard ISO-8601 indexed geospatial model.
                </p>
              </div>

              <div className="p-3 rounded-md bg-[#16283A] border border-[#22374A]">
                <div className="flex items-center gap-2 text-purple-300 font-bold mb-1">
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>3. Tactical GIS Interface</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  High-FPS Leaflet engine featuring chromatic pulse beacons, smooth viewport fly-to, dark CartoDB tiles, and 1-click India disaster focus.
                </p>
              </div>

              <div className="p-3 rounded-md bg-[#16283A] border border-[#22374A]">
                <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>4. Field SOPs &amp; AI Triage</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  Instant situational threat briefing and NDRF/SDRF disaster response guidelines for rapid on-ground deployment.
                </p>
              </div>
            </div>
          </div>

          {/* Judge Demo Script Walkthrough */}
          <div className="p-3.5 rounded-lg bg-[#16283A] border border-[#22374A]">
            <h3 className="text-amber-300 font-bold tracking-wider text-[11px] uppercase mb-2 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-amber-400" />
              <span>Recommended 2-Minute Judge Demo Flow</span>
            </h3>
            <ol className="space-y-1.5 text-[11px] text-slate-300 list-decimal list-inside">
              <li>
                <span className="font-semibold text-white">Live Ingestion:</span> Point to the top live indicator and stats bar showing live NASA &amp; USGS API connection with zero latency.
              </li>
              <li>
                <span className="font-semibold text-white">Interactive Filtering:</span> Click &quot;Earthquakes&quot; or &quot;Wildfires&quot; to demonstrate instant sub-second geospatial re-clustering.
              </li>
              <li>
                <span className="font-semibold text-white">India Focus:</span> Click &quot;India (SIH)&quot; to showcase regional disaster monitoring across the subcontinent.
              </li>
              <li>
                <span className="font-semibold text-white">Field Triage:</span> Click any incident card in the feed to fly directly to coordinates and inspect official NDRF guidelines.
              </li>
              <li>
                <span className="font-semibold text-white">Team &amp; Mobile Sharing:</span> Open the Share modal to display the live QR code allowing judges to test on their smartphones.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0B1420] border-t border-[#22374A] flex items-center justify-between">
          <button
            onClick={() => {
              onFocusIndia();
              onClose();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition cursor-pointer"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Jump to India (SIH Focus)</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#16283A] hover:bg-[#22374A] text-slate-300 text-xs font-mono transition"
          >
            Close Pitch Deck
          </button>
        </div>
      </div>
    </div>
  );
}
