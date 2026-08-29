import React from 'react';

export default function AIPriorityView({
  priorityActions,
  onDispatch,
  onViewDetails
}) {
  return (
    <div className="px-4 sm:px-8 py-4 sm:py-6 w-full max-w-[1440px] mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-[24px] animate-pulse">
            auto_awesome
          </span>
          <h1 className="font-headline-lg text-on-surface">AI Priority & Dispatch Intelligence</h1>
        </div>
        <p className="font-body-md text-on-surface-variant">
          Predictive multi-factor ranking based on blockage severity, rainfall forecast, population density, and critical infrastructure proximity.
        </p>
      </div>

      <div className="space-y-4">
        {priorityActions.map((action, idx) => (
          <div
            key={action.id}
            className="bg-surface-container-lowest p-6 rounded-2xl shadow-xs border border-outline-variant/60 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[13px]">
                  #{idx + 1}
                </span>
                <h3 className="font-title-md text-[18px] text-on-surface font-bold">
                  {action.drainName || action.drainId}
                </h3>
                <span className="bg-error-container text-on-error-container text-[11px] font-bold px-2.5 py-0.5 rounded font-data-mono">
                  RISK {action.riskScore}/100
                </span>
                <span className="text-[12px] text-on-surface-variant">• {action.sector}</span>
              </div>

              <p className="text-[14px] text-on-surface-variant mb-4 leading-relaxed">
                {action.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/40">
                  <span className="text-outline font-semibold">Blockage: </span>
                  <span className="font-bold text-on-surface">{action.blockagePercent}%</span>
                </div>
                <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/40">
                  <span className="text-outline font-semibold">Recommended Unit: </span>
                  <span className="font-bold text-primary">{action.recommendedTeam}</span>
                </div>
                <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/40">
                  <span className="text-outline font-semibold">Time Window: </span>
                  <span className="font-bold text-risk-critical">{action.timeWindow}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-2 min-w-[160px]">
              <button
                type="button"
                disabled={action.status === 'resolved'}
                onClick={() => {
                  if (action.status !== 'resolved') onDispatch(action);
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl font-label-caps text-[12px] transition-all flex items-center justify-center gap-2 ${
                  action.status === 'resolved'
                    ? 'bg-surface-container-high text-outline cursor-not-allowed opacity-60'
                    : 'bg-primary text-on-primary hover:bg-surface-tint shadow-xs cursor-pointer'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {action.status === 'resolved' ? 'check_circle' : 'send'}
                </span>
                {action.status === 'resolved' ? 'Resolved' : 'Dispatch Now'}
              </button>
              <button
                onClick={() => onViewDetails(action)}
                className="flex-1 bg-surface-container text-on-surface px-4 py-2 rounded-xl font-label-caps text-[12px] hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                Inspect Telemetry
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
