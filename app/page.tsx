'use client';

import { useState, useEffect } from 'react';
import {
  Target,
  Eye,
  Flame,
  Layers,
  Loader2,
  Sparkles,
  RefreshCw,
  Smartphone,
  Monitor,
  Sliders,
  AlertTriangle,
  Lightbulb,
  Download,
  Plus,
  Trash2,
  Columns,
  Square,
  ArrowDownCircle,
  Save,
  History,
} from 'lucide-react';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Hotspot {
  id: number;
  name: string;
  attention: string;
  x: number;
  y: number;
  color: string;
}

interface SimulationResult {
  id?: string;
  targetUrl: string;
  score: number;
  hotspots: Hotspot[];
  insights: { type: string; text: string }[];
  createdAt?: string;
}

export default function HeatmapEngine() {
  const [urlA, setUrlA] = useState('');
  const [urlB, setUrlB] = useState('');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Toggles
  const [heatMapActive, setHeatMapActive] = useState(true);
  const [showScrollDepth, setShowScrollDepth] = useState(false);
  const [opacity, setOpacity] = useState(70);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [addMode, setAddMode] = useState(false);

  // Simulation & Saved Data
  const [simDataA, setSimDataA] = useState<SimulationResult | null>(null);
  const [simDataB, setSimDataB] = useState<SimulationResult | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [savedAudits, setSavedAudits] = useState<SimulationResult[]>([]);

  // Load Saved Audits on Mount
  useEffect(() => {
    const history = localStorage.getItem('thermalvision_audits');
    if (history) {
      try {
        setSavedAudits(JSON.parse(history));
      } catch (err) {
        console.error('Error loading history:', err);
      }
    }
  }, []);

  const mockHotspotsA: Hotspot[] = [
    { id: 1, name: 'Hero Headline & CTA', attention: '94%', x: 50, y: 22, color: 'bg-red-500' },
    { id: 2, name: 'Navigation Links', attention: '68%', x: 80, y: 8, color: 'bg-amber-500' },
    { id: 3, name: 'Social Proof / Logos', attention: '52%', x: 50, y: 42, color: 'bg-yellow-500' },
    { id: 4, name: 'Secondary Feature Cards', attention: '31%', x: 30, y: 65, color: 'bg-blue-500' },
  ];

  const mockHotspotsB: Hotspot[] = [
    { id: 101, name: 'Redesigned Hero CTA', attention: '98%', x: 50, y: 25, color: 'bg-red-500' },
    { id: 102, name: 'Sticky Offer Banner', attention: '82%', x: 50, y: 5, color: 'bg-amber-500' },
    { id: 103, name: 'Testimonial Slider', attention: '61%', x: 50, y: 55, color: 'bg-emerald-500' },
  ];

  const runSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlA) return;
    setSimulating(true);

    const formattedA = urlA.startsWith('http') ? urlA : `https://${urlA}`;
    const formattedB = urlB ? (urlB.startsWith('http') ? urlB : `https://${urlB}`) : '';

    setTimeout(() => {
      const resultA: SimulationResult = {
        id: Date.now().toString(),
        targetUrl: formattedA,
        score: Math.floor(Math.random() * 20) + 70,
        hotspots: mockHotspotsA,
        insights: [
          { type: 'warning', text: 'Attention leakage: Nav links distracting from primary CTA.' },
          { type: 'success', text: 'Hero Headline aligns with top-left reading bias.' },
          { type: 'tip', text: 'Increase CTA button contrast to improve engagement.' },
        ],
        createdAt: new Date().toLocaleDateString(),
      };

      setSimDataA(resultA);

      if (isCompareMode && formattedB) {
        setSimDataB({
          id: (Date.now() + 1).toString(),
          targetUrl: formattedB,
          score: Math.floor(Math.random() * 15) + 80,
          hotspots: mockHotspotsB,
          insights: [
            { type: 'success', text: 'Variation B has +12% higher CTA focus concentration.' },
            { type: 'tip', text: 'Fold depth retention improved by 24% over Variant A.' },
          ],
          createdAt: new Date().toLocaleDateString(),
        });
      } else {
        setSimDataB(null);
      }

      setSimulating(false);
    }, 1800);
  };

  // Save Audit to LocalStorage
  const saveCurrentAudit = () => {
    if (!simDataA) return;
    const updated = [simDataA, ...savedAudits.filter((item) => item.targetUrl !== simDataA.targetUrl)];
    setSavedAudits(updated);
    localStorage.setItem('thermalvision_audits', JSON.stringify(updated));
    alert('Audit saved successfully to local history!');
  };

  // Load Audit from Saved List
  const loadSavedAudit = (saved: SimulationResult) => {
    setUrlA(saved.targetUrl);
    setSimDataA(saved);
    setIsCompareMode(false);
    setSimDataB(null);
  };

  // Export Canvas to PDF
  const exportPdfReport = async () => {
    const reportElement = document.getElementById('report-area');
    if (!reportElement) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ThermalVision_Audit_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF Export failed:', err);
      alert('Failed to generate PDF report.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>, targetVariant: 'A' | 'B') => {
    if (!addMode) return;
    const data = targetVariant === 'A' ? simDataA : simDataB;
    if (!data) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const colors = ['bg-red-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-blue-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomAttention = `${Math.floor(Math.random() * 40) + 50}%`;

    const newSpot: Hotspot = {
      id: Date.now(),
      name: `Custom Spot (${x}%, ${y}%)`,
      attention: randomAttention,
      x,
      y,
      color: randomColor,
    };

    if (targetVariant === 'A') {
      setSimDataA({ ...data, hotspots: [...data.hotspots, newSpot] });
    } else {
      setSimDataB({ ...data, hotspots: [...data.hotspots, newSpot] });
    }
    setAddMode(false);
  };

  const removeHotspot = (id: number, targetVariant: 'A' | 'B') => {
    if (targetVariant === 'A' && simDataA) {
      setSimDataA({ ...simDataA, hotspots: simDataA.hotspots.filter((s) => s.id !== id) });
    } else if (targetVariant === 'B' && simDataB) {
      setSimDataB({ ...simDataB, hotspots: simDataB.hotspots.filter((s) => s.id !== id) });
    }
    if (selectedHotspot?.id === id) setSelectedHotspot(null);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Controller Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight flex items-center gap-2">
              ThermalVision
              <span className="text-xs px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800/60 rounded-full font-mono">
                v3.5 Pro
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">CRO Heatmaps & Scroll Depth Analytics</p>
          </div>
        </div>

        {/* Input Forms & Controls */}
        <div className="flex flex-1 max-w-2xl items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
              isCompareMode
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Single vs Split Screen"
          >
            {isCompareMode ? <Columns className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
            {isCompareMode ? 'A/B Split' : 'Single'}
          </button>

          <form onSubmit={runSimulation} className="flex items-center gap-2 flex-1">
            <input
              type="text"
              placeholder="Variant A URL (e.g. stripe.com)"
              value={urlA}
              onChange={(e) => setUrlA(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs font-mono"
            />

            {isCompareMode && (
              <input
                type="text"
                placeholder="Variant B URL"
                value={urlB}
                onChange={(e) => setUrlB(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-mono"
              />
            )}

            <button
              type="submit"
              disabled={simulating}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-xl flex items-center gap-2 transition disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {simulating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {simulating ? 'Processing...' : 'Analyze'}
            </button>
          </form>
        </div>

        {/* Audit History Dropdown & Action Controls */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          {savedAudits.length > 0 && (
            <div className="relative group">
              <button className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer">
                <History className="h-3.5 w-3.5 text-rose-400" /> History
              </button>
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                <p className="text-[10px] text-slate-500 px-2 py-1 uppercase font-bold">Saved Audits</p>
                {savedAudits.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadSavedAudit(item)}
                    className="w-full text-left px-2 py-1.5 hover:bg-slate-800 rounded-lg text-xs truncate text-slate-300 flex justify-between items-center cursor-pointer"
                  >
                    <span className="truncate">{item.targetUrl.replace('https://', '')}</span>
                    <span className="text-[10px] font-mono text-rose-400">{item.score}/100</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {simDataA && (
            <>
              <button
                onClick={saveCurrentAudit}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                title="Save Audit to Local Storage"
              >
                <Save className="h-3.5 w-3.5 text-emerald-400" /> Save
              </button>

              <button
                onClick={() => setShowScrollDepth(!showScrollDepth)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  showScrollDepth ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <ArrowDownCircle className="h-3.5 w-3.5" /> Scroll
              </button>

              <button
                onClick={() => setAddMode(!addMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  addMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                <Plus className="h-3.5 w-3.5" /> {addMode ? 'Click Canvas...' : 'Add Spot'}
              </button>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewport('desktop')}
                  className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${viewport === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Desktop View"
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewport('mobile')}
                  className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${viewport === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Mobile View"
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setHeatMapActive(!heatMapActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  heatMapActive ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Eye className="h-3.5 w-3.5" /> Heatmap
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Workspace Area */}
      <div id="report-area" className="flex-1 p-6 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 bg-slate-950">
        {!simDataA && !simulating && (
          <div className="lg:col-span-4 h-[75vh] border border-dashed border-slate-800 rounded-3xl bg-slate-900/30 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
              <Target className="h-10 w-10 text-rose-500/60" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-200">ThermalVision Engine Ready</h3>
              <p className="text-slate-500 text-xs max-w-sm">
                Enter target domain URL to calculate attention heatmaps, scroll depth retention, and CRO scores.
              </p>
            </div>
          </div>
        )}

        {simulating && (
          <div className="lg:col-span-4 h-[75vh] border border-slate-800 rounded-3xl bg-slate-900 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="animate-ping absolute h-16 w-16 rounded-full bg-rose-500/40"></div>
              <RefreshCw className="h-8 w-8 text-rose-500 animate-spin relative" />
            </div>
            <p className="text-slate-400 text-sm font-mono">Generating PDF-ready heatmaps and analytics...</p>
          </div>
        )}

        {simDataA && (
          <>
            {/* Visual Canvas Panel */}
            <div className={`space-y-4 flex flex-wrap justify-center items-start gap-4 lg:col-span-3`}>
              {/* CANVAS A */}
              <div className={`flex flex-col items-center gap-2 ${isCompareMode && simDataB ? 'flex-1 min-w-[320px]' : 'w-full'}`}>
                <div className="w-full flex justify-between items-center px-1 text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Variant A (Baseline)
                  </span>
                  <span className="font-mono text-rose-400 font-bold">Score: {simDataA.score}/100</span>
                </div>

                <div
                  onClick={(e) => handleCanvasClick(e, 'A')}
                  className={`relative border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-2xl transition-all duration-300 group ${
                    addMode ? 'cursor-crosshair ring-2 ring-amber-500' : ''
                  } ${viewport === 'desktop' ? 'w-full aspect-[16/10]' : 'w-[320px] h-[560px]'}`}
                >
                  <iframe
                    src={`/api/proxy?url=${encodeURIComponent(simDataA.targetUrl)}`}
                    title="Target View A"
                    className={`w-full h-full border-0 grayscale-[30%] group-hover:grayscale-0 transition duration-500 ${
                      addMode ? 'pointer-events-none' : 'pointer-events-auto'
                    }`}
                  />

                  {/* Heatmap Overlay */}
                  {heatMapActive && (
                    <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300" style={{ opacity: opacity / 100 }}>
                      {simDataA.hotspots.map((spot) => (
                        <div
                          key={spot.id}
                          className={`absolute rounded-full blur-3xl opacity-80 animate-pulse ${spot.color}`}
                          style={{
                            top: `${spot.y}%`,
                            left: `${spot.x}%`,
                            width: viewport === 'desktop' ? '160px' : '100px',
                            height: viewport === 'desktop' ? '160px' : '100px',
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Scroll Depth Lines */}
                  {showScrollDepth && (
                    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between text-[10px] font-mono text-cyan-300/80">
                      <div className="border-b border-dashed border-cyan-400/60 bg-cyan-950/40 px-2 py-0.5">Fold 1 (100% Reach)</div>
                      <div className="border-b border-dashed border-yellow-400/60 bg-yellow-950/40 px-2 py-0.5">25% Scroll Depth</div>
                      <div className="border-b border-dashed border-orange-400/60 bg-orange-950/40 px-2 py-0.5">50% Scroll Depth</div>
                      <div className="border-b border-dashed border-red-400/60 bg-red-950/40 px-2 py-0.5">75% Scroll Depth</div>
                    </div>
                  )}

                  {/* Hotspot Pins */}
                  <div className="absolute inset-0 z-30 pointer-events-none">
                    {simDataA.hotspots.map((spot) => (
                      <button
                        key={spot.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHotspot(spot);
                        }}
                        className={`absolute pointer-events-auto p-1.5 rounded-full border border-white/40 shadow-lg backdrop-blur-md transition-transform hover:scale-125 cursor-pointer ${
                          selectedHotspot?.id === spot.id ? 'ring-4 ring-rose-400 bg-rose-600' : 'bg-slate-900/80'
                        }`}
                        style={{
                          top: `${spot.y}%`,
                          left: `${spot.x}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <Target className="h-3 w-3 text-white" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CANVAS B */}
              {isCompareMode && simDataB && (
                <div className="flex flex-col items-center gap-2 flex-1 min-w-[320px]">
                  <div className="w-full flex justify-between items-center px-1 text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span> Variant B (Test)
                    </span>
                    <span className="font-mono text-purple-400 font-bold">Score: {simDataB.score}/100</span>
                  </div>

                  <div
                    onClick={(e) => handleCanvasClick(e, 'B')}
                    className={`relative border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-2xl transition-all duration-300 group ${
                      addMode ? 'cursor-crosshair ring-2 ring-amber-500' : ''
                    } ${viewport === 'desktop' ? 'w-full aspect-[16/10]' : 'w-[320px] h-[560px]'}`}
                  >
                    <iframe
                      src={`/api/proxy?url=${encodeURIComponent(simDataB.targetUrl)}`}
                      title="Target View B"
                      className={`w-full h-full border-0 grayscale-[30%] group-hover:grayscale-0 transition duration-500 ${
                        addMode ? 'pointer-events-none' : 'pointer-events-auto'
                      }`}
                    />

                    {/* Heatmap Overlay B */}
                    {heatMapActive && (
                      <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300" style={{ opacity: opacity / 100 }}>
                        {simDataB.hotspots.map((spot) => (
                          <div
                            key={spot.id}
                            className={`absolute rounded-full blur-3xl opacity-80 animate-pulse ${spot.color}`}
                            style={{
                              top: `${spot.y}%`,
                              left: `${spot.x}%`,
                              width: viewport === 'desktop' ? '160px' : '100px',
                              height: viewport === 'desktop' ? '160px' : '100px',
                              transform: 'translate(-50%, -50%)',
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Hotspot Pins B */}
                    <div className="absolute inset-0 z-30 pointer-events-none">
                      {simDataB.hotspots.map((spot) => (
                        <button
                          key={spot.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHotspot(spot);
                          }}
                          className={`absolute pointer-events-auto p-1.5 rounded-full border border-white/40 shadow-lg backdrop-blur-md transition-transform hover:scale-125 cursor-pointer ${
                            selectedHotspot?.id === spot.id ? 'ring-4 ring-purple-400 bg-purple-600' : 'bg-slate-900/80'
                          }`}
                          style={{
                            top: `${spot.y}%`,
                            left: `${spot.x}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <Target className="h-3 w-3 text-white" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Side Analytics Panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Attention Index</span>
                    <p className="text-[10px] text-slate-500">CRO Heat Quality Rating</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-rose-400 font-mono">A: {simDataA.score}</span>
                    {simDataB && <span className="text-xl font-black text-purple-400 font-mono ml-2">B: {simDataB.score}</span>}
                  </div>
                </div>

                {/* Selected Hotspot Inspector */}
                {selectedHotspot && (
                  <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-rose-300">{selectedHotspot.name}</span>
                      <button
                        onClick={() => {
                          removeHotspot(selectedHotspot.id, 'A');
                          removeHotspot(selectedHotspot.id, 'B');
                        }}
                        className="text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Attention: <strong className="text-white">{selectedHotspot.attention}</strong></span>
                      <span>Pos: ({selectedHotspot.x}%, {selectedHotspot.y}%)</span>
                    </div>
                  </div>
                )}

                {/* Opacity Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-medium"><Sliders className="h-3 w-3 text-rose-400" /> Heatmap Opacity</span>
                    <span className="font-mono text-slate-200">{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* AI Insights */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> AI Recommendations
                  </p>
                  {simDataA.insights.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                        item.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      {item.type === 'warning' && <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* PDF Export Button */}
                <button
                  onClick={exportPdfReport}
                  disabled={isExporting}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl border border-rose-500 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  {isExporting ? 'Generating PDF...' : 'Download PDF Report'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}