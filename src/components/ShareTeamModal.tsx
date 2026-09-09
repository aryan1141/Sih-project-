import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, QrCode, Download, Share2, Smartphone, Terminal, Users } from 'lucide-react';
import { DisasterEvent } from '../types';

interface ShareTeamModalProps {
  onClose: () => void;
  events: DisasterEvent[];
}

export default function ShareTeamModal({ onClose, events }: ShareTeamModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const url = window.location.href;
    setShareUrl(url);

    QRCode.toDataURL(url, {
      width: 220,
      margin: 1.5,
      color: {
        dark: '#0B1420',
        light: '#FFFFFF',
      },
    })
      .then((dataUri) => setQrCodeDataUrl(dataUri))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `rakshanet_sih1687_incidents_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Category', 'Title', 'Latitude', 'Longitude', 'Magnitude_or_Detail', 'Date', 'Source'];
    const rows = events.map((e) => [
      `"${e.id}"`,
      `"${e.category}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      e.lat,
      e.lon,
      `"${(e.detail || '').replace(/"/g, '""')}"`,
      `"${e.date}"`,
      `"${e.source || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `rakshanet_sih1687_incidents_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0F1B29] border border-[#22374A] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#22374A] bg-[#16283A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">
                Share Prototype with Team &amp; Judges
              </h2>
              <span className="text-xs font-mono text-slate-400">
                SIH Problem Statement SIH1687 &bull; Live Mobile Access
              </span>
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
          {/* QR Code & Direct Link */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#16283A] border border-[#22374A]">
            <div className="shrink-0 bg-white p-2 rounded-lg shadow-inner flex items-center justify-center">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="RakshaNet Live QR Code" className="w-36 h-36 object-contain" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-slate-700">
                  <QrCode className="w-8 h-8 animate-pulse" />
                </div>
              )}
            </div>

            <div className="space-y-2.5 flex-1 w-full text-center sm:text-left">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start text-cyan-300 font-bold">
                <Smartphone className="w-4 h-4" />
                <span>Instant Mobile Demo for Judges</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Scan this QR code with any smartphone camera to test RakshaNet&apos;s live mobile-responsive tactical dashboard without installing any app.
              </p>

              {/* Copy URL bar */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0F1B29] border border-[#22374A] text-slate-300 text-[11px] font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Export Incident Telemetry for Field Teams */}
          <div className="p-3.5 rounded-lg bg-[#122232] border border-cyan-900/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export Field Incident Reports</span>
              </div>
              <span className="text-[10px] text-slate-400">{events.length} records ready</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Export normalized geo-telemetry to integrate with NDRF command centers, QGIS, or local state relief spreadsheets.
            </p>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportJSON}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#16283A] hover:bg-[#22374A] border border-[#22374A] text-slate-200 transition"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>Export JSON Payload</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#16283A] hover:bg-[#22374A] border border-[#22374A] text-slate-200 transition"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>Export CSV Spreadsheet</span>
              </button>
            </div>
          </div>

          {/* Team Collaboration Setup Guide */}
          <div className="p-3.5 rounded-lg bg-[#16283A] border border-[#22374A] space-y-2">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Team Development Architecture</span>
            </div>
            <p className="text-[11px] text-slate-400">
              The project is cleanly decoupled:
            </p>
            <ul className="text-[11px] text-slate-300 space-y-1 pl-4 list-disc">
              <li><span className="text-cyan-300 font-semibold">Backend (`server.ts` &amp; `services/`):</span> Parallel fetchers for NASA EONET and USGS with in-memory caching.</li>
              <li><span className="text-emerald-300 font-semibold">Frontend (`src/`):</span> React 19 + Leaflet GIS + Tailwind for zero-latency interactive visual rendering.</li>
              <li><span className="text-purple-300 font-semibold">Extensibility:</span> Add new APIs (e.g. IMD weather alerts or NDMA RSS) by adding a new service and connecting to the normalized event pipe.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0B1420] border-t border-[#22374A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#16283A] hover:bg-[#22374A] text-slate-300 text-xs font-mono transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
