import React, { useState } from 'react';

export default function LiveTelemetryMap({
  drainageSegments,
  onSelectSegment,
  selectedSegmentId
}) {
  const [activeLayer, setActiveLayer] = useState('all'); // all, critical, flood, normal
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapMode, setMapMode] = useState('satellite'); // satellite, vector, thermal
  const [hoveredNode, setHoveredNode] = useState(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => setZoomLevel(1);

  const filteredSegments = (drainageSegments || []).filter((seg) => {
    if (activeLayer === 'critical') return seg.riskLevel === 'critical' || seg.riskLevel === 'high';
    if (activeLayer === 'healthy') return seg.riskLevel === 'healthy';
    return true;
  });

  const getRiskBadgeColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-risk-critical text-white';
      case 'high': return 'bg-risk-high text-white';
      case 'moderate': return 'bg-risk-moderate text-white';
      default: return 'bg-risk-healthy text-white';
    }
  };

  const getMarkerRingColor = (level) => {
    switch (level) {
      case 'critical': return 'border-risk-critical ring-risk-critical/40 bg-risk-critical';
      case 'high': return 'border-risk-high ring-risk-high/40 bg-risk-high';
      case 'moderate': return 'border-amber-500 ring-amber-500/40 bg-amber-500';
      default: return 'border-primary ring-primary/40 bg-primary';
    }
  };

  return (
    <div className="xl:col-span-8 flex flex-col h-full min-h-[620px] bg-surface-container-lowest rounded-2xl shadow-xs overflow-hidden relative border border-outline-variant/60">
      {/* Top Telemetry Header Bar */}
      <div className="absolute top-4 left-4 z-20 bg-surface-container-lowest/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-md border border-outline-variant/80 flex items-center gap-4 select-none">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-outline-subtle text-[10px] tracking-wider uppercase">
              LIVE TELEMETRY
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          </div>
          <span className="font-title-md text-on-surface text-[17px] font-bold">
            Drainage Network Status
          </span>
        </div>

        <div className="h-8 w-px bg-outline-variant"></div>

        {/* Layer & Filter Buttons */}
        <div className="flex gap-2 relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            title="Toggle GIS Layers"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              showLayerMenu
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">layers</span>
          </button>

          {showLayerMenu && (
            <div className="absolute top-10 left-0 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant p-3 w-56 z-30 animate-in fade-in slide-in-from-top-1 text-body-sm">
              <div className="font-bold text-[12px] uppercase text-outline mb-2">GIS Overlay Layers</div>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All Drainage Nodes', icon: 'hub' },
                  { id: 'critical', label: 'Critical & High Risk Only', icon: 'warning' },
                  { id: 'healthy', label: 'Healthy Flow Segments', icon: 'check_circle' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setActiveLayer(l.id);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[13px] ${
                      activeLayer === l.id
                        ? 'bg-primary-container text-on-primary-container font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{l.icon}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-outline-variant/60 my-2 pt-2">
                <div className="font-bold text-[11px] uppercase text-outline mb-1.5">Map Render Mode</div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setMapMode('satellite')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold ${
                      mapMode === 'satellite' ? 'bg-primary text-white' : 'bg-surface-container'
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => setMapMode('vector')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold ${
                      mapMode === 'vector' ? 'bg-primary text-white' : 'bg-surface-container'
                    }`}
                  >
                    GIS Vector
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setActiveLayer(activeLayer === 'critical' ? 'all' : 'critical')}
            title="Filter High Risk"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              activeLayer === 'critical'
                ? 'bg-risk-critical text-white'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
          </button>
        </div>
      </div>

      {/* Map Canvas with Satellite image and Vector GIS Overlays */}
      <div className="relative w-full h-full min-h-[620px] overflow-hidden select-none bg-surface-dim">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-300 ease-out origin-center"
          style={{
            transform: `scale(${zoomLevel})`,
            backgroundImage:
              mapMode === 'satellite'
                ? `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlMvKcDFINtmI0OSEES1xmfAGaL9-VepkWY5HWmsSO1tzrFKaRzJOOimoUsydgqEJRM5A_lR_cz05vHwhgenP-4NNA19XdqcE4kelRWGo2SW99hq1LkW4B54p4N6X3WkVPWF9bok96PZ1oSX7jQkZi6nPR9VJdcK7cJ8lBFDAlUWMNY1R-cSwZ8zoXmCISzx31iHZOAFNqtra3ucpSEH5mAf0mMDdSWdcMjYIp5Q4CAfzotOq0SdrNNA')`
                : `radial-gradient(circle at center, #263328 0%, #151d16 100%)`,
          }}
        >
          {/* SVG Vector Overlay for Drainage Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-85">
            {/* Flood simulation polygon zone */}
            <path
              d="M 28% 22% Q 38% 44% 55% 65% T 72% 78%"
              fill="none"
              stroke="rgba(32, 109, 31, 0.4)"
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray="6 6"
              className="animate-pulse"
            />
            {/* Primary Main Drainage Spine */}
            <path
              d="M 28% 22% L 38% 44% L 55% 65% L 72% 78%"
              fill="none"
              stroke="#8ad97d"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Secondary Lateral Canal */}
            <path
              d="M 22% 58% L 38% 44% L 62% 32%"
              fill="none"
              stroke="#a5d0b9"
              strokeWidth="3"
              strokeDasharray="4 4"
            />
          </svg>

          {/* Interactive GIS Markers */}
          {filteredSegments.map((segment) => {
            const isSelected = selectedSegmentId === segment.id;
            const isCritical = segment.riskLevel === 'critical';
            const isHigh = segment.riskLevel === 'high';

            return (
              <div
                key={segment.id}
                style={{
                  left: `${segment.coordinates?.x || 50}%`,
                  top: `${segment.coordinates?.y || 50}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                onClick={() => onSelectSegment && onSelectSegment(segment)}
                onMouseEnter={() => setHoveredNode(segment)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Pulsing Alert Rings for Critical Nodes */}
                {(isCritical || isHigh) && (
                  <div
                    className={`absolute -inset-3 rounded-full animate-ping opacity-60 ${
                      isCritical ? 'bg-risk-critical' : 'bg-risk-high'
                    }`}
                  ></div>
                )}

                {/* Marker Node Pin */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border-2 ${getMarkerRingColor(
                    segment.riskLevel
                  )} ${isSelected ? 'scale-125 ring-4 ring-white' : 'hover:scale-115'}`}
                >
                  <span className="material-symbols-outlined text-white text-[18px]">
                    {segment.riskLevel === 'critical'
                      ? 'warning'
                      : segment.riskLevel === 'high'
                      ? 'priority_high'
                      : 'waves'}
                  </span>
                </div>

                {/* Node Label Tag */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-surface-container-lowest/95 backdrop-blur-md px-2.5 py-1 rounded-md shadow-md border border-outline-variant whitespace-nowrap pointer-events-none group-hover:scale-105 transition-transform flex items-center gap-1.5">
                  <span className="font-bold text-[11px] text-on-surface">{segment.id}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${getRiskBadgeColor(
                      segment.riskLevel
                    )}`}
                  >
                    {segment.blockagePercent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover / Node Telemetry Quick Card Preview */}
        {hoveredNode && (
          <div className="absolute bottom-6 left-6 z-20 bg-surface-container-lowest/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-outline-variant max-w-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="font-bold text-on-surface text-[15px]">{hoveredNode.name}</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${getRiskBadgeColor(
                  hoveredNode.riskLevel
                )}`}
              >
                RISK {hoveredNode.riskScore}/100
              </span>
            </div>
            <div className="text-[12px] text-on-surface-variant mb-2">{hoveredNode.sector}</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-surface-container-low p-2 rounded-lg mb-2">
              <div>
                <span className="text-outline">Blockage: </span>
                <span className="font-bold text-on-surface">{hoveredNode.blockagePercent}%</span>
              </div>
              <div>
                <span className="text-outline">Capacity: </span>
                <span className="font-bold text-on-surface">{hoveredNode.capacity}</span>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant line-clamp-2">{hoveredNode.thermalScanStatus}</p>
            <div className="text-[10px] text-primary font-bold mt-2">Click node to inspect full telemetry & what-if analysis</div>
          </div>
        )}

        {/* Map Floating Controls Bottom Right */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 select-none">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/60"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/60"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
          <button
            onClick={handleReset}
            title="Recenter Winneba Network"
            className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary mt-2 transition-colors border border-outline-variant/60"
          >
            <span className="material-symbols-outlined text-[20px]">my_location</span>
          </button>
        </div>
      </div>
    </div>
  );
}
