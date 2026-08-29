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
  priorityActions,
  selectedMunicipality,
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

  return (
    <div className="flex flex-col w-full">
      <div className="px-4 sm:px-8 py-4 sm:py-6 w-full max-w-[1440px] mx-auto">
        {/* Welcome Header */}
        <div className="mb-8 select-none">
          <h1 className="font-headline-lg text-on-surface mb-2">
            Good morning, Municipal Officer.
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl">
            Here is the current environmental and infrastructure situation across{' '}
            <span className="font-semibold text-on-surface">
              {selectedMunicipality?.name || 'Winneba Municipal Assembly'}
            </span>
            .
          </p>
        </div>

        {/* Executive KPI Row */}
        <KPIGrid
          kpis={kpis}
          onCardClick={(type) => {
            console.log('KPI Card clicked:', type);
          }}
        />

        {/* Live Risk Section & AI Recommendations (12-col Grid) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
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
