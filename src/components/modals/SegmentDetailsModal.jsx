import React, { useState } from 'react';

export default function SegmentDetailsModal({
  isOpen,
  onClose,
  segment,
  onOpenDispatch
}) {
  if (!isOpen || !segment) return null;

  // What-If Simulation State
  const [simulatedRainfall, setSimulatedRainfall] = useState(0); // 0mm to 100mm
  const [simulatedBlockage, setSimulatedBlockage] = useState(segment.blockagePercent || 80);

  // Dynamic calculations
  const calculatedRiskScore = Math.min(
    100,
    Math.round(simulatedBlockage * 0.7 + (simulatedRainfall / 100) * 40)
  );

  const overflowProbability = Math.min(99, Math.round(calculatedRiskScore * 1.05));

  const getRiskColor = (score) => {
    if (score >= 85) return 'text-risk-critical bg-error-container';
    if (score >= 65) return 'text-risk-high bg-amber-100';
    if (score >= 40) return 'text-amber-700 bg-amber-50';
    return 'text-risk-healthy bg-secondary-container';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-outline-variant w-full max-w-2xl overflow-hidden animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-surface-container-low/80 backdrop-blur-md px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">hub</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-title-md font-bold text-on-surface text-[18px]">
                  {segment.name || segment.id}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded font-data-mono bg-surface-container-high text-on-surface">
                  {segment.id}
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant">
                Sector: {segment.sector} • Digital Twin Telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-body-sm">
          {/* Asset Clear Image Preview with Transparent Telemetry Overlay */}
          {segment.imageUrl && (
            <div className="relative rounded-2xl overflow-hidden h-44 border border-outline-variant/60 bg-surface-container">
              <img
                src={segment.imageUrl}
                alt={segment.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
              <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20">
                <span className="material-symbols-outlined text-primary text-[14px]">sensors</span>
                Live Telemetry Active
              </div>
              <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md p-2.5 rounded-xl text-white text-[12px] border border-white/15 flex justify-between items-center">
                <span>Coordinates: {segment.coordinates?.lat || '5.3562'}° N, {segment.coordinates?.lng || '-0.6231'}° W</span>
                <span className="font-bold text-primary-fixed">{segment.type}</span>
              </div>
            </div>
          )}

          {/* Top Status & Metrics Grid with Transparent Backdrops */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface-container-low/70 backdrop-blur-xs p-3.5 rounded-2xl border border-outline-variant/60">
              <span className="text-[10px] uppercase font-label-caps text-outline font-bold">Current Blockage</span>
              <div className="font-display-lg text-on-surface text-[22px] font-bold mt-1">
                {segment.blockagePercent}%
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-risk-critical h-1.5 rounded-full"
                  style={{ width: `${segment.blockagePercent}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-surface-container-low/70 backdrop-blur-xs p-3.5 rounded-2xl border border-outline-variant/60">
              <span className="text-[10px] uppercase font-label-caps text-outline font-bold">Risk Score</span>
              <div className="font-display-lg text-risk-critical text-[22px] font-bold mt-1">
                {segment.riskScore}/100
              </div>
              <span className="text-[10px] font-bold text-risk-critical uppercase">
                {segment.riskLevel || 'Critical'}
              </span>
            </div>

            <div className="bg-surface-container-low/70 backdrop-blur-xs p-3.5 rounded-2xl border border-outline-variant/60">
              <span className="text-[10px] uppercase font-label-caps text-outline font-bold">Capacity</span>
              <div className="font-display-lg text-on-surface text-[22px] font-bold mt-1">
                {segment.capacity || '14.5 m³/s'}
              </div>
              <span className="text-[10px] text-on-surface-variant">Flow: {segment.currentFlow || '2.1 m³/s'}</span>
            </div>

            <div className="bg-surface-container-low/70 backdrop-blur-xs p-3.5 rounded-2xl border border-outline-variant/60">
              <span className="text-[10px] uppercase font-label-caps text-outline font-bold">Last Cleaned</span>
              <div className="font-title-md text-on-surface text-[15px] font-bold mt-1">
                {segment.lastCleaned || '2026-06-12'}
              </div>
              <span className="text-[10px] text-outline">Inspected: {segment.lastInspected || 'Yesterday'}</span>
            </div>
          </div>

          {/* Thermal Scan & Asset Profile */}
          <div className="bg-surface-container-low/70 backdrop-blur-xs p-4 rounded-2xl border border-outline-variant/60 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-on-surface text-[13px]">
              <span className="material-symbols-outlined text-primary text-[18px]">document_scanner</span>
              Sensor &amp; Thermal Diagnostics
            </div>
            <p className="text-[13px] text-on-surface-variant bg-surface-container-lowest/80 p-3 rounded-xl border border-outline-variant/40 leading-relaxed">
              {segment.thermalScanStatus ||
                '80% blockage detected via thermal imaging. High probability of overflow during next precipitation event.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] pt-1">
              <div>
                <span className="text-outline font-semibold">Population at Risk: </span>
                <span className="text-on-surface font-medium">{segment.populationAtRisk || '4,200 residents'}</span>
              </div>
              <div>
                <span className="text-outline font-semibold">Critical Infrastructure: </span>
                <span className="text-on-surface font-medium">{segment.criticalInfrastructure || 'Central Market'}</span>
              </div>
            </div>
          </div>

          {/* Interactive What-If Simulation Tool */}
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/25 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-primary text-[13px]">
                <span className="material-symbols-outlined text-primary text-[18px]">science</span>
                What-If Scenario Simulation
              </div>
              <span className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded font-data-mono">
                AI Hydraulic Model
              </span>
            </div>

            {/* Sliders */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[12px] font-semibold mb-1">
                  <span>Simulate Additional Rainfall</span>
                  <span className="font-bold text-primary font-data-mono">+{simulatedRainfall} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={simulatedRainfall}
                  onChange={(e) => setSimulatedRainfall(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[12px] font-semibold mb-1">
                  <span>Simulate Blockage Level</span>
                  <span className="font-bold text-primary font-data-mono">{simulatedBlockage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={simulatedBlockage}
                  onChange={(e) => setSimulatedBlockage(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Simulation Results Output with Glass Transparency */}
            <div className="bg-surface-container-lowest/90 backdrop-blur-md p-3.5 rounded-xl border border-primary/20 flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] text-outline font-semibold">Simulated Risk Score</div>
                <div className={`text-[15px] font-bold px-2.5 py-0.5 rounded mt-0.5 font-data-mono ${getRiskColor(calculatedRiskScore)}`}>
                  {calculatedRiskScore}/100 Risk
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-outline font-semibold">Overflow Probability</div>
                <div className="text-[16px] font-bold text-risk-critical mt-0.5 font-data-mono">
                  {overflowProbability}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-container-low/80 backdrop-blur-md px-6 py-4 border-t border-outline-variant flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-on-surface-variant font-label-caps text-[12px] hover:bg-surface-container transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            disabled={segment.status === 'resolved' || segment.blockagePercentage === 0}
            onClick={() => {
              if (segment.status !== 'resolved' && segment.blockagePercentage !== 0) {
                onClose();
                onOpenDispatch && onOpenDispatch(segment);
              }
            }}
            className={`px-5 py-2.5 rounded-xl font-label-caps text-[12px] transition-all flex items-center gap-2 ${
              segment.status === 'resolved' || segment.blockagePercentage === 0
                ? 'bg-surface-container-high text-outline cursor-not-allowed opacity-60'
                : 'bg-primary text-on-primary hover:bg-surface-tint shadow-xs cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {segment.status === 'resolved' || segment.blockagePercentage === 0 ? 'check_circle' : 'local_shipping'}
            </span>
            {segment.status === 'resolved' || segment.blockagePercentage === 0 ? 'Segment Cleared' : 'Dispatch Cleanup Team'}
          </button>
        </div>
      </div>
    </div>
  );
}
