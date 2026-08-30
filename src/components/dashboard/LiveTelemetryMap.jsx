import React from 'react';
import OpenStreetMapViewer from '../map/OpenStreetMapViewer';

export default function LiveTelemetryMap({
  drainageSegments,
  incidents = [],
  focusedLocation = null,
  onSelectSegment,
  onSelectIncident,
  selectedSegmentId,
  onOpenDispatch
}) {
  return (
    <div id="live-telemetry-map" className="xl:col-span-8 flex flex-col h-full min-h-[420px] md:min-h-[520px] xl:min-h-[620px] bg-surface-container-lowest rounded-2xl shadow-xs overflow-hidden relative border border-outline-variant/60">
      <OpenStreetMapViewer
        drainageSegments={drainageSegments}
        incidents={incidents}
        focusedLocation={focusedLocation}
        selectedSegmentId={selectedSegmentId}
        onSelectSegment={onSelectSegment}
        onSelectIncident={onSelectIncident}
        onOpenDispatch={onOpenDispatch}
        className="w-full h-full min-h-[420px] md:min-h-[520px] xl:min-h-[620px]"
        viewMode="telemetry"
      />
    </div>
  );
}
