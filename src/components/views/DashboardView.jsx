import React from 'react';
import KPIGrid from '../dashboard/KPIGrid';
import LiveTelemetryMap from '../dashboard/LiveTelemetryMap';
import RiskSummary from '../dashboard/RiskSummary';
import AIPriorityList from '../dashboard/AIPriorityList';

export default function DashboardView({
  kpis,
  drainageSegments = [],
  incidents = [],
  weather = null,
  focusedLocation = null,
  priorityActions = [],
  selectedMunicipality,
  citizenRewards = [],
  onNavigateView,
  onSelectSegment,
  onSelectIncident,
  selectedSegmentId,
  onDispatchAction,
  onViewDetailsAction,
  onInspectRisk
}) {
  const segments = drainageSegments || [];
  const criticalDrainsCount = segments.filter(
    (s) => s.riskLevel === 'critical' || s.riskScore >= 80 || s.blockagePercent >= 75
  ).length;

  const highRiskSectors = new Set();
  segments.forEach((s) => {
    if (s.riskLevel === 'critical' || s.riskLevel === 'high' || s.riskScore >= 70) {
      if (s.sector) highRiskSectors.add(s.sector);
    }
  });
  (incidents || []).forEach((inc) => {
    if (inc.severity === 'critical' || inc.severity === 'high') {
      if (inc.sector) highRiskSectors.add(inc.sector);
    }
  });
  const highRiskCommunitiesCount = highRiskSectors.size || (criticalDrainsCount > 0 ? criticalDrainsCount : 1);
  const rainForecastHours = weather?.rainForecastHours || 18;
  const rain24hMm = weather?.rain24hMm || '5.9';

  // Calculate total citizen eco points
  const totalEcoPoints = (citizenRewards || []).reduce((acc, curr) => acc + (curr.points || 0), 100);
  const reportsCount = incidents.length || 3;
  const overallRisk = criticalDrainsCount > 2 ? 'High' : criticalDrainsCount > 0 ? 'Moderate' : 'Low';

  return (
    <div className="flex flex-col w-full">
      <div className="px-4 sm:px-8 py-4 sm:py-6 w-full max-w-[1440px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Welcome Header & Municipality Location Pill */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-[11px] font-bold tracking-wide uppercase mb-2 border border-[#bbf7d0]">
              <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
              <span>{selectedMunicipality?.name || 'Winneba Municipal Assembly'}</span>
            </div>
            <h1 className="font-headline-lg text-on-surface font-bold text-[26px] sm:text-[32px] tracking-tight">
              Good morning, Municipal Officer
            </h1>
            <p className="font-body-md text-on-surface-variant text-[14px] sm:text-[15px]">
              Live environmental telemetry, flood risk sentinel, and citizen rewards intelligence.
            </p>
          </div>

          {/* Quick Action Navigation Grid (Matching Mobile App 4 Pastel Tiles) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full md:w-auto">
            {/* AI Scan Action */}
            <button
              onClick={() => onNavigateView && onNavigateView('incidents')}
              className="bg-primary hover:bg-primary/95 text-white p-3 rounded-2xl flex flex-col items-start gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-98 cursor-pointer text-left relative overflow-hidden min-w-[120px]"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                </div>
                <span className="text-[9px] font-extrabold bg-[#fde047] text-[#854d0e] px-1.5 py-0.5 rounded-md">
                  AI
                </span>
              </div>
              <div className="mt-1">
                <div className="font-bold text-[13px] leading-tight">AI Scan</div>
                <div className="text-[10px] text-white/80">Report Drain</div>
              </div>
            </button>

            {/* Flood Radar Action */}
            <button
              onClick={() => onNavigateView && onNavigateView('flood-risk')}
              className="bg-[#e0f2fe] hover:bg-[#d0ebfd] text-[#0369a1] p-3 rounded-2xl flex flex-col items-start gap-1.5 border border-[#bae6fd] shadow-2xs transition-all hover:scale-[1.02] active:scale-98 cursor-pointer text-left min-w-[120px]"
            >
              <div className="w-8 h-8 rounded-xl bg-[#bae6fd]/60 flex items-center justify-center text-[#0284c7]">
                <span className="material-symbols-outlined text-[18px]">water_drop</span>
              </div>
              <div className="mt-1">
                <div className="font-bold text-[13px] leading-tight text-[#0369a1]">Flood Radar</div>
                <div className="text-[10px] text-[#0284c7]/80">Live Forecast</div>
              </div>
            </button>

            {/* Map View Action */}
            <button
              onClick={() => onNavigateView && onNavigateView('digital-twin')}
              className="bg-[#fef3c7] hover:bg-[#fde68a] text-[#b45309] p-3 rounded-2xl flex flex-col items-start gap-1.5 border border-[#fde68a] shadow-2xs transition-all hover:scale-[1.02] active:scale-98 cursor-pointer text-left min-w-[120px]"
            >
              <div className="w-8 h-8 rounded-xl bg-[#fde68a]/60 flex items-center justify-center text-[#d97706]">
                <span className="material-symbols-outlined text-[18px]">explore</span>
              </div>
              <div className="mt-1">
                <div className="font-bold text-[13px] leading-tight text-[#b45309]">Map View</div>
                <div className="text-[10px] text-[#d97706]/80">Near You</div>
              </div>
            </button>

            {/* Rewards Action */}
            <button
              onClick={() => onNavigateView && onNavigateView('waste-intelligence')}
              className="bg-[#f3e8ff] hover:bg-[#ebd5ff] text-[#7e22ce] p-3 rounded-2xl flex flex-col items-start gap-1.5 border border-[#e9d5ff] shadow-2xs transition-all hover:scale-[1.02] active:scale-98 cursor-pointer text-left min-w-[120px]"
            >
              <div className="w-8 h-8 rounded-xl bg-[#e9d5ff]/60 flex items-center justify-center text-[#9333ea]">
                <span className="material-symbols-outlined text-[18px]">card_giftcard</span>
              </div>
              <div className="mt-1">
                <div className="font-bold text-[13px] leading-tight text-[#7e22ce]">Rewards</div>
                <div className="text-[10px] text-[#9333ea]/80">Redeem Pts</div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Design Signature Cards: Community Flood Sentinel & Impact Rewards Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Community Flood Sentinel Card (7 cols) */}
          <div className="lg:col-span-7 bg-[#eaf8ee] border border-[#bbf0cb] rounded-3xl p-5 sm:p-6 shadow-card-soft flex flex-col justify-between relative overflow-hidden">
            {/* Background subtle watermark */}
            <div className="absolute right-3 top-2 text-[#0d6832]/5 pointer-events-none">
              <span className="material-symbols-outlined text-[120px]">shield</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
                <h2 className="font-title-md text-primary font-bold text-[16px] tracking-tight">
                  Community Flood Sentinel
                </h2>
              </div>

              {/* Status Box */}
              <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-[#bbf0cb]/60 mb-4 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    </div>
                    <span className="font-title-md font-bold text-on-surface text-[15px]">
                      Risk Level: <span className={overallRisk === 'High' ? 'text-risk-critical' : overallRisk === 'Moderate' ? 'text-risk-high' : 'text-primary'}>{overallRisk}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#0d6832] text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-data-mono tracking-wide shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#86efac] animate-ping"></span>
                    <span>LIVE RADAR</span>
                  </div>
                </div>

                <p className="text-[12.5px] text-on-surface-variant pl-9">
                  {criticalDrainsCount > 0
                    ? `${criticalDrainsCount} culverts need immediate desilting • Localized risk elevated`
                    : 'Drainage network clear • Minimal municipal flood risk'}
                </p>
              </div>
            </div>

            {/* Bottom Forecast & Precautions Row */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-[#bbf0cb]/50">
              <div className="inline-flex items-center gap-2 bg-white/90 px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-on-surface border border-[#bbf0cb]/70 shadow-2xs">
                <span className="material-symbols-outlined text-primary text-[16px]">rainy</span>
                <span>Rain Forecast: <strong>{rain24hMm} mm</strong> (24h)</span>
              </div>

              <button
                onClick={() => onNavigateView && onNavigateView('flood-risk')}
                className="text-primary hover:text-primary/80 font-bold text-[12.5px] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Precautions</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Your Impact & Rewards Card (5 cols) */}
          <div className="lg:col-span-5 bg-forest-hero rounded-3xl p-5 sm:p-6 text-white shadow-card-hover flex flex-col justify-between relative overflow-hidden">
            {/* Background glowing gradient ball */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#86efac]/10 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#86efac] text-[20px]">energy_savings_leaf</span>
                  <span className="font-title-md font-bold text-[15px] text-white">Your Impact &amp; Rewards</span>
                </div>
                <span className="bg-[#fef9c3] text-[#854d0e] border border-[#fef08a] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                  ECO NOVICE
                </span>
              </div>

              {/* Main Score Display */}
              <div className="flex items-baseline justify-between mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-extrabold text-[36px] sm:text-[42px] leading-none text-white">
                    {totalEcoPoints}
                  </span>
                  <span className="font-bold text-[13px] tracking-wider text-[#86efac] uppercase">
                    GREEN PTS
                  </span>
                </div>

                <button
                  onClick={() => onNavigateView && onNavigateView('waste-intelligence')}
                  className="bg-[#fde047] hover:bg-[#facc15] text-[#854d0e] font-bold text-[11.5px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Redeem</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>

              {/* Sub-Pills */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-[#86efac] font-bold text-[13px]">✓</span>
                  <span className="text-[11.5px] font-semibold text-white/95 truncate">
                    {reportsCount} Reports Filed
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-[#fde047] text-[13px]">⚡</span>
                  <span className="text-[11.5px] font-semibold text-white/95 truncate">
                    Instant AI Review
                  </span>
                </div>
              </div>
            </div>

            {/* Active Quest Card */}
            <div className="bg-white rounded-2xl p-3.5 text-on-surface shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[16px]">📋</span>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-primary tracking-wide block">ACTIVE QUEST</span>
                    <span className="font-bold text-[12px] text-on-surface">Report 5 Blocked Drains</span>
                  </div>
                </div>
                <span className="bg-[#fef9c3] text-[#854d0e] border border-[#fef08a] px-2 py-0.5 rounded-full text-[10px] font-extrabold font-data-mono">
                  +250 PTS
                </span>
              </div>
              <div className="w-full bg-[#e8f0e8] rounded-full h-2 overflow-hidden mb-1.5">
                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
              </div>
              <div className="flex justify-between items-center text-[10.5px] text-on-surface-variant font-semibold">
                <span>3 of 5 tasks completed</span>
                <span className="text-primary font-bold">60%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive KPI Row */}
        <div>
          <h3 className="font-title-md font-bold text-on-surface text-[17px] mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">monitoring</span>
            <span>Municipal Performance Indicators</span>
          </h3>
          <KPIGrid
            kpis={kpis}
            onCardClick={(type) => {
              if (type === 'reports' || type === 'critical') onNavigateView && onNavigateView('incidents');
              else if (type === 'flood') onNavigateView && onNavigateView('flood-risk');
              else if (type === 'cleanups') onNavigateView && onNavigateView('dispatch');
              else if (type === 'waste') onNavigateView && onNavigateView('waste-intelligence');
            }}
          />
        </div>

        {/* Live Risk Section & AI Recommendations (12-col Grid) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
          {/* Left: Interactive Map (8 cols) */}
          <LiveTelemetryMap
            drainageSegments={drainageSegments}
            incidents={incidents}
            focusedLocation={focusedLocation}
            onSelectSegment={onSelectSegment}
            onSelectIncident={onSelectIncident}
            selectedSegmentId={selectedSegmentId}
          />

          {/* Right: Risk Summary & AI Recs (4 cols) */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <RiskSummary
              criticalDrainsCount={criticalDrainsCount}
              highRiskCommunitiesCount={highRiskCommunitiesCount}
              rainForecastHours={rainForecastHours}
              onInspectRisk={onInspectRisk}
            />

            <AIPriorityList
              priorityActions={priorityActions}
              onDispatch={onDispatchAction}
              onViewDetails={onViewDetailsAction}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
