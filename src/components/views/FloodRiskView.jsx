import React, { useState, useEffect } from 'react';
import OpenStreetMapViewer from '../map/OpenStreetMapViewer';
import { fetchOpenMeteoForecast, calculateCompoundFloodPredictions } from '../../lib/openMeteoService';

export default function FloodRiskView({
  drainageSegments = [],
  onInspectInfrastructure,
  onOpenDispatch
}) {
  const [meteoData, setMeteoData] = useState(null);
  const [activeChartOverlay, setActiveChartOverlay] = useState('rainfall'); // 'risk' or 'rainfall'
  const [forecastHorizon, setForecastHorizon] = useState('24H'); // '6H', '12H', '24H', '48H'
  const [selectedDrainId, setSelectedDrainId] = useState(null);
  const [isLoadingMeteo, setIsLoadingMeteo] = useState(true);

  // Fetch live Open-Meteo data on mount
  useEffect(() => {
    let mounted = true;
    async function loadMeteo() {
      setIsLoadingMeteo(true);
      const data = await fetchOpenMeteoForecast();
      if (mounted) {
        setMeteoData(data);
        setIsLoadingMeteo(false);
      }
    }
    loadMeteo();
    return () => { mounted = false; };
  }, []);

  // Compute compound predictions combining Open-Meteo + Supabase drainage assets
  const compoundAnalysis = calculateCompoundFloodPredictions(drainageSegments, meteoData);
  const topRiskDrains = compoundAnalysis.topRiskDrains || [];

  // Rainfall stats from Open-Meteo
  const rain24h = meteoData?.forecast?.rain24hMm || 28.5;
  const rain48h = meteoData?.forecast?.rain48hMm || 64.0;
  const currentTemp = meteoData?.current?.temp || '28°C';
  const currentCondition = meteoData?.current?.condition || 'Scattered Clouds';
  const rainProb = meteoData?.forecast?.maxProb24h || '95%';

  // Horizon multiplier
  const horizonRainfall = forecastHorizon === '6H' ? Math.round(rain24h * 0.3)
    : forecastHorizon === '12H' ? Math.round(rain24h * 0.6)
    : forecastHorizon === '24H' ? rain24h
    : rain48h;

  const hourlyRain = meteoData?.forecast?.hourlyRain || [0, 0, 0, 0.4, 1.2, 3.5, 7.8, 6.2, 4.1, 1.8, 0.8, 0];
  const maxHourlyVal = Math.max(...hourlyRain, 5);

  return (
    <div className="flex flex-col w-full select-none">
      {/* Top Open-Meteo & Supabase Status Banner */}
      <div className="px-8 py-5 mb-6 bg-surface-container-low/80 backdrop-blur-md shadow-xs flex flex-col md:flex-row md:items-center justify-between z-10 relative mt-4 mx-8 rounded-2xl border border-outline-variant/60 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">
              Open-Meteo Hydrometeorological Intelligence
            </span>
            <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-data-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Live API: open-meteo.com
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-headline-lg text-risk-high tracking-tight font-bold text-[24px]">
              Municipal Flood Risk Index: {compoundAnalysis.municipalRiskIndex}/100
            </span>
            <div className="px-2.5 py-1 rounded-lg bg-risk-high/10 border border-risk-high/25 flex items-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-[15px] text-risk-high animate-bounce">
                warning
              </span>
              <span className="font-label-caps text-risk-high uppercase text-[11px] font-bold">
                {compoundAnalysis.alertLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex flex-col items-start md:items-end">
            <span className="font-label-caps text-on-surface-variant uppercase text-[11px] font-bold">Open-Meteo 24h Rain</span>
            <span className="font-title-lg text-on-surface font-bold font-data-mono text-[17px] text-risk-critical">
              {rain24h} mm ({rainProb} Prob)
            </span>
          </div>
          <div className="h-8 w-[1px] bg-outline-variant/60 hidden md:block"></div>
          <div className="flex flex-col items-start md:items-end">
            <span className="font-label-caps text-on-surface-variant uppercase text-[11px] font-bold">Current Weather</span>
            <span className="font-title-lg text-primary font-bold flex items-center gap-1.5 text-[15px]">
              <span className="material-symbols-outlined text-[18px]">rainy</span>
              {currentTemp} • {currentCondition}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="px-8 grid grid-cols-1 xl:grid-cols-12 gap-6 pb-12">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Card 1: Open-Meteo Rainfall & Surcharge Hydrograph */}
          <div className="bg-surface-container-lowest shadow-sm rounded-2xl p-6 relative overflow-hidden border border-outline-variant/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="font-title-lg text-on-surface font-bold text-[19px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">water</span>
                  Open-Meteo Rainfall &amp; Surcharge Hydrograph (24h)
                </h2>
                <p className="text-[12px] text-on-surface-variant">
                  Hourly precipitation rates from Open-Meteo combined with Supabase culvert saturation modeling.
                </p>
              </div>

              {/* Forecast Horizon Tabs */}
              <div className="flex gap-1.5 bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 self-start sm:self-auto">
                {['6H', '12H', '24H', '48H'].map((hz) => (
                  <button
                    key={hz}
                    onClick={() => setForecastHorizon(hz)}
                    className={`px-3 py-1 rounded-lg text-body-sm font-semibold transition-all text-[11px] font-data-mono cursor-pointer ${
                      forecastHorizon === hz
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {hz}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Hourly Precipitation Bars */}
            <div className="h-52 w-full relative bg-surface-container-low/40 rounded-xl p-4 border border-outline-variant/30 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[11px] font-data-mono text-outline">
                <span>Peak Intensity: {Math.max(...hourlyRain)} mm/hr</span>
                <span>Horizon Volume: {horizonRainfall} mm</span>
                <span>Winneba Catchment: -0.62566, 5.34352</span>
              </div>

              {/* Bar Graph */}
              <div className="flex items-end justify-between gap-1.5 h-32 pt-4">
                {hourlyRain.slice(0, 16).map((val, idx) => {
                  const heightPercent = Math.min(100, Math.max(8, (val / maxHourlyVal) * 100));
                  const isHigh = val >= 3.0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black/85 text-white text-[10px] px-2 py-0.5 rounded font-data-mono pointer-events-none transition-opacity z-20 whitespace-nowrap">
                        {val} mm • {idx * 1.5}h
                      </div>
                      <div
                        className={`w-full rounded-t transition-all ${
                          isHigh ? 'bg-risk-critical' : 'bg-primary'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                      <span className="text-[9px] font-data-mono text-outline">{idx * 2}h</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/30">
                <span className="flex items-center gap-1.5 font-semibold text-primary">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span>
                  Safe Runoff Zone (&lt;3mm/h)
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-risk-critical">
                  <span className="w-2.5 h-2.5 rounded-sm bg-risk-critical"></span>
                  Culvert Surcharge Threat (&ge;3mm/h)
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive OpenStreetMap with Flood Inundation Zones */}
          <div className="bg-surface-container-lowest shadow-sm rounded-2xl p-6 border border-outline-variant/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-title-md font-bold text-on-surface text-[17px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">map</span>
                  Winneba Flood Risk GIS Map (OpenStreetMap)
                </h3>
                <p className="text-[12px] text-on-surface-variant">
                  Spatial visualization of high-surcharge drainage corridors and simulated flood inundation polygons.
                </p>
              </div>
              <span className="text-[11px] font-data-mono text-primary font-bold">5.34352, -0.62566</span>
            </div>

            <div className="h-96 w-full rounded-xl overflow-hidden border border-outline-variant/60">
              <OpenStreetMapViewer
                drainageSegments={drainageSegments}
                selectedDrainId={selectedDrainId}
                onSelectDrain={(drain) => {
                  setSelectedDrainId(drain.id);
                  if (onInspectInfrastructure) onInspectInfrastructure(drain.name);
                }}
                viewMode="flood-risk"
              />
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Predictive Asset Overtopping Table */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest shadow-sm rounded-2xl p-6 border border-outline-variant/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60 mb-4">
                <h3 className="font-title-md font-bold text-on-surface text-[17px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-risk-critical text-[20px]">crisis_alert</span>
                  Predicted Drainage Surcharges
                </h3>
                <span className="text-[11px] font-data-mono text-outline">{compoundAnalysis.segmentPredictions.length} Drains</span>
              </div>
              <p className="text-[12px] text-on-surface-variant mb-4">
                Derived by applying Open-Meteo {rain24h}mm storm inflow against Supabase culvert blockage metrics.
              </p>

              <div className="space-y-3.5">
                {topRiskDrains.map((pred) => {
                  const isCritical = pred.riskLevel === 'critical';
                  const isSelected = selectedDrainId === pred.id;

                  return (
                    <div
                      key={pred.id}
                      onClick={() => setSelectedDrainId(pred.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-xs'
                          : isCritical
                          ? 'border-error/40 bg-error-container/20 hover:bg-error-container/30'
                          : 'border-outline-variant/50 bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-data-mono text-[11px] font-bold text-primary">{pred.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-data-mono ${
                              isCritical ? 'bg-risk-critical text-white' : 'bg-risk-high text-white'
                            }`}>
                              {pred.compoundRiskScore}/100 Risk
                            </span>
                          </div>
                          <h4 className="font-bold text-[14px] text-on-surface mt-0.5">{pred.name}</h4>
                          <span className="text-[11px] text-outline">{pred.sector}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-outline block">Overtopping Prob</span>
                          <span className="font-bold text-[14px] text-risk-critical font-data-mono">
                            {pred.overtoppingProbability}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-2.5 p-2 bg-surface-container-lowest/80 rounded-lg text-[11px] font-data-mono">
                        <div>
                          <span className="text-outline block">Supabase Blockage:</span>
                          <span className="font-bold text-on-surface">{pred.blockagePercent}%</span>
                        </div>
                        <div>
                          <span className="text-outline block">Time to Overflow:</span>
                          <span className="font-bold text-risk-critical">{pred.timeToOverflow}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3">
                        {pred.advisory}
                      </p>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenDispatch) onOpenDispatch({ id: pred.id, drainName: pred.name, riskScore: pred.compoundRiskScore });
                        }}
                        className="w-full bg-primary hover:bg-surface-tint text-on-primary py-2 rounded-xl text-[11px] font-label-caps font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">send</span>
                        Dispatch Emergency Pre-Clearance
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
