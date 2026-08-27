import React from 'react';

export default function RiskSummary({
  criticalDrainsCount = 0,
  highRiskCommunitiesCount = 0,
  rainForecastHours = 18,
  onInspectRisk
}) {
  return (
    <div className="bg-error-container p-6 rounded-2xl shadow-xs relative overflow-hidden border border-risk-critical/20">
      {/* Decorative radial styling */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-risk-critical/10 rounded-bl-full pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-on-error-container text-[24px] animate-bounce">
          warning
        </span>
        <h2 className="font-title-lg text-on-error-container font-bold tracking-tight">
          Municipal Risk: HIGH
        </h2>
      </div>

      <div className="space-y-3.5 relative z-10">
        <div
          onClick={() => onInspectRisk && onInspectRisk('drains')}
          className="flex justify-between items-center bg-surface-container-lowest/70 backdrop-blur-xs p-3.5 rounded-xl border border-risk-critical/15 hover:bg-surface-container-lowest transition-colors cursor-pointer"
        >
          <span className="font-body-md text-on-error-container font-medium">Critical Drains</span>
          <span className="font-title-md text-risk-critical font-bold">{criticalDrainsCount}</span>
        </div>

        <div
          onClick={() => onInspectRisk && onInspectRisk('communities')}
          className="flex justify-between items-center bg-surface-container-lowest/70 backdrop-blur-xs p-3.5 rounded-xl border border-risk-critical/15 hover:bg-surface-container-lowest transition-colors cursor-pointer"
        >
          <span className="font-body-md text-on-error-container font-medium">High-Risk Communities</span>
          <span className="font-title-md text-risk-critical font-bold">{highRiskCommunitiesCount}</span>
        </div>

        <div className="flex justify-between items-center bg-surface-container-lowest/70 backdrop-blur-xs p-3.5 rounded-xl border border-risk-critical/15">
          <span className="font-body-md text-on-error-container font-medium">Heavy Rain Forecast</span>
          <span className="font-title-md text-risk-critical font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            {rainForecastHours} hrs
          </span>
        </div>
      </div>
    </div>
  );
}
