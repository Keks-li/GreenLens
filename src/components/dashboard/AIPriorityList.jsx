import React from 'react';

export default function AIPriorityList({
  priorityActions,
  onDispatch,
  onViewDetails
}) {
  return (
    <div className="bg-[#eaf8ee]/60 p-5 sm:p-6 rounded-3xl shadow-card-soft border border-[#bbf0cb] flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px] animate-pulse">
            auto_awesome
          </span>
          <span className="font-label-caps text-primary uppercase tracking-wider text-[11px] font-extrabold">
            AI Priority Actions
          </span>
        </div>
        <span className="text-[10.5px] font-bold font-data-mono bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded-full border border-primary/20">
          {priorityActions?.length || 0} Items
        </span>
      </div>

      <p className="font-body-md text-on-surface-variant mb-4 text-[13.5px]">
        {priorityActions?.length || 0} drainage segments require intervention before next rain event.
      </p>

      {/* List of AI Recommended Actions */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {(priorityActions || []).length > 0 ? (
          (priorityActions || []).map((action) => {
          const isCritical = action.riskScore >= 90;
          const isHigh = action.riskScore >= 75 && action.riskScore < 90;

          return (
            <div
              key={action.id}
              className={`bg-surface-container-lowest p-4 rounded-2xl shadow-2xs hover:shadow-card-hover transition-all duration-200 cursor-pointer border-l-4 group hover:translate-x-0.5 border border-outline-variant/60 ${
                isCritical
                  ? 'border-l-risk-critical hover:border-l-risk-critical'
                  : isHigh
                  ? 'border-l-risk-high hover:border-l-risk-high'
                  : 'border-l-primary hover:border-l-primary'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-title-md text-[15px] text-on-surface group-hover:text-primary transition-colors font-bold">
                    {action.drainName || action.drainId}
                  </h3>
                  <span className="font-body-sm text-on-surface-variant text-[12px] font-medium">
                    {action.sector}
                  </span>
                </div>
                <div
                  className={`px-2.5 py-0.5 rounded-full font-data-mono text-[10.5px] font-bold ${
                    isCritical
                      ? 'bg-error-container text-on-error-container'
                      : isHigh
                      ? 'bg-[#ffedd5] text-risk-high'
                      : 'bg-primary-container text-on-primary-container'
                  }`}
                >
                  RISK {action.riskScore}/100
                </div>
              </div>

              <p className="font-body-sm text-on-surface-variant mb-3 line-clamp-2 text-[12.5px] leading-relaxed">
                {action.description}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={action.status === 'resolved'}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (action.status !== 'resolved' && onDispatch) onDispatch(action);
                  }}
                  title={action.status === 'resolved' ? 'Resolved' : 'Dispatch Field Crew'}
                  className={`px-3 py-1.5 rounded-xl font-label-caps text-[11px] transition-all flex items-center gap-1.5 ${
                    action.status === 'resolved'
                      ? 'bg-surface-container text-outline cursor-not-allowed opacity-60'
                      : 'bg-primary text-white hover:bg-primary/90 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer font-bold'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {action.status === 'resolved' ? 'check_circle' : 'send'}
                  </span>
                  <span>{action.status === 'resolved' ? 'Resolved' : 'Dispatch'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails && onViewDetails(action);
                  }}
                  className="bg-surface-container hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded-xl font-label-caps text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>
          );
        })
        ) : (
          <div className="text-center py-8 text-outline text-[13px] bg-surface-container-lowest/50 rounded-2xl border border-outline-variant/40">
            No active AI priority intervention items required.
          </div>
        )}
      </div>
    </div>
  );
}
