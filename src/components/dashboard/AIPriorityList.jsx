import React from 'react';

export default function AIPriorityList({
  priorityActions,
  onDispatch,
  onViewDetails
}) {
  return (
    <div className="bg-primary/5 p-6 rounded-2xl shadow-xs border border-primary/20 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px] animate-pulse">
            auto_awesome
          </span>
          <span className="font-label-caps text-primary uppercase tracking-wider text-[11px]">
            AI Priority Actions
          </span>
        </div>
        <span className="text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          Live AI Queue
        </span>
      </div>

      <p className="font-body-md text-on-surface-variant mb-5 text-[14px]">
        {priorityActions?.length || 0} drainage segments require intervention before tomorrow's rainfall.
      </p>

      {/* List of AI Recommended Actions */}
      <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
        {(priorityActions || []).map((action) => {
          const isCritical = action.riskScore >= 90;
          const isHigh = action.riskScore >= 75 && action.riskScore < 90;

          return (
            <div
              key={action.id}
              className={`bg-surface-container-lowest p-4 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 group hover:translate-x-1 border border-outline-variant/40 ${
                isCritical
                  ? 'border-l-risk-critical hover:border-l-risk-critical'
                  : isHigh
                  ? 'border-l-risk-high hover:border-l-risk-high'
                  : 'border-l-primary hover:border-l-primary'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-title-md text-[16px] text-on-surface group-hover:text-primary transition-colors font-bold">
                    {action.drainName || action.drainId}
                  </h3>
                  <span className="font-body-sm text-on-surface-variant text-[12px]">
                    {action.sector}
                  </span>
                </div>
                <div
                  className={`px-2 py-0.5 rounded font-data-mono text-[11px] font-bold ${
                    isCritical
                      ? 'bg-error-container text-on-error-container'
                      : isHigh
                      ? 'bg-risk-high/15 text-risk-high'
                      : 'bg-primary-container/40 text-on-primary-container'
                  }`}
                >
                  RISK {action.riskScore}/100
                </div>
              </div>

              <p className="font-body-sm text-on-surface-variant mb-3 line-clamp-2 text-[13px] leading-relaxed">
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
                  className={`px-3.5 py-1.5 rounded-lg font-label-caps text-[11px] transition-all flex items-center gap-1.5 ${
                    action.status === 'resolved'
                      ? 'bg-surface-container-high text-outline cursor-not-allowed opacity-60'
                      : 'bg-primary text-on-primary hover:bg-surface-tint shadow-2xs hover:shadow-sm active:scale-95 cursor-pointer'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {action.status === 'resolved' ? 'check_circle' : 'send'}
                  </span>
                  {action.status === 'resolved' ? 'Resolved' : 'Dispatch Team'}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails && onViewDetails(action);
                  }}
                  className="bg-surface-container text-on-surface px-3 py-1.5 rounded-lg font-label-caps text-[11px] hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
