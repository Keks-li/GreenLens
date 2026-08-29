import React from 'react';
import KPIGrid from '../dashboard/KPIGrid';
import LiveTelemetryMap from '../dashboard/LiveTelemetryMap';
import RiskSummary from '../dashboard/RiskSummary';
import AIPriorityList from '../dashboard/AIPriorityList';

export default function DashboardView({
  kpis,
  drainageSegments,
  incidents = [],
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
  return (
    <div className="flex flex-col w-full">
      <div className="px-8 py-6 w-full max-w-[1440px] mx-auto">
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
              criticalDrainsCount={12}
              highRiskCommunitiesCount={4}
              rainForecastHours={18}
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
