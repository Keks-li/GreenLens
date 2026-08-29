import React from 'react';

export default function KPIGrid({ kpis, onCardClick }) {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {/* Reports Today */}
      <div
        onClick={() => onCardClick && onCardClick('reports')}
        className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border border-outline-variant/40 hover:border-primary/40"
      >
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/15 transition-colors"></div>
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <span className="font-label-caps text-outline-subtle uppercase tracking-wider text-[10px] sm:text-[11px] truncate">Reports Today</span>
          <span className="material-symbols-outlined text-primary text-[18px] sm:text-[20px]">assignment</span>
        </div>
        <div className="flex items-end gap-1.5 sm:gap-2">
          <span className="font-display-lg text-on-surface text-[22px] sm:text-[28px]">{kpis.reportsToday?.value ?? 0}</span>
          <span className="font-body-sm text-primary mb-1 sm:mb-2 flex items-center font-semibold text-[11px] sm:text-[13px]">
            <span className="material-symbols-outlined text-[13px] sm:text-[14px]">arrow_upward</span>
            {kpis.reportsToday?.change || '0%'}
          </span>
        </div>
      </div>

      {/* Critical Incidents */}
      <div
        onClick={() => onCardClick && onCardClick('critical')}
        className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border border-outline-variant/40 hover:border-risk-critical/40"
      >
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-risk-critical/5 rounded-full blur-xl group-hover:bg-risk-critical/15 transition-colors"></div>
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <span className="font-label-caps text-outline-subtle uppercase tracking-wider text-[10px] sm:text-[11px] truncate">Critical Incidents</span>
          <div className="w-2.5 h-2.5 rounded-full bg-risk-critical animate-pulse mt-1 shadow-xs shadow-risk-critical"></div>
        </div>
        <div className="flex items-end gap-1.5 sm:gap-2">
          <span className="font-display-lg text-on-surface text-[22px] sm:text-[28px]">{kpis.criticalIncidents?.value ?? 0}</span>
          <span className="font-body-sm text-risk-critical mb-1 sm:mb-2 flex items-center font-semibold text-[11px] sm:text-[13px]">
            <span className="material-symbols-outlined text-[13px] sm:text-[14px]">arrow_upward</span>
            {kpis.criticalIncidents?.change || '0'}
          </span>
        </div>
      </div>

      {/* High Flood Risk */}
      <div
        onClick={() => onCardClick && onCardClick('flood')}
        className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border border-outline-variant/40 hover:border-risk-high/40"
      >
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-risk-high/5 rounded-full blur-xl group-hover:bg-risk-high/15 transition-colors"></div>
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <span className="font-label-caps text-outline-subtle uppercase tracking-wider text-[10px] sm:text-[11px] truncate">High Flood Risk</span>
          <span className="material-symbols-outlined text-risk-high text-[18px] sm:text-[20px]">flood</span>
        </div>
        <div className="flex items-end gap-1.5 sm:gap-2">
          <span className="font-display-lg text-on-surface text-[22px] sm:text-[28px]">{kpis.highFloodRisk?.value ?? 0}</span>
          <span className="font-body-sm text-on-surface-variant mb-1 sm:mb-2 font-medium text-[11px] sm:text-[13px]">
            {kpis.highFloodRisk?.unit || 'Areas'}
          </span>
        </div>
      </div>

      {/* Active Cleanups */}
      <div
        onClick={() => onCardClick && onCardClick('cleanups')}
        className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border border-outline-variant/40 hover:border-tertiary/40"
      >
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-tertiary/5 rounded-full blur-xl group-hover:bg-tertiary/15 transition-colors"></div>
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <span className="font-label-caps text-outline-subtle uppercase tracking-wider text-[10px] sm:text-[11px] truncate">Active Cleanups</span>
          <span className="material-symbols-outlined text-tertiary text-[18px] sm:text-[20px]">cleaning_services</span>
        </div>
        <div className="flex items-end gap-1.5 sm:gap-2">
          <span className="font-display-lg text-on-surface text-[22px] sm:text-[28px]">{kpis.activeCleanups?.value ?? 0}</span>
          <span className="font-body-sm text-tertiary mb-1 sm:mb-2 flex items-center font-semibold text-[11px] sm:text-[13px]">
            <span className="material-symbols-outlined text-[13px] sm:text-[14px]">arrow_upward</span>
            {kpis.activeCleanups?.change || '0'}
          </span>
        </div>
      </div>

      {/* Resolved Today */}
      <div
        onClick={() => onCardClick && onCardClick('resolved')}
        className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border border-outline-variant/40 hover:border-risk-healthy/40"
      >
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-risk-healthy/5 rounded-full blur-xl group-hover:bg-risk-healthy/15 transition-colors"></div>
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <span className="font-label-caps text-outline-subtle uppercase tracking-wider text-[10px] sm:text-[11px] truncate">Resolved Today</span>
          <span className="material-symbols-outlined text-risk-healthy text-[18px] sm:text-[20px]">check_circle</span>
        </div>
        <div className="flex items-end gap-1.5 sm:gap-2">
          <span className="font-display-lg text-on-surface text-[22px] sm:text-[28px]">{kpis.resolvedToday?.value ?? 0}</span>
          <span className="font-body-sm text-risk-healthy mb-1 sm:mb-2 flex items-center font-semibold text-[11px] sm:text-[13px]">
            <span className="material-symbols-outlined text-[13px] sm:text-[14px]">arrow_upward</span>
            {kpis.resolvedToday?.change || '0%'}
          </span>
        </div>
      </div>

      {/* Waste Removed */}
      <div
        onClick={() => onCardClick && onCardClick('waste')}
        className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border border-outline-variant/40 hover:border-secondary/40"
      >
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-secondary/5 rounded-full blur-xl group-hover:bg-secondary/15 transition-colors"></div>
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <span className="font-label-caps text-outline-subtle uppercase tracking-wider text-[10px] sm:text-[11px] truncate">Waste Removed</span>
          <span className="material-symbols-outlined text-secondary text-[18px] sm:text-[20px]">delete</span>
        </div>
        <div className="flex items-end gap-1.5 sm:gap-2">
          <span className="font-display-lg text-on-surface text-[22px] sm:text-[28px]">{kpis.wasteRemoved?.value ?? 0.0}</span>
          <span className="font-body-sm text-on-surface-variant mb-1 sm:mb-2 font-medium text-[11px] sm:text-[13px]">
            {kpis.wasteRemoved?.unit || 'Tons'}
          </span>
        </div>
      </div>
    </div>
  );
}
