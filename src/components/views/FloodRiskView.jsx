import React, { useState } from 'react';
import OpenStreetMapViewer from '../map/OpenStreetMapViewer';

export default function FloodRiskView({ onInspectInfrastructure, onOpenDispatch }) {
  const [activeChartOverlay, setActiveChartOverlay] = useState('rainfall'); // 'risk' or 'rainfall'
  const [forecastHorizon, setForecastHorizon] = useState('24H'); // '6H', '12H', '24H', '48H'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeLayer, setActiveLayer] = useState(true);
  const [selectedAnalog, setSelectedAnalog] = useState(null);

  // Dynamic rainfall based on forecast horizon
  const horizonData = {
    '6H': { rainfallMm: 28, peak: 'Today, 18:00', riskIndex: 65, alertLevel: 'Moderate Alert' },
    '12H': { rainfallMm: 64, peak: 'Tonight, 23:00', riskIndex: 72, alertLevel: 'High Alert' },
    '24H': { rainfallMm: 145, peak: 'Tomorrow, 14:00', riskIndex: 78, alertLevel: 'High Alert' },
    '48H': { rainfallMm: 182, peak: 'Thursday, 08:00', riskIndex: 86, alertLevel: 'Critical Alert' },
  };

  const currentHorizon = horizonData[forecastHorizon] || horizonData['24H'];

  return (
    <div className="flex flex-col w-full">
      {/* Top Overall Status Banner */}
      <div className="px-8 py-6 mb-8 bg-surface-container-low/50 backdrop-blur-sm shadow-xs flex flex-col md:flex-row md:items-center justify-between z-10 relative mt-4 mx-8 rounded-xl border border-outline-variant/50 gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">
            Overall Status
          </span>
          <div className="flex items-center gap-3">
            <span className="font-headline-lg text-risk-high tracking-tight font-bold">
              Municipal Flood Risk: {currentHorizon.riskIndex}/100
            </span>
            <div className="px-2.5 py-1 rounded-lg bg-risk-high/10 border border-risk-high/25 flex items-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-[15px] text-risk-high animate-bounce">
                warning
              </span>
              <span className="font-label-caps text-risk-high uppercase text-[11px] font-bold">
                {currentHorizon.alertLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-start md:items-end">
            <span className="font-label-caps text-on-surface-variant uppercase text-[11px]">Projected Peak</span>
            <span className="font-title-lg text-on-surface font-bold">{currentHorizon.peak}</span>
          </div>
          <div className="h-10 w-[1px] bg-outline-variant/60 hidden md:block"></div>
          <div className="flex flex-col items-start md:items-end">
            <span className="font-label-caps text-on-surface-variant uppercase text-[11px]">Current Status</span>
            <span className="font-title-lg text-primary font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              Monitoring
            </span>
          </div>
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="px-8 grid grid-cols-1 xl:grid-cols-12 gap-6 pb-12">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Card 1: Flood Risk & Rainfall Forecast (48h) */}
          <div className="bg-surface-container-lowest shadow-sm rounded-2xl p-6 relative overflow-hidden border border-outline-variant/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="font-title-lg text-on-surface font-bold text-[20px]">
                  Flood Risk &amp; Rainfall Forecast (48h)
                </h2>
                <p className="text-[12px] text-on-surface-variant">
                  Hydro-meteorological forecast matrix with AI runoff modeling
                </p>
              </div>
              <div className="flex gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 self-start sm:self-auto">
                <button
                  onClick={() => setActiveChartOverlay('risk')}
                  className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all text-[12px] ${
                    activeChartOverlay === 'risk'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  Risk Index
                </button>
                <button
                  onClick={() => setActiveChartOverlay('rainfall')}
                  className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all text-[12px] ${
                    activeChartOverlay === 'rainfall'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  Rainfall Overlay
                </button>
              </div>
            </div>

            {/* SVG Hydrograph & Rainfall Forecast Visualization */}
            <div className="h-64 w-full relative bg-surface-container-low/30 rounded-xl p-2 border border-outline-variant/30">
              <svg className="w-full h-full text-outline-variant/40" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="riskGradient" x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0%" stopColor="#FFB100" />
                    <stop offset="50%" stopColor="#FF8C00" />
                    <stop offset="100%" stopColor="#BA1A1A" />
                  </linearGradient>
                  <linearGradient id="rainBarGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#257123" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#96c0a9" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line stroke="currentColor" strokeDasharray="2,2" strokeWidth="0.5" x1="0" x2="100" y1="25" y2="25" />
                <line stroke="currentColor" strokeDasharray="2,2" strokeWidth="0.5" x1="0" x2="100" y1="50" y2="50" />
                <line stroke="currentColor" strokeDasharray="2,2" strokeWidth="0.5" x1="0" x2="100" y1="75" y2="75" />

                {/* Rainfall Bars (Blue/Greenish shades) */}
                {activeChartOverlay === 'rainfall' && (
                  <g className="transition-opacity duration-300">
                    <rect fill="#C0CAB9" height="15" opacity="0.5" width="4" x="5" y="85" rx="1" />
                    <rect fill="#C0CAB9" height="30" opacity="0.6" width="4" x="15" y="70" rx="1" />
                    <rect fill="#96c0a9" height="60" opacity="0.8" width="4" x="25" y="40" rx="1" />
                    <rect fill="#3f6653" height="80" opacity="0.9" width="4" x="35" y="20" rx="1" />
                    <rect fill="#257123" height="90" opacity="0.9" width="4" x="45" y="10" rx="1" />
                    <rect fill="#3f6653" height="85" opacity="0.8" width="4" x="55" y="15" rx="1" />
                    <rect fill="#96c0a9" height="60" opacity="0.7" width="4" x="65" y="40" rx="1" />
                    <rect fill="#C0CAB9" height="35" opacity="0.5" width="4" x="75" y="65" rx="1" />
                    <rect fill="#C0CAB9" height="20" opacity="0.4" width="4" x="85" y="80" rx="1" />
                    <rect fill="#C0CAB9" height="10" opacity="0.3" width="4" x="95" y="90" rx="1" />
                  </g>
                )}

                {/* Risk Line (Orange/Red) with smooth curve and drop shadow */}
                <path
                  className="drop-shadow-md"
                  d="M0,80 Q10,75 20,60 T40,20 T60,10 T80,30 T100,50"
                  fill="none"
                  stroke="url(#riskGradient)"
                  strokeWidth="2.5"
                />

                {/* Peak Threshold line */}
                <line stroke="#ba1a1a" strokeDasharray="3,3" strokeWidth="0.8" x1="0" x2="100" y1="18" y2="18" opacity="0.6" />
                <text x="75" y="15" fill="#ba1a1a" fontSize="3" fontWeight="bold">Flood Overflow Threshold</text>
              </svg>

              {/* Time axis labels */}
              <div className="absolute inset-0 flex justify-between items-end pb-2 px-3 text-data-mono text-on-surface-variant text-[11px] font-semibold pointer-events-none">
                <span>Now</span>
                <span>+12h (Midnight)</span>
                <span>+24h (Tomorrow Peak)</span>
                <span>+36h</span>
                <span>+48h</span>
              </div>
            </div>
          </div>

          {/* Card 2: Predictive Risk Heatmap */}
          <div className="bg-surface-container-lowest shadow-xl rounded-2xl p-6 relative overflow-hidden border border-outline-variant/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
              <div>
                <h2 className="font-title-lg text-on-surface font-bold text-[20px]">
                  Predictive Risk Heatmap
                </h2>
                <p className="text-[12px] text-on-surface-variant">
                  High-resolution raster model of municipal inundation probability
                </p>
              </div>

              {/* Forecast Horizon Switcher */}
              <div className="flex items-center gap-2 bg-surface/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-outline-variant/40 shadow-xs self-start sm:self-auto">
                <span className="font-label-caps text-on-surface-variant uppercase text-[10px] mr-1">
                  Horizon:
                </span>
                {['6H', '12H', '24H', '48H'].map((hz) => (
                  <button
                    key={hz}
                    onClick={() => setForecastHorizon(hz)}
                    className={`font-data-mono px-2.5 py-1 rounded-md text-[12px] font-bold transition-all ${
                      forecastHorizon === hz
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {hz}
                  </button>
                ))}
              </div>
            </div>

            {/* Real OpenStreetMap Inundation Risk Canvas */}
            <div className="w-full h-[440px] rounded-xl overflow-hidden relative shadow-inner border border-outline-variant/50">
              <OpenStreetMapViewer
                showHeatmap={true}
                forecastHorizon={forecastHorizon}
                className="w-full h-full"
                viewMode="flood-risk"
              />
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Card 1: Rainfall Forecast */}
          <div className="bg-primary-container text-on-primary-container p-6 rounded-2xl shadow-md relative overflow-hidden border border-primary/20">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-on-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
            <h3 className="font-label-caps uppercase tracking-wider mb-2 opacity-85 text-[11px] font-bold">
              Rainfall Forecast ({forecastHorizon})
            </h3>
            <div className="flex items-end gap-3 mb-4">
              <span className="font-display leading-none font-extrabold text-[44px]">
                {currentHorizon.rainfallMm}
              </span>
              <span className="font-title-md opacity-85 pb-1 font-semibold">mm/{forecastHorizon}</span>
            </div>
            <div className="flex items-center gap-2 bg-on-primary-container/15 px-3 py-1.5 rounded-lg w-fit mb-4">
              <span className="material-symbols-outlined text-[18px] text-on-primary-container animate-pulse">
                thunderstorm
              </span>
              <span className="font-body-md font-bold text-[13px]">Heavy Precipitation Expected</span>
            </div>
            <p className="font-body-sm opacity-95 text-[13px] leading-relaxed">
              Intensity peaking tomorrow between 12:00 and 16:00. Flash flood warnings active for low-lying zones.
            </p>
          </div>

          {/* Card 2: Critical Infrastructure */}
          <div className="bg-surface-container-lowest shadow-sm rounded-2xl p-6 border border-outline-variant/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-title-md text-on-surface font-bold text-[17px]">
                Critical Infrastructure
              </h3>
              <span className="text-[11px] font-bold text-risk-critical bg-error-container px-2 py-0.5 rounded">
                3 High Vulnerability
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              <div
                onClick={() => onInspectInfrastructure && onInspectInfrastructure('Main Collector Drain')}
                className="flex items-center justify-between group p-2 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-body-md font-semibold text-on-surface group-hover:text-primary transition-colors text-[14px]">
                    Main Collector Drain (North)
                  </span>
                  <span className="font-body-sm text-on-surface-variant text-[12px]">Capacity: 92% (Severe Stress)</span>
                </div>
                <div className="w-3 h-3 rounded-full bg-risk-critical animate-pulse shadow-xs shadow-risk-critical"></div>
              </div>

              <div className="h-[1px] w-full bg-outline-variant/40"></div>

              <div
                onClick={() => onInspectInfrastructure && onInspectInfrastructure('Coastal Outfall 2')}
                className="flex items-center justify-between group p-2 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-body-md font-semibold text-on-surface group-hover:text-primary transition-colors text-[14px]">
                    Coastal Outfall 2
                  </span>
                  <span className="font-body-sm text-on-surface-variant text-[12px]">Capacity: 85% (Tidal Backflow)</span>
                </div>
                <div className="w-3 h-3 rounded-full bg-risk-high shadow-xs shadow-risk-high"></div>
              </div>

              <div className="h-[1px] w-full bg-outline-variant/40"></div>

              <div
                onClick={() => onInspectInfrastructure && onInspectInfrastructure('Market District Sub-drain')}
                className="flex items-center justify-between group p-2 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-body-md font-semibold text-on-surface group-hover:text-primary transition-colors text-[14px]">
                    Market District Sub-drain
                  </span>
                  <span className="font-body-sm text-on-surface-variant text-[12px]">Capacity: 70% (Obstruction Warning)</span>
                </div>
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-xs shadow-amber-500"></div>
              </div>
            </div>
          </div>

          {/* Card 3: Historical Analogs */}
          <div className="bg-surface-container-low shadow-sm rounded-2xl p-6 border border-outline-variant/50">
            <h3 className="font-label-caps text-on-surface-variant uppercase tracking-wider mb-4 text-[11px] font-bold">
              Historical Storm Analogs
            </h3>

            <div className="flex flex-col gap-3">
              <div
                onClick={() => setSelectedAnalog('OCT 2022 Event (120mm rainfall caused 4h localized inundation in Market Sector)')}
                className="bg-surface-container-lowest p-3.5 rounded-xl shadow-2xs flex items-center gap-3 border border-outline-variant/40 hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-tertiary-container/40 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">history</span>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-data-mono text-[11px] text-on-surface-variant font-bold">OCT 2022</span>
                  <span className="font-body-sm text-on-surface font-bold text-[13px]">120mm Deluge Event</span>
                </div>
                <button className="text-primary hover:text-surface-tint p-1 rounded-lg hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </button>
              </div>

              <div
                onClick={() => setSelectedAnalog('JUN 2021 Event (155mm monsoon event — UEW South Link canal breached banks)')}
                className="bg-surface-container-lowest p-3.5 rounded-xl shadow-2xs flex items-center gap-3 border border-outline-variant/40 hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-tertiary-container/40 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">history</span>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-data-mono text-[11px] text-on-surface-variant font-bold">JUN 2021</span>
                  <span className="font-body-sm text-on-surface font-bold text-[13px]">155mm Monsoonal Surge</span>
                </div>
                <button className="text-primary hover:text-surface-tint p-1 rounded-lg hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </button>
              </div>
            </div>

            {selectedAnalog && (
              <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/20 text-[12px] text-on-surface animate-in fade-in">
                <span className="font-bold text-primary block mb-0.5">Historical Simulation Note:</span>
                {selectedAnalog}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
