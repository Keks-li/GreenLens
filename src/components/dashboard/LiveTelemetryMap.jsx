import React from 'react';
import OpenStreetMapViewer from '../map/OpenStreetMapViewer';

export default function LiveTelemetryMap({
  drainageSegments,
  onSelectSegment,
  selectedSegmentId
}) {
  return (
    <div className="xl:col-span-8 flex flex-col h-full min-h-[620px] bg-surface-container-lowest rounded-2xl shadow-xs overflow-hidden relative border border-outline-variant/60">
      <OpenStreetMapViewer
        drainageSegments={drainageSegments}
        selectedSegmentId={selectedSegmentId}
        onSelectSegment={onSelectSegment}
        className="w-full h-full min-h-[620px]"
        viewMode="telemetry"
      />
    </div>
  );
}
