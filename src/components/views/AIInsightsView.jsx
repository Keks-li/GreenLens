import React, { useState } from 'react';

export default function AIInsightsView({ onOpenDispatch }) {
  const [rainfallMm, setRainfallMm] = useState(45);
  const [debrisIncreasePercent, setDebrisIncreasePercent] = useState(20);
  const [proactiveCleanApplied, setProactiveCleanApplied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Computed hydraulic simulation outcomes
  const baseRisk = Math.min(100, Math.round(rainfallMm * 0.7 + debrisIncreasePercent * 0.8));
  const effectiveRisk = proactiveCleanApplied ? Math.max(20, baseRisk - 35) : baseRisk;
  const criticalDrainsCount = effectiveRisk > 75 ? Math.round(effectiveRisk / 8) : Math.round(effectiveRisk / 15);
  const estimatedWaterVolume = Math.round(rainfallMm * 240 * (1 + debrisIncreasePercent / 100));
  const affectedPopulation = Math.round(effectiveRisk * 85);

  const runLiveSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="px-8 py-6 w-full max-w-[1440px] mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[24px]">psychology_alt</span>
            <h1 className="font-headline-lg text-on-surface">AI Simulation &amp; Predictive Insights</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Run real-time multi-variable hydraulic what-if simulations to evaluate storm impacts before rainfall onset.
          </p>
        </div>

        <button
          onClick={runLiveSimulation}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">play_arrow</span>
          Run Neural Simulation
        </button>
      </div>

      {/* Main Simulation Control Canvas (12 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Simulation Controls (Left 5 cols) */}
        <div className="xl:col-span-5 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
            <h3 className="font-title-md text-[17px] font-bold text-on-surface">Simulation Parameters</h3>
            <span className="text-[11px] font-bold uppercase bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-data-mono">
              Model v3.4 (Ghana Central)
            </span>
          </div>

          {/* Rainfall Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[13px]">
              <span className="font-semibold text-on-surface">Simulated Deluge Volume</span>
              <span className="font-bold text-primary text-[15px] font-data-mono">{rainfallMm} mm/hr</span>
            </div>
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              value={rainfallMm}
              onChange={(e) => setRainfallMm(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-outline">
              <span>10 mm (Light Shower)</span>
              <span>60 mm (Heavy Storm)</span>
              <span>120 mm (Severe Deluge)</span>
            </div>
          </div>

          {/* Debris Accumulation Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[13px]">
              <span className="font-semibold text-on-surface">Debris &amp; Silt Factor</span>
              <span className="font-bold text-risk-high text-[15px] font-data-mono">+{debrisIncreasePercent}% Choke</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={debrisIncreasePercent}
              onChange={(e) => setDebrisIncreasePercent(Number(e.target.value))}
              className="w-full accent-risk-high cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-outline">
              <span>0% (Pristine Drains)</span>
              <span>40% (Current Season Avg)</span>
              <span>80% (Severe Blockage)</span>
            </div>
          </div>

          {/* Proactive Cleanup Toggle */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 flex items-center justify-between">
            <div>
              <div className="font-semibold text-on-surface text-[13px]">Proactive Clearance Applied</div>
              <p className="text-[11px] text-on-surface-variant">Simulate dispatching 4 cleanup teams before storm peak</p>
            </div>
            <button
              onClick={() => setProactiveCleanApplied(!proactiveCleanApplied)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                proactiveCleanApplied ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                  proactiveCleanApplied ? 'right-1' : 'left-1'
                }`}
              ></div>
            </button>
          </div>

          {/* AI Confidence Metric */}
          <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
            <div className="text-[12px]">
              <span className="font-bold text-on-surface block">94.6% Historical Model Accuracy</span>
              <span className="text-on-surface-variant">Calibrated against 2021-2025 Winneba flooding benchmarks.</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Results (Right 7 cols) */}
        <div className="xl:col-span-7 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3 mb-4">
              <h3 className="font-title-md text-[17px] font-bold text-on-surface">Predicted Inundation Impact</h3>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase font-data-mono ${
                  effectiveRisk >= 80
                    ? 'bg-error-container text-on-error-container'
                    : effectiveRisk >= 55
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-primary-container text-on-primary-container'
                }`}
              >
                {effectiveRisk >= 80 ? 'Severe Inundation Warning' : effectiveRisk >= 55 ? 'Moderate Surface Runoff' : 'Controlled Flow'}
              </span>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40">
                <span className="text-[11px] uppercase font-label-caps text-outline">Risk Score</span>
                <div
                  className={`text-[26px] font-bold font-data-mono mt-1 ${
                    effectiveRisk >= 80 ? 'text-risk-critical' : effectiveRisk >= 55 ? 'text-risk-high' : 'text-primary'
                  }`}
                >
                  {effectiveRisk}/100
                </div>
                <span className="text-[11px] text-on-surface-variant">Overall Municipal Index</span>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40">
                <span className="text-[11px] uppercase font-label-caps text-outline">Critical Segments</span>
                <div className="text-[26px] font-bold text-risk-critical font-data-mono mt-1">
                  {criticalDrainsCount} Drains
                </div>
                <span className="text-[11px] text-on-surface-variant">Over-capacity risk</span>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 col-span-2 sm:col-span-1">
                <span className="text-[11px] uppercase font-label-caps text-outline">Pop. Affected</span>
                <div className="text-[26px] font-bold text-on-surface font-data-mono mt-1">
                  ~{affectedPopulation.toLocaleString()}
                </div>
                <span className="text-[11px] text-on-surface-variant">Traders &amp; Residents</span>
              </div>
            </div>

            {/* Simulation Narrative */}
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 text-[13px] leading-relaxed space-y-2">
              <div className="font-bold text-on-surface flex items-center gap-1.5 text-[14px]">
                <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                AI Hydraulic Forecast Summary
              </div>
              <p className="text-on-surface-variant">
                Under {rainfallMm}mm/hr rainfall with +{debrisIncreasePercent}% debris obstruction,{' '}
                <strong className="text-on-surface">Drain D-102 (Central Market)</strong> and{' '}
                <strong className="text-on-surface">Drain D-104 (North Campus)</strong> will exceed maximum throughput
                within 45 minutes of storm onset.
              </p>
              {proactiveCleanApplied ? (
                <p className="text-primary font-semibold bg-primary/10 p-2.5 rounded-lg">
                  ✓ Proactive clearance mitigates estimated flood extent by 68%, safeguarding 2,800 market stalls.
                </p>
              ) : (
                <p className="text-risk-critical font-semibold bg-error-container/40 p-2.5 rounded-lg">
                  ⚠️ Action Required: Without pre-storm clearance, surface runoff will overflow onto Liberation Road.
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
            <span className="text-[12px] text-outline font-data-mono">Est. Runoff: {estimatedWaterVolume.toLocaleString()} m³</span>
            <button
              onClick={() => onOpenDispatch && onOpenDispatch({ id: 'D-102', name: 'Simulated Choke Points (D-102 & D-104)' })}
              className="bg-primary text-on-primary px-5 py-2 rounded-xl text-[12px] font-label-caps hover:bg-surface-tint shadow-xs flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              Dispatch Proactive Teams
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
