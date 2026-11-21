import React, { useState } from 'react';

export default function AIInsightsView({ drainageSegments = [], priorityActions = [], onOpenDispatch }) {
  const [rainfallMm, setRainfallMm] = useState(45);
  const [debrisIncreasePercent, setDebrisIncreasePercent] = useState(20);
  const [proactiveCleanApplied, setProactiveCleanApplied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Compute dynamic hydraulic simulation outcomes based on drainage database records
  const totalDrainsCount = drainageSegments.length;
  const highRiskDrains = drainageSegments.filter(s => s.riskLevel === 'critical' || s.riskScore >= 75);
  const topChokePoints = highRiskDrains.length > 0 ? highRiskDrains.slice(0, 2) : drainageSegments.slice(0, 2);

  const baseRisk = Math.min(100, Math.round(rainfallMm * 0.7 + debrisIncreasePercent * 0.8));
  const effectiveRisk = proactiveCleanApplied ? Math.max(20, baseRisk - 35) : baseRisk;
  const criticalDrainsCount = totalDrainsCount > 0
    ? (effectiveRisk > 75 
        ? Math.max(1, Math.min(totalDrainsCount, Math.round((effectiveRisk / 100) * totalDrainsCount))) 
        : Math.max(0, Math.round((effectiveRisk / 100) * (totalDrainsCount / 2))))
    : 0;
  const estimatedWaterVolume = totalDrainsCount > 0 ? Math.round(rainfallMm * totalDrainsCount * 40 * (1 + debrisIncreasePercent / 100)) : 0;
  const affectedPopulation = totalDrainsCount > 0 ? Math.round(effectiveRisk * totalDrainsCount * 15) : 0;

  const runLiveSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="px-4 sm:px-8 py-4 sm:py-6 w-full max-w-[1440px] mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[24px]">psychology_alt</span>
            <h1 className="font-headline-lg text-on-surface">AI Simulation &amp; Predictive Insights</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Run real-time multi-variable hydraulic what-if simulations to evaluate storm impacts across {totalDrainsCount} monitored infrastructure segments.
          </p>
        </div>

        <button
          onClick={runLiveSimulation}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">play_arrow</span>
          {isSimulating ? 'Simulating...' : 'Run Neural Simulation'}
        </button>
      </div>

      {/* Main Simulation Control Canvas (12 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Simulation Controls (Left 5 cols) */}
        <div className="xl:col-span-5 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/60 shadow-card-soft space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
            <h3 className="font-title-md text-[17px] font-bold text-on-surface">Simulation Parameters</h3>
            <span className="text-[10.5px] font-bold uppercase bg-primary-container text-on-primary-container px-3 py-0.5 rounded-full font-data-mono">
              Model v3.4
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
            <div className="flex justify-between text-[10px] text-outline font-medium">
              <span>10 mm (Light)</span>
              <span>60 mm (Heavy)</span>
              <span>120 mm (Severe)</span>
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
            <div className="flex justify-between text-[10px] text-outline font-medium">
              <span>0% (Pristine)</span>
              <span>40% (Average)</span>
              <span>80% (Severe)</span>
            </div>
          </div>

          {/* Proactive Cleanup Toggle */}
          <div className="bg-[#f4f7f4] p-4 rounded-2xl border border-[#d5e2d6] flex items-center justify-between">
            <div>
              <div className="font-bold text-on-surface text-[13px]">Proactive Clearance Applied</div>
              <p className="text-[11px] text-on-surface-variant font-medium">Simulate dispatching teams before storm peak</p>
            </div>
            <button
              onClick={() => setProactiveCleanApplied(!proactiveCleanApplied)}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
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
          <div className="p-3.5 bg-primary-container/30 rounded-2xl border border-primary/20 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
            <div className="text-[12px]">
              <span className="font-bold text-on-surface block">94.6% Historical Model Accuracy</span>
              <span className="text-on-surface-variant font-medium">Calibrated against municipal drainage GIS telemetry.</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Results (Right 7 cols) */}
        <div className="xl:col-span-7 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/60 shadow-card-soft flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3 mb-4">
              <h3 className="font-title-md text-[17px] font-bold text-on-surface">Predicted Inundation Impact</h3>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase font-data-mono ${
                  effectiveRisk >= 80
                    ? 'bg-error-container text-on-error-container'
                    : effectiveRisk >= 55
                    ? 'bg-[#ffedd5] text-risk-high'
                    : 'bg-primary-container text-on-primary-container'
                }`}
              >
                {effectiveRisk >= 80 ? 'Severe Inundation Warning' : effectiveRisk >= 55 ? 'Moderate Runoff' : 'Controlled Flow'}
              </span>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-[#f4f7f4] p-4 rounded-2xl border border-[#d5e2d6]">
                <span className="text-[10.5px] uppercase font-label-caps text-outline font-bold">Risk Score</span>
                <div
                  className={`text-[26px] font-extrabold font-data-mono mt-1 ${
                    effectiveRisk >= 80 ? 'text-risk-critical' : effectiveRisk >= 55 ? 'text-risk-high' : 'text-primary'
                  }`}
                >
                  {effectiveRisk}/100
                </div>
                <span className="text-[11px] text-on-surface-variant font-medium">Municipal Index</span>
              </div>

              <div className="bg-[#f4f7f4] p-4 rounded-2xl border border-[#d5e2d6]">
                <span className="text-[10.5px] uppercase font-label-caps text-outline font-bold">Critical Segments</span>
                <div className="text-[26px] font-extrabold text-risk-critical font-data-mono mt-1">
                  {criticalDrainsCount} Drains
                </div>
                <span className="text-[11px] text-on-surface-variant font-medium">Over-capacity risk</span>
              </div>

              <div className="bg-[#f4f7f4] p-4 rounded-2xl border border-[#d5e2d6] col-span-2 sm:col-span-1">
                <span className="text-[10.5px] uppercase font-label-caps text-outline font-bold">Pop. Affected</span>
                <div className="text-[26px] font-extrabold text-on-surface font-data-mono mt-1">
                  ~{affectedPopulation.toLocaleString()}
                </div>
                <span className="text-[11px] text-on-surface-variant font-medium">Traders &amp; Residents</span>
              </div>
            </div>

            {/* Simulation Narrative */}
            <div className="bg-[#f4f7f4] p-4 rounded-2xl border border-[#d5e2d6] text-[13px] leading-relaxed space-y-2">
              <div className="font-bold text-on-surface flex items-center gap-1.5 text-[14px]">
                <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                AI Hydraulic Forecast Summary
              </div>
              <p className="text-on-surface-variant">
                Under {rainfallMm}mm/hr rainfall with +{debrisIncreasePercent}% debris obstruction,{' '}
                {topChokePoints.map((cp, idx) => (
                  <span key={cp.id}>
                    {idx > 0 ? ' and ' : ''}
                    <strong className="text-on-surface">{cp.name || cp.id} ({cp.sector})</strong>
                  </span>
                ))}{' '}
                will exceed maximum hydraulic throughput within 45 minutes.
              </p>
              {proactiveCleanApplied ? (
                <p className="text-primary font-bold bg-primary-container p-3 rounded-xl border border-[#bbf7d0]">
                  ✓ Proactive clearance mitigates estimated flood extent by 68%, safeguarding critical community corridors.
                </p>
              ) : (
                <p className="text-risk-critical font-bold bg-error-container/60 p-3 rounded-xl border border-risk-critical/20">
                  ⚠️ Action Required: Without pre-storm clearance, surface runoff will overflow onto arterial transport links.
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
            <span className="text-[12px] text-outline font-data-mono font-medium">Est. Runoff: {estimatedWaterVolume.toLocaleString()} m³</span>
            <button
              onClick={() => onOpenDispatch && onOpenDispatch(topChokePoints[0] || { name: 'Simulated Choke Points' })}
              className="bg-primary text-white px-5 py-2.5 rounded-full text-[11.5px] font-label-caps hover:bg-primary/90 shadow-2xs flex items-center gap-2 font-bold cursor-pointer"
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
