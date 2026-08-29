import React, { useState } from 'react';
import OpenStreetMapViewer from '../map/OpenStreetMapViewer';

export default function DigitalTwinView({
  drainageSegments = [],
  onSelectSegment,
  onOpenDispatch
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState('D-102');

  const nodesData = (drainageSegments || []).reduce((acc, seg) => {
    const isCrit = seg.riskLevel === 'critical' || seg.riskScore >= 80;
    const isHigh = seg.riskLevel === 'high' || (seg.riskScore >= 60 && seg.riskScore < 80);
    const capacityNum = Math.round((seg.capacityM3S || 10) * 100);
    const flowPercent = Math.max(10, 100 - (seg.blockagePercent || 0));

    acc[seg.id] = {
      id: seg.id,
      name: seg.name || `Drain ${seg.id}`,
      location: `${seg.sector || 'Catchment Area'}, Ward ${seg.id.replace(/\D/g, '') || '1'}`,
      sector: seg.sector || 'Catchment Area',
      status: seg.status || (isCrit ? 'Critical' : isHigh ? 'High Risk' : 'Healthy'),
      riskLevel: seg.riskLevel || (isCrit ? 'critical' : isHigh ? 'high' : 'healthy'),
      blockagePercent: Number(seg.blockagePercent ?? 0),
      riskScore: Number(seg.riskScore ?? 50),
      flowCapacityText: `${flowPercent}% / ${capacityNum}L/s`,
      flowDropNote: seg.thermalScanStatus || (isCrit ? 'Sudden drop detected — debris accumulation' : 'Normal operational flow'),
      aiInsight: seg.aiDirective || (isCrit ? 'Severe solid waste buildup detected at choke point. High probability of overflow during next rain event.' : 'Hydraulic capacity nominal. Continuous telemetry active.'),
      recommendedAction: seg.aiDirective || (isCrit ? 'Dispatch rapid response clearance crew with high-volume jetter.' : 'Routine monitoring.'),
      imageUrl: seg.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=600&q=80',
      telemetryLogs: [
        { time: '14:02:11', id: `SNR-VL-${seg.id.replace(/\D/g, '') || '01'}`, status: 'OK', type: 'ok' },
        { time: '14:02:15', id: `SNR-DP-${seg.id.replace(/\D/g, '') || '02'}`, status: isCrit ? 'WARN_SILT' : 'CLEAR', type: isCrit ? 'warning' : 'ok' },
        { time: '14:02:18', id: `CAM-AI-${seg.id.replace(/\D/g, '') || '03'}`, status: isCrit ? 'BLOCK_DETECT' : 'FLOW_OK', type: isCrit ? 'critical' : 'ok' },
        { time: '14:02:22', id: `WTR-LV-${seg.id.replace(/\D/g, '') || '04'}`, status: isCrit ? '+14cm/hr' : 'STABLE', type: isCrit ? 'high' : 'ok' },
        { time: '14:02:25', id: `SNR-VL-${seg.id.replace(/\D/g, '') || '01'}`, status: 'OK', type: 'ok' },
      ],
      coords: {
        lat: seg.coordinates?.lat || 5.3556,
        lng: seg.coordinates?.lng || -0.6247
      }
    };
    return acc;
  }, {});

  const firstNodeId = drainageSegments[0]?.id || 'D-102';
  const currentNode = nodesData[selectedNodeId] || nodesData[firstNodeId] || {
    id: 'D-102',
    name: 'Drain D-102',
    location: 'Winneba Catchment',
    sector: 'Central Sector',
    status: 'Healthy',
    riskLevel: 'healthy',
    blockagePercent: 0,
    riskScore: 0,
    flowCapacityText: '100% / 1000L/s',
    flowDropNote: 'Telemetry Active',
    aiInsight: 'Monitoring active.',
    recommendedAction: 'Routine monitoring.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=600&q=80',
    telemetryLogs: [],
    coords: { lat: 5.3556, lng: -0.6247 }
  };

  const handleSelectNode = (segment) => {
    const id = segment?.id || segment;
    setSelectedNodeId(id);
    setIsPanelOpen(true);
    if (onSelectSegment) {
      const match = drainageSegments.find((d) => d.id === id);
      onSelectSegment(match || { id, name: id });
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)] overflow-hidden relative font-body-lg text-on-surface bg-background select-none">
      {/* Real OpenStreetMap GIS Canvas centered at Winneba (5.34352, -0.62566) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <OpenStreetMapViewer
          drainageSegments={drainageSegments}
          selectedSegmentId={selectedNodeId}
          onSelectSegment={handleSelectNode}
          className="w-full h-full"
          viewMode="digital-twin"
        />
      </div>

      {/* Toggle Button to reopen side panel if closed */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 bg-surface/95 backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg border border-outline-variant/60 flex items-center gap-2 text-primary font-bold text-[12px] sm:text-[13px] hover:bg-surface-container transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">dock_to_left</span>
          Open Telemetry ({currentNode.id})
        </button>
      )}

      {/* Active Side Panel (Right) */}
      <div
        className={`absolute top-3 sm:top-6 right-3 sm:right-6 bottom-3 sm:bottom-6 w-[calc(100vw-24px)] sm:w-[400px] max-w-[400px] bg-surface/95 backdrop-blur-xl shadow-2xl rounded-2xl flex flex-col overflow-hidden z-30 transform transition-transform duration-300 border border-outline-variant/60 ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-[120%] pointer-events-none'
        }`}
      >
        {/* Panel Header */}
        <div
          className={`p-5 flex flex-col gap-2 relative overflow-hidden ${
            currentNode.riskLevel === 'critical'
              ? 'bg-error-container text-on-error-container'
              : currentNode.riskLevel === 'high'
              ? 'bg-amber-100 text-amber-900'
              : 'bg-primary-container text-on-primary-container'
          }`}
        >
          <div
            className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
              currentNode.riskLevel === 'critical' ? 'bg-risk-critical/15' : 'bg-primary/15'
            }`}
          ></div>
          <div className="flex items-start justify-between relative z-10">
            <div className="flex flex-col">
              <span className="font-label-caps opacity-80 uppercase tracking-widest text-[10px] mb-1 font-bold">
                Infrastructure Node
              </span>
              <h2 className="font-title-lg text-[22px] font-bold m-0 leading-tight">
                {currentNode.name}
              </h2>
              <span className="font-body-sm opacity-85 mt-1 flex items-center gap-1 text-[12px]">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {currentNode.location}
              </span>
            </div>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="w-8 h-8 rounded-full bg-surface-container-lowest/50 hover:bg-surface-container-lowest/80 flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div
            className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full self-start shadow-xs text-[11px] font-bold uppercase tracking-wider ${
              currentNode.riskLevel === 'critical'
                ? 'bg-risk-critical text-white'
                : currentNode.riskLevel === 'high'
                ? 'bg-risk-high text-white'
                : 'bg-primary text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px] animate-pulse">
              {currentNode.riskLevel === 'critical' ? 'warning' : 'check_circle'}
            </span>
            <span>Status: {currentNode.status}</span>
          </div>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Clear Asset Photo Preview with Transparent Glass HUD */}
          {currentNode.id && (
            <div className="relative rounded-2xl overflow-hidden h-36 border border-outline-variant/60 bg-surface-container shrink-0">
              <img
                src={currentNode.imageUrl}
                alt={currentNode.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
              <div className="absolute top-2.5 left-2.5 bg-black/65 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold flex items-center gap-1 border border-white/20">
                <span className="material-symbols-outlined text-primary text-[12px]">videocam</span>
                Live AI Camera Stream
              </div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/75 backdrop-blur-md px-3 py-1 rounded-xl text-white text-[11px] flex justify-between items-center border border-white/15">
                <span className="font-semibold">{currentNode.sector}</span>
                <span className="text-primary-fixed font-bold font-data-mono">{currentNode.riskScore}/100 Risk</span>
              </div>
            </div>
          )}

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-1 border border-outline-variant/40">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-outline uppercase text-[10px]">Blockage</span>
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    currentNode.riskLevel === 'critical' ? 'text-risk-critical' : 'text-primary'
                  }`}
                >
                  waves
                </span>
              </div>
              <div className="flex items-end gap-1">
                <span
                  className={`font-display-lg text-[28px] font-bold leading-none ${
                    currentNode.riskLevel === 'critical' ? 'text-risk-critical' : 'text-primary'
                  }`}
                >
                  {currentNode.blockagePercent}
                </span>
                <span className="font-title-md text-outline pb-0.5 text-[15px] font-semibold">%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full ${
                    currentNode.riskLevel === 'critical' ? 'bg-risk-critical' : 'bg-primary'
                  }`}
                  style={{ width: `${currentNode.blockagePercent}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-1 border border-outline-variant/40">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-outline uppercase text-[10px]">Flood Risk</span>
                <span className="material-symbols-outlined text-risk-high text-[16px]">tsunami</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="font-display-lg text-risk-high text-[28px] font-bold leading-none">
                  {currentNode.riskScore}
                </span>
                <span className="font-title-md text-outline pb-0.5 text-[15px]">/100</span>
              </div>
              <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-risk-high"
                  style={{ width: `${currentNode.riskScore}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-1.5 col-span-2 border border-outline-variant/40">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-outline uppercase text-[10px]">Flow Capacity</span>
                <span className="font-data-mono text-on-surface text-[12px] font-bold">
                  {currentNode.flowCapacityText}
                </span>
              </div>
              {/* Micro sparkline (SVG) */}
              <svg className="w-full h-10 mt-1" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path
                  d="M0,25 C10,20 20,28 30,15 C40,5 50,18 60,20 C70,22 80,10 90,25 L100,28"
                  fill="none"
                  stroke="#707a6b"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                <circle cx="30" cy="15" fill="#BA1A1A" r="3" />
                <line
                  stroke="#BA1A1A"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                  x1="30"
                  x2="30"
                  y1="15"
                  y2="30"
                />
              </svg>
              <span className="font-body-sm text-on-surface-variant text-[11px] text-center italic">
                {currentNode.flowDropNote}
              </span>
            </div>
          </div>

          {/* AI Recommendation Module */}
          <div className="relative p-4 bg-primary/5 rounded-xl border border-primary/20 overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
              <span className="material-symbols-outlined text-[42px] text-primary fill">
                psychology
              </span>
            </div>
            <div className="relative z-10 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px] animate-pulse">
                  auto_awesome
                </span>
                <span className="font-label-caps text-primary uppercase tracking-wider text-[11px] font-bold">
                  AI Insight Engine
                </span>
              </div>
              <p className="font-body-md text-on-surface leading-relaxed text-[13px]">
                {currentNode.aiInsight}
              </p>
              <div className="bg-surface rounded-lg p-3 border border-outline-variant/30 flex items-start gap-2.5 mt-1 shadow-2xs">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                  assignment_turned_in
                </span>
                <div>
                  <span className="font-title-md text-on-surface block mb-0.5 text-[12px] font-bold">
                    Recommended Action
                  </span>
                  <span className="font-body-sm text-on-surface-variant text-[11px] leading-snug">
                    {currentNode.recommendedAction}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Data Feed */}
          <div className="flex flex-col gap-1.5">
            <span className="font-label-caps text-outline uppercase tracking-wider pl-1 text-[10px] font-bold">
              Live Sensor Telemetry
            </span>
            <div className="bg-inverse-surface rounded-xl p-3 font-data-mono text-[11px] text-inverse-on-surface leading-relaxed max-h-[110px] overflow-y-auto space-y-1">
              {currentNode.telemetryLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="flex justify-between border-b border-outline/20 pb-1 last:border-0"
                >
                  <span className="text-white/80">
                    [{log.time}] {log.id}
                  </span>
                  <span
                    className={`font-bold ${
                      log.type === 'critical'
                        ? 'text-risk-critical'
                        : log.type === 'high'
                        ? 'text-risk-high'
                        : log.type === 'warning'
                        ? 'text-amber-400'
                        : 'text-inverse-primary'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Footer (Actions) */}
        <div className="p-4 bg-surface border-t border-outline-variant/50 flex flex-col gap-2.5 z-20">
          <button
            onClick={() => onOpenDispatch && onOpenDispatch(currentNode)}
            className="w-full bg-primary hover:bg-surface-tint text-on-primary font-title-md text-[14px] py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            Dispatch Emergency Team
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => alert(`Maintenance for ${currentNode.id} scheduled for 18:00.`)}
              className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-title-md text-[12px] py-2 rounded-xl border border-outline-variant/50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">calendar_clock</span>
              Schedule
            </button>
            <button
              onClick={() => alert(`Historical inspection logs for ${currentNode.id} retrieved.`)}
              className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-title-md text-[12px] py-2 rounded-xl border border-outline-variant/50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
