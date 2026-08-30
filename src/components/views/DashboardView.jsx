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
  fieldTeams = [],
  dispatches = [],
  onNavigateView,
  onSelectSegment,
  onSelectIncident,
  selectedSegmentId,
  onDispatchAction,
  onOpenDispatch,
  onViewDetailsAction,
  onInspectRisk,
  onLocateOnMap,
  onRefreshData
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
  const highRiskCommunitiesCount = highRiskSectors.size || (criticalDrainsCount > 0 ? criticalDrainsCount : 0);
  const rainForecastHours = weather?.rainForecastHours || 18;

  // Recent 5 live reports directly from database
  const recentIncidents = (incidents || []).slice(0, 5);

  // Active or top field teams directly from database
  const activeTeams = (fieldTeams || []).slice(0, 4);

  // Dynamic time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col w-full">
      <div className="px-4 sm:px-8 py-4 sm:py-6 w-full max-w-[1440px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Welcome Header & Operational Command Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none bg-surface-container-lowest p-5 sm:p-6 rounded-3xl border border-outline-variant/60 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-[11px] font-bold tracking-wide uppercase mb-2 border border-[#bbf7d0]">
              <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
              <span>{selectedMunicipality?.name || 'Winneba Municipal Assembly'}</span>
            </div>
            <h1 className="font-headline-lg text-on-surface font-bold text-[24px] sm:text-[30px] tracking-tight">
              {greeting}, Municipal Officer
            </h1>
            <p className="font-body-md text-on-surface-variant text-[13.5px] sm:text-[14.5px] mt-0.5">
              Live environmental telemetry, drainage network health, and active incident response operations.
            </p>
          </div>

          {/* Quick Operational Command Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Refresh Live Telemetry */}
            {onRefreshData && (
              <button
                type="button"
                onClick={onRefreshData}
                title="Fetch fresh records from database"
                className="bg-surface-container hover:bg-surface-container-high text-on-surface p-2.5 rounded-xl border border-outline-variant transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5 text-[12px] font-bold"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">sync</span>
                <span className="hidden sm:inline">Refresh Data</span>
              </button>
            )}

            {/* Incidents Queue */}
            <button
              type="button"
              onClick={() => onNavigateView && onNavigateView('incidents')}
              className="bg-surface-container-low hover:bg-surface-container border border-outline-variant hover:border-primary/40 text-on-surface px-3.5 py-2.5 rounded-xl font-label-caps text-[12px] font-bold shadow-2xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">assignment</span>
              <span>Incident Queue</span>
              {incidents.length > 0 && (
                <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-data-mono">
                  {incidents.length}
                </span>
              )}
            </button>

            {/* Dispatch Field Team */}
            <button
              type="button"
              onClick={() => onNavigateView && onNavigateView('dispatch')}
              className="bg-primary hover:bg-surface-tint text-on-primary px-4 py-2.5 rounded-xl font-label-caps text-[12px] font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Dispatch</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Row */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-title-md font-bold text-on-surface text-[17px] flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">monitoring</span>
              <span>Municipal Performance Indicators</span>
            </h3>
            <span className="text-[11px] font-data-mono text-outline font-semibold uppercase">
              Live Database Sync
            </span>
          </div>
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

        {/* Live GIS Telemetry & Risk Section (12-col Grid) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
          {/* Left: Interactive Telemetry Map (8 cols) */}
          <LiveTelemetryMap
            drainageSegments={drainageSegments}
            incidents={incidents}
            focusedLocation={focusedLocation}
            onSelectSegment={onSelectSegment}
            onSelectIncident={onSelectIncident}
            selectedSegmentId={selectedSegmentId}
            onOpenDispatch={onOpenDispatch || onDispatchAction}
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

        {/* Live Database Activity & Field Dispatch Stream (12-col Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left: Recent Incoming Incidents & Reports (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-5 sm:p-6 rounded-3xl border border-outline-variant/60 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">dynamic_feed</span>
                  <h3 className="font-title-md font-bold text-on-surface text-[16px]">
                    Recent Incidents &amp; Citizen Reports
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateView && onNavigateView('incidents')}
                  className="text-primary hover:text-primary/80 font-bold text-[12px] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>View All ({incidents.length})</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              {recentIncidents.length > 0 ? (
                <div className="divide-y divide-outline-variant/40">
                  {recentIncidents.map((item) => {
                    const isCritical = item.severity === 'critical';
                    const isHigh = item.severity === 'high';
                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectIncident && onSelectIncident(item)}
                        className="py-3.5 flex items-center justify-between gap-3 hover:bg-surface-container-low/50 px-2 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-11 h-11 rounded-xl object-cover border border-outline-variant shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[20px]">report_problem</span>
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-[13.5px] text-on-surface truncate group-hover:text-primary transition-colors">
                                {item.title}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                                  isCritical
                                    ? 'bg-error-container text-on-error-container'
                                    : isHigh
                                    ? 'bg-[#ffedd5] text-risk-high'
                                    : 'bg-primary-container text-on-primary-container'
                                }`}
                              >
                                {item.severity || 'Moderate'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11.5px] text-outline mt-0.5 truncate">
                              <span className="font-data-mono">{item.id}</span>
                              <span>•</span>
                              <span>{item.sector || 'Winneba Catchment'}</span>
                              <span>•</span>
                              <span>{item.reportedAt || 'Recent'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {onLocateOnMap && (
                            <button
                              type="button"
                              onClick={() => onLocateOnMap(item)}
                              title="See exact incident location on GIS map"
                              className="px-2.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 border border-primary/20"
                            >
                              <span className="material-symbols-outlined text-[15px]">explore</span>
                              <span>See Map</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectIncident && onSelectIncident(item)}
                            className="bg-surface-container hover:bg-surface-container-high text-on-surface px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-outline text-[13px]">
                  No recent incidents recorded in database.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-outline-variant/40 mt-2 flex items-center justify-between text-[12px] text-outline">
              <span>Synchronized with Supabase <code>reports</code> &amp; <code>incidents</code></span>
              <span className="font-data-mono text-primary font-bold">● Active Feed</span>
            </div>
          </div>

          {/* Right: Active Field Response Units (5 cols) */}
          <div className="lg:col-span-5 bg-surface-container-lowest p-5 sm:p-6 rounded-3xl border border-outline-variant/60 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
                  <h3 className="font-title-md font-bold text-on-surface text-[16px]">
                    Field Response Units
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateView && onNavigateView('field-teams')}
                  className="text-primary hover:text-primary/80 font-bold text-[12px] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>Teams ({fieldTeams.length})</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              {activeTeams.length > 0 ? (
                <div className="space-y-3">
                  {activeTeams.map((team) => {
                    const isOnMission = team.status === 'On Mission' || team.status === 'Busy';
                    return (
                      <div
                        key={team.id}
                        className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/50 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-[13px] shrink-0">
                            {team.name ? team.name.charAt(0) : 'T'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[13px] text-on-surface truncate">
                              {team.name}
                            </div>
                            <div className="text-[11px] text-on-surface-variant truncate">
                              Lead: {team.lead} • {team.vehicle || 'Truck'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                              isOnMission
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOnMission ? 'bg-blue-600' : 'bg-emerald-600'
                              }`}
                            ></span>
                            {team.status || 'Available'}
                          </span>

                          <button
                            type="button"
                            onClick={() => onDispatchAction && onDispatchAction({ teamId: team.id, teamName: team.name })}
                            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary cursor-pointer"
                            title="Dispatch this crew"
                          >
                            <span className="material-symbols-outlined text-[16px]">send</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-outline text-[13px]">
                  No field teams provisioned in database.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-outline-variant/40 mt-3 flex items-center justify-between text-[12px]">
              <span className="text-outline">Ready for emergency desilting &amp; breach clearance</span>
              <button
                type="button"
                onClick={() => onNavigateView && onNavigateView('dispatch')}
                className="text-primary font-bold hover:underline cursor-pointer text-[12px]"
              >
                Open Dispatch Board →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
