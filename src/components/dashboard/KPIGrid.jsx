import React from 'react';

export default function KPIGrid({ kpis, onCardClick }) {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {/* Reports Today */}
      <div
        onClick={() => onCardClick && onCardClick('reports')}
        className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-card-soft hover:shadow-card-hover relative overflow-hidden group transition-all duration-200 cursor-pointer border border-outline-variant/60 hover:border-primary/50"
      >
        <div className="absolute -right-4 -top-4 w-14 h-14 bg-primary/10 rounded-full blur-lg group-hover:bg-primary/20 transition-colors"></div>
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <span className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px] font-bold truncate">Reports Today</span>
          <div className="w-7 h-7 rounded-xl bg-primary-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[16px]">assignment</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="font-display-lg text-on-surface font-extrabold text-[24px] sm:text-[28px]">{kpis.reportsToday?.value ?? 0}</span>
          <span className="text-[11px] font-bold text-primary bg-primary-container px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
            {kpis.reportsToday?.change || '0%'}
          </span>
        </div>
      </div>

      {/* Critical Incidents */}
      <div
        onClick={() => onCardClick && onCardClick('critical')}
        className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-card-soft hover:shadow-card-hover relative overflow-hidden group transition-all duration-200 cursor-pointer border border-outline-variant/60 hover:border-risk-critical/50"
      >
        <div className="absolute -right-4 -top-4 w-14 h-14 bg-risk-critical/10 rounded-full blur-lg group-hover:bg-risk-critical/20 transition-colors"></div>
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <span className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px] font-bold truncate">Critical Incidents</span>
          <div className="w-7 h-7 rounded-xl bg-error-container flex items-center justify-center text-risk-critical">
            <span className="material-symbols-outlined text-[16px]">warning</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="font-display-lg text-on-surface font-extrabold text-[24px] sm:text-[28px]">{kpis.criticalIncidents?.value ?? 0}</span>
          <span className="text-[11px] font-bold text-risk-critical bg-error-container px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
            {kpis.criticalIncidents?.change || '0'}
          </span>
        </div>
      </div>

      {/* High Flood Risk */}
      <div
        onClick={() => onCardClick && onCardClick('flood')}
        className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-card-soft hover:shadow-card-hover relative overflow-hidden group transition-all duration-200 cursor-pointer border border-outline-variant/60 hover:border-risk-high/50"
      >
        <div className="absolute -right-4 -top-4 w-14 h-14 bg-risk-high/10 rounded-full blur-lg group-hover:bg-risk-high/20 transition-colors"></div>
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <span className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px] font-bold truncate">High Flood Risk</span>
          <div className="w-7 h-7 rounded-xl bg-[#ffedd5] flex items-center justify-center text-risk-high">
            <span className="material-symbols-outlined text-[16px]">flood</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="font-display-lg text-on-surface font-extrabold text-[24px] sm:text-[28px]">{kpis.highFloodRisk?.value ?? 0}</span>
          <span className="text-[11px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
            {kpis.highFloodRisk?.unit || 'Areas'}
          </span>
        </div>
      </div>

      {/* Active Cleanups */}
      <div
        onClick={() => onCardClick && onCardClick('cleanups')}
        className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-card-soft hover:shadow-card-hover relative overflow-hidden group transition-all duration-200 cursor-pointer border border-outline-variant/60 hover:border-primary/50"
      >
        <div className="absolute -right-4 -top-4 w-14 h-14 bg-primary/10 rounded-full blur-lg group-hover:bg-primary/20 transition-colors"></div>
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <span className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px] font-bold truncate">Active Cleanups</span>
          <div className="w-7 h-7 rounded-xl bg-primary-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[16px]">cleaning_services</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="font-display-lg text-on-surface font-extrabold text-[24px] sm:text-[28px]">{kpis.activeCleanups?.value ?? 0}</span>
          <span className="text-[11px] font-bold text-primary bg-primary-container px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
            {kpis.activeCleanups?.change || '0'}
          </span>
        </div>
      </div>

      {/* Resolved Today */}
      <div
        onClick={() => onCardClick && onCardClick('resolved')}
        className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-card-soft hover:shadow-card-hover relative overflow-hidden group transition-all duration-200 cursor-pointer border border-outline-variant/60 hover:border-primary/50"
      >
        <div className="absolute -right-4 -top-4 w-14 h-14 bg-primary/10 rounded-full blur-lg group-hover:bg-primary/20 transition-colors"></div>
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <span className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px] font-bold truncate">Resolved Today</span>
          <div className="w-7 h-7 rounded-xl bg-primary-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="font-display-lg text-on-surface font-extrabold text-[24px] sm:text-[28px]">{kpis.resolvedToday?.value ?? 0}</span>
          <span className="text-[11px] font-bold text-primary bg-primary-container px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
            {kpis.resolvedToday?.change || '0%'}
          </span>
        </div>
      </div>

      {/* Waste Removed */}
      <div
        onClick={() => onCardClick && onCardClick('waste')}
        className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-card-soft hover:shadow-card-hover relative overflow-hidden group transition-all duration-200 cursor-pointer border border-outline-variant/60 hover:border-[#b45309]/50"
      >
        <div className="absolute -right-4 -top-4 w-14 h-14 bg-[#fef3c7] rounded-full blur-lg group-hover:bg-[#fde68a] transition-colors"></div>
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <span className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[10px] font-bold truncate">Waste Removed</span>
          <div className="w-7 h-7 rounded-xl bg-[#fef3c7] flex items-center justify-center text-[#b45309]">
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="font-display-lg text-on-surface font-extrabold text-[24px] sm:text-[28px]">{kpis.wasteRemoved?.value ?? 0.0}</span>
          <span className="text-[11px] font-bold text-[#b45309] bg-[#fef3c7] px-2 py-0.5 rounded-full">
            {kpis.wasteRemoved?.unit || 'Tons'}
          </span>
        </div>
      </div>
    </div>
  );
}
