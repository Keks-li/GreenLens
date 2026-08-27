import React, { useState } from 'react';

export default function DigitalTwinView({
  drainageSegments = [],
  onSelectSegment,
  onOpenDispatch
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [layerOpacity, setLayerOpacity] = useState(85); // Transparent GIS layer control
  
  // Default selected node is Drain D-102
  const [selectedNodeId, setSelectedNodeId] = useState('D-102');

  const nodesData = {
    'D-102': {
      id: 'D-102',
      name: 'Drain D-102',
      location: 'Liberation Road Intersect, Ward 4',
      sector: 'Central Market Sector',
      status: 'Critical',
      riskLevel: 'critical',
      blockagePercent: 82,
      riskScore: 91,
      flowCapacityText: '68% / 1200L/s',
      flowDropNote: 'Sudden drop detected 45 mins ago',
      aiInsight: 'Severe solid waste buildup detected at choke point. Probability of localized flooding during next rain event is 94%.',
      recommendedAction: 'Dispatch rapid response cleanup team with heavy lifting equipment within 6 hours.',
      telemetryLogs: [
        { time: '14:02:11', id: 'SNR-VL-89', status: 'OK', type: 'ok' },
        { time: '14:02:15', id: 'SNR-DP-12', status: 'WARN_SILT', type: 'warning' },
        { time: '14:02:18', id: 'CAM-AI-04', status: 'BLOCK_DETECT', type: 'critical' },
        { time: '14:02:22', id: 'WTR-LV-01', status: '+14cm/hr', type: 'high' },
        { time: '14:02:25', id: 'SNR-VL-89', status: 'OK', type: 'ok' },
      ],
      coords: { x: 450, y: 350 }
    },
    'D-117': {
      id: 'D-117',
      name: 'Drain D-117',
      location: 'Methodist School Bypass, Ward 2',
      sector: 'South Residential',
      status: 'High Risk',
      riskLevel: 'high',
      blockagePercent: 68,
      riskScore: 87,
      flowCapacityText: '74% / 950L/s',
      flowDropNote: 'Structural wall deformation detected',
      aiInsight: 'Wall collapse constricting main conduit. High vulnerability during next rainfall.',
      recommendedAction: 'Deploy excavator and masonry crew within 8 hours.',
      telemetryLogs: [
        { time: '14:01:40', id: 'SNR-ST-04', status: 'STRUCT_DEF', type: 'high' },
        { time: '14:01:55', id: 'SNR-DP-08', status: 'FLOW_WARN', type: 'warning' },
        { time: '14:02:05', id: 'CAM-AI-09', status: 'RUBBLE_DET', type: 'high' },
      ],
      coords: { x: 600, y: 650 }
    },
    'D-104': {
      id: 'D-104',
      name: 'Drain D-104',
      location: 'University Link Highway, North Ward',
      sector: 'North Campus Zone',
      status: 'Critical',
      riskLevel: 'critical',
      blockagePercent: 85,
      riskScore: 95,
      flowCapacityText: '52% / 1800L/s',
      flowDropNote: 'Upstream Retention Backflow Active',
      aiInsight: 'Critical bottleneck choking arterial drainage. Immediate flooding hazard.',
      recommendedAction: 'Emergency Strike Unit high-volume pumping intervention.',
      telemetryLogs: [
        { time: '14:03:01', id: 'SNR-LV-10', status: 'CRIT_SURGE', type: 'critical' },
        { time: '14:03:10', id: 'CAM-AI-11', status: 'BACKFLOW', type: 'critical' },
      ],
      coords: { x: 400, y: 600 }
    },
    'D-201': {
      id: 'D-201',
      name: 'Drain D-201',
      location: 'Lowtown Main Avenue Conduit',
      sector: 'Lowtown Community',
      status: 'Healthy',
      riskLevel: 'healthy',
      blockagePercent: 22,
      riskScore: 28,
      flowCapacityText: '96% / 1100L/s',
      flowDropNote: 'Optimal operational flow',
      aiInsight: 'Hydraulic capacity optimal. Post-cleaning inspection completed.',
      recommendedAction: 'Routine monitoring only.',
      telemetryLogs: [
        { time: '14:00:20', id: 'SNR-VL-19', status: 'OK', type: 'ok' },
        { time: '14:01:00', id: 'SNR-DP-02', status: 'CLEAR', type: 'ok' },
      ],
      coords: { x: 700, y: 500 }
    }
  };

  const currentNode = nodesData[selectedNodeId] || nodesData['D-102'];

  const handleSelectNode = (nodeId) => {
    setSelectedNodeId(nodeId);
    setIsPanelOpen(true);
    if (onSelectSegment) {
      const match = drainageSegments.find((d) => d.id === nodeId);
      onSelectSegment(match || { id: nodeId, name: nodeId });
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)] overflow-hidden relative font-body-lg text-on-surface bg-background select-none">
      {/* Map Container (Simulated with Satellite Telemetry Background & Vector Overlays) */}
      <div className="absolute inset-0 w-full h-full bg-surface-dim z-0 overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center opacity-85 transition-transform duration-300 ease-out origin-center"
          data-location="Winneba, Ghana, Drainage Network"
          style={{
            transform: `scale(${zoomLevel})`,
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlMvKcDFINtmI0OSEES1xmfAGaL9-VepkWY5HWmsSO1tzrFKaRzJOOimoUsydgqEJRM5A_lR_cz05vHwhgenP-4NNA19XdqcE4kelRWGo2SW99hq1LkW4B54p4N6X3WkVPWF9bok96PZ1oSX7jQkZi6nPR9VJdcK7cJ8lBFDAlUWMNY1R-cSwZ8zoXmCISzx31iHZOAFNqtra3ucpSEH5mAf0mMDdSWdcMjYIp5Q4CAfzotOq0SdrNNA')`,
          }}
        >
          {/* Overlay Scrim for Command Center Aesthetic */}
          <div className="absolute inset-0 bg-inverse-surface/10 pointer-events-none mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/80 via-transparent to-transparent pointer-events-none"></div>

          {/* Simulated Map Data Layers (SVG Overlays with Dynamic Transparency) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10 drop-shadow-md transition-opacity duration-200"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 1000 1000"
            style={{ opacity: layerOpacity / 100 }}
          >
            {/* Healthy Drain Lines */}
            <path
              d="M 100 200 Q 300 150 450 350 T 700 500"
              fill="none"
              opacity="0.6"
              stroke="#7BC96F"
              strokeDasharray="8 4"
              strokeWidth="4"
            />
            <path
              d="M 200 800 L 400 600 L 600 650"
              fill="none"
              opacity="0.8"
              stroke="#7BC96F"
              strokeWidth="6"
            />

            {/* Warning Lines */}
            <path
              d="M 600 650 Q 800 600 900 800"
              fill="none"
              opacity="0.9"
              stroke="#FFB100"
              strokeWidth="5"
            />

            {/* Critical Lines (with pulsating opacity animation) */}
            <path
              d="M 450 350 L 550 450 L 400 600"
              fill="none"
              stroke="#BA1A1A"
              strokeLinecap="round"
              strokeWidth="8"
            >
              <animate
                attributeName="opacity"
                dur="2s"
                repeatCount="indefinite"
                values="1;0.4;1"
              />
            </path>

            {/* Interactive Nodes / Junctions */}
            {/* Node D-102 (Critical) */}
            <g
              className="pointer-events-auto cursor-pointer"
              onClick={() => handleSelectNode('D-102')}
            >
              <circle
                cx="450"
                cy="350"
                fill="#BA1A1A"
                r={selectedNodeId === 'D-102' ? '10' : '8'}
                className="transition-all"
              />
              <circle cx="450" cy="350" fill="none" r="16" stroke="#BA1A1A" strokeWidth="2">
                <animate
                  attributeName="r"
                  dur="2s"
                  repeatCount="indefinite"
                  values="16; 32; 16"
                />
                <animate
                  attributeName="opacity"
                  dur="2s"
                  repeatCount="indefinite"
                  values="1; 0; 1"
                />
              </circle>
            </g>

            {/* Node D-117 (High/Warning) */}
            <g
              className="pointer-events-auto cursor-pointer"
              onClick={() => handleSelectNode('D-117')}
            >
              <circle
                cx="600"
                cy="650"
                fill="#FFB100"
                r={selectedNodeId === 'D-117' ? '9' : '6'}
                stroke="#fff"
                strokeWidth="1.5"
              />
            </g>

            {/* Node D-104 (Critical) */}
            <g
              className="pointer-events-auto cursor-pointer"
              onClick={() => handleSelectNode('D-104')}
            >
              <circle
                cx="400"
                cy="600"
                fill="#BA1A1A"
                r={selectedNodeId === 'D-104' ? '12' : '10'}
                stroke="#fff"
                strokeWidth="2"
              />
            </g>

            {/* Node D-201 (Healthy) */}
            <g
              className="pointer-events-auto cursor-pointer"
              onClick={() => handleSelectNode('D-201')}
            >
              <circle
                cx="700"
                cy="500"
                fill="#7BC96F"
                r={selectedNodeId === 'D-201' ? '8' : '6'}
                stroke="#fff"
                strokeWidth="1.5"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Map Controls (Top Left) with Transparency Slider */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
        <div className="bg-surface/90 backdrop-blur-md rounded-xl shadow-md p-1.5 flex flex-col gap-1 border border-outline-variant/50">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <div className="w-full h-px bg-outline-variant/50 my-0.5"></div>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
        </div>

        <button
          onClick={handleResetZoom}
          className="bg-surface/90 backdrop-blur-md rounded-xl shadow-md w-10 h-10 flex items-center justify-center text-primary hover:bg-primary-container/20 transition-colors border border-outline-variant/50 cursor-pointer"
          title="Recenter Winneba Network"
        >
          <span className="material-symbols-outlined text-[20px] fill">my_location</span>
        </button>

        {/* Dynamic Layer Transparency Pill */}
        <div className="bg-surface/90 backdrop-blur-md rounded-xl shadow-md p-2.5 flex flex-col gap-1 border border-outline-variant/50 w-36">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase font-label-caps text-outline">
            <span>Overlay Opacity</span>
            <span className="font-data-mono text-primary font-bold">{layerOpacity}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={layerOpacity}
            onChange={(e) => setLayerOpacity(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer h-1.5 bg-surface-container-highest rounded-lg"
            title="Adjust GIS Layer Transparency"
          />
        </div>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-20 bg-surface/90 backdrop-blur-md rounded-2xl shadow-lg p-5 flex flex-col gap-3 min-w-[250px] border border-outline-variant/60">
        <div className="flex items-center justify-between">
          <span className="font-title-md text-on-surface text-[15px] font-bold">Network Status</span>
          <span className="material-symbols-outlined text-outline-subtle text-[18px]">info</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-risk-healthy shadow-[0_0_8px_rgba(123,201,111,0.6)]"></div>
            <span className="font-body-md text-on-surface-variant text-[13px]">Healthy (Clear)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(255,177,0,0.6)]"></div>
            <span className="font-body-md text-on-surface-variant text-[13px]">Moderate (Silt buildup)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-risk-high shadow-[0_0_8px_rgba(255,140,0,0.6)]"></div>
            <span className="font-body-md text-on-surface-variant text-[13px]">High Risk (Partial Block)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-risk-critical animate-pulse shadow-[0_0_12px_rgba(186,26,26,0.8)]"></div>
            <span className="font-body-md text-on-surface font-semibold text-[13px]">Critical (Imminent Flood)</span>
          </div>
        </div>
        <div className="mt-1 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
          <span className="font-label-caps text-outline uppercase tracking-wider text-[10px]">Active GIS Layers</span>
          <span className="font-data-mono text-primary font-bold text-[12px]">3/5</span>
        </div>
      </div>

      {/* Toggle Button to reopen side panel if closed */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute top-6 right-6 z-20 bg-surface/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-outline-variant/60 flex items-center gap-2 text-primary font-bold text-[13px] hover:bg-surface-container transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">dock_to_left</span>
          Open Telemetry Panel ({currentNode.id})
        </button>
      )}

      {/* Active Side Panel (Right) */}
      <div
        className={`absolute top-6 right-6 bottom-6 w-[400px] bg-surface/95 backdrop-blur-xl shadow-2xl rounded-2xl flex flex-col overflow-hidden z-30 transform transition-transform duration-300 border border-outline-variant/60 ${
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
                src={
                  currentNode.id === 'D-102'
                    ? 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=600&q=80'
                    : currentNode.id === 'D-117'
                    ? 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80'
                    : currentNode.id === 'D-104'
                    ? 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=600&q=80'
                    : 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80'
                }
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
