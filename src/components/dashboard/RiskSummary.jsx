import React from 'react';

export default function RiskSummary({
  criticalDrainsCount = 0,
  highRiskCommunitiesCount = 0,
  rainForecastHours = 18,
  onInspectRisk
}) {
  const isElevated = criticalDrainsCount > 0 || highRiskCommunitiesCount > 0;

  return (
    <div className={`p-5 sm:p-6 rounded-3xl shadow-card-soft relative overflow-hidden border transition-all ${
      isElevated ? 'bg-error-container/80 border-risk-critical/30' : 'bg-[#eaf8ee] border-[#bbf0cb]'
    }`}>
      {/* Decorative radial styling */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none ${
        isElevated ? 'bg-risk-critical/10' : 'bg-primary/10'
      }`}></div>

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isElevated ? 'bg-risk-critical text-white shadow-xs' : 'bg-primary text-white shadow-xs'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {isElevated ? 'warning' : 'verified_user'}
            </span>
          </div>
          <div>
            <h2 className="font-title-md font-extrabold tracking-tight text-[16px] text-on-surface">
              {isElevated ? 'Risk Status: Elevated' : 'Risk Status: Normal'}
            </h2>
            <span className="text-[11px] font-medium text-on-surface-variant">Live Surcharge Forecast</span>
          </div>
        </div>

        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase font-data-mono ${
          isElevated ? 'bg-risk-critical text-white' : 'bg-primary text-white'
        }`}>
          {isElevated ? 'CRITICAL' : 'OPTIMAL'}
        </span>
      </div>

      <div className="space-y-2.5 relative z-10">
        <div
          onClick={() => onInspectRisk && onInspectRisk('drains')}
          className="flex justify-between items-center bg-surface-container-lowest/90 backdrop-blur-xs p-3.5 rounded-2xl border border-outline-variant/60 hover:border-risk-critical/50 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-risk-critical">waves</span>
            <span className="font-body-md text-on-surface font-semibold text-[13px]">Critical Drains</span>
          </div>
          <span className="font-title-md text-risk-critical font-bold text-[16px]">{criticalDrainsCount}</span>
        </div>

        <div
          onClick={() => onInspectRisk && onInspectRisk('communities')}
          className="flex justify-between items-center bg-surface-container-lowest/90 backdrop-blur-xs p-3.5 rounded-2xl border border-outline-variant/60 hover:border-risk-high/50 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-risk-high">location_city</span>
            <span className="font-body-md text-on-surface font-semibold text-[13px]">High-Risk Communities</span>
          </div>
          <span className="font-title-md text-risk-high font-bold text-[16px]">{highRiskCommunitiesCount}</span>
        </div>

        <div className="flex justify-between items-center bg-surface-container-lowest/90 backdrop-blur-xs p-3.5 rounded-2xl border border-outline-variant/60">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
            <span className="font-body-md text-on-surface font-semibold text-[13px]">Heavy Rain Influx</span>
          </div>
          <span className="font-title-md text-primary font-bold text-[14px]">
            {rainForecastHours} hrs
          </span>
        </div>
      </div>
    </div>
  );
}
