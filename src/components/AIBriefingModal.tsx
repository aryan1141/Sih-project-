import { useState, useEffect } from 'react';
import { X, BrainCircuit, ShieldAlert, Sparkles, RefreshCw, Copy, Check, AlertCircle } from 'lucide-react';
import { DisasterEvent, AISituationReport } from '../types';

interface AIBriefingModalProps {
  onClose: () => void;
  events: DisasterEvent[];
}

export default function AIBriefingModal({ onClose, events }: AIBriefingModalProps) {
  const [report, setReport] = useState<AISituationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: events.slice(0, 20) }),
      });
      const data = await res.json();
      if (data.ok && data.report) {
        setReport(data.report);
      } else {
        throw new Error(data.error || 'Failed to generate briefing');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError('Could not complete automated situation synthesis. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const handleCopy = () => {
    if (!report) return;
    const text = `[RAKSHANET DISASTER SITUATION BRIEFING]
Generated: ${report.generatedAt}

OVERVIEW:
${report.summary}

HIGH-RISK HOTSPOTS:
${report.highestRiskHotspots.map((h, i) => `${i + 1}. [${h.threatType}] ${h.region} (${h.severity.toUpperCase()}): ${h.recommendedAction}`).join('\n')}

OPERATIONAL PREPAREDNESS TIPS:
${report.evacuationOrPreparednessTips.map((t, i) => `• ${t}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0F1B29] border border-[#22374A] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#22374A] bg-[#16283A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI SITUATION SYNTHESIS</span>
                </span>
                <span className="text-xs font-mono text-slate-400">Gemini Powered</span>
              </div>
              <h2 className="text-base font-display font-bold text-white mt-0.5">
                Executive Disaster Briefing
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
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono text-slate-300">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-300 font-medium">Synthesizing telemetry across {events.length} active global incidents...</p>
              <span className="text-[11px] text-slate-500">Evaluating seismic clusters, flood wave fronts, and atmospheric surges</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
                <button
                  onClick={fetchAnalysis}
                  className="mt-2 text-cyan-400 underline hover:text-cyan-300 text-[11px]"
                >
                  Click to re-try synthesis
                </button>
              </div>
            </div>
          ) : report ? (
            <>
              {/* Executive Summary */}
              <div className="p-3.5 rounded-lg bg-[#122232] border border-cyan-900/40">
                <h3 className="text-cyan-300 font-bold tracking-wider text-[11px] uppercase mb-1.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  <span>Strategic Threat Assessment</span>
                </h3>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {report.summary}
                </p>
              </div>

              {/* High Risk Hotspots */}
              <div>
                <h3 className="text-amber-300 font-bold tracking-wider text-[11px] uppercase mb-2">
                  Priority Operational Hotspots
                </h3>
                <div className="space-y-2">
                  {report.highestRiskHotspots.map((hotspot, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#16283A] border border-[#22374A] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{hotspot.region}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            hotspot.severity === 'critical'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-orange-950 text-orange-300 border border-orange-800'
                          }`}
                        >
                          {hotspot.threatType} &bull; {hotspot.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-normal pt-0.5">
                        <span className="text-cyan-300 font-medium">Action: </span>
                        {hotspot.recommendedAction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparedness Tips */}
              <div className="p-3.5 rounded-lg bg-[#16283A] border border-[#22374A]">
                <h3 className="text-emerald-300 font-bold tracking-wider text-[11px] uppercase mb-2">
                  Field Preparedness &amp; Evacuation Directives
                </h3>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  {report.evacuationOrPreparednessTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">&bull;</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0B1420] border-t border-[#22374A] flex items-center justify-between font-mono text-xs">
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#16283A] hover:bg-[#22374A] text-slate-300 border border-[#22374A] transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Regenerate Briefing</span>
          </button>

          <div className="flex items-center gap-2">
            {report && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Briefing'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[#16283A] hover:bg-[#22374A] text-slate-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
