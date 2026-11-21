import React, { useState, useEffect } from 'react';

export default function DrainageNetworkView({
  drainageSegments: propSegments = [],
  onOpenDispatch,
  onInspectSegment,
  onUpdateSegment
}) {
  const [segments, setSegments] = useState(propSegments || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [selectedDrainForDefect, setSelectedDrainForDefect] = useState(null);
  const [defectType, setDefectType] = useState('Wall Crack / Collapse');
  const [defectNotes, setDefectNotes] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (propSegments) {
      setSegments(propSegments);
    }
  }, [propSegments]);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredSegments = segments.filter((seg) => {
    const q = searchQuery.trim().toLowerCase();
    if (
      q &&
      !(seg.name || '').toLowerCase().includes(q) &&
      !String(seg.id || '').toLowerCase().includes(q) &&
      !(seg.sector || '').toLowerCase().includes(q)
    ) {
      return false;
    }
    if (filterRisk !== 'all' && seg.riskLevel !== filterRisk) return false;
    if (filterType !== 'all' && !(seg.type || '').toLowerCase().includes(filterType.toLowerCase())) return false;
    return true;
  });

  const totalPeakCapacity = segments.reduce((sum, s) => sum + (Number(s.capacityM3S) || 0), 0);
  const operationalPercent =
    segments.length > 0
      ? Math.round(
          (segments.filter((s) => String(s.status || '').toLowerCase() === 'operational').length / segments.length) *
            100
        )
      : 0;

  const handleLogDefect = async (e) => {
    e.preventDefault();
    if (selectedDrainForDefect && onUpdateSegment) {
      await onUpdateSegment(selectedDrainForDefect.id, {
        status: 'Defect Logged',
        aiDirective: `DEFECT REPORTED: ${defectType}. ${defectNotes}`
      });
    }
    showNotification(`✓ Infrastructure defect logged for ${selectedDrainForDefect?.id} and synced with database.`);
    setShowDefectModal(false);
    setDefectNotes('');
  };

  return (
    <div className="px-4 sm:px-8 py-4 sm:py-6 w-full max-w-[1440px] mx-auto space-y-6 select-none">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-primary text-on-primary px-5 py-3 rounded-xl shadow-xl border border-primary-fixed flex items-center gap-3 animate-in fade-in">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="text-[13px] font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[24px]">waves</span>
            <h1 className="font-headline-lg text-on-surface">Drainage Network &amp; Asset Registry</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Live database registry of municipal hydraulic infrastructure, conduit capacities, and defect tracking.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedDrainForDefect(segments[0]);
            setShowDefectModal(true);
          }}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">build</span>
          Log Infrastructure Defect
        </button>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Total Monitored Segments</span>
          <div className="text-[28px] font-bold text-on-surface mt-1">{segments.length} Channels</div>
          <span className="text-[12px] text-primary font-semibold flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[16px]">sensors</span>
            Live Sensors Connected
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">High / Critical Blockage</span>
          <div className="text-[28px] font-bold text-risk-critical mt-1">
            {segments.filter((s) => s.riskLevel === 'critical' || s.riskLevel === 'high').length} Assets
          </div>
          <span className="text-[12px] text-risk-critical font-semibold flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            Pre-storm clearance needed
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Peak Flow Capacity</span>
          <div className="text-[28px] font-bold text-on-surface mt-1">{totalPeakCapacity.toFixed(1)} m³/s</div>
          <span className="text-[12px] text-secondary font-semibold flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[16px]">water_drop</span>
            Aggregate Network Peak
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Operational Channels</span>
          <div className="text-[28px] font-bold text-on-surface mt-1">{operationalPercent}%</div>
          <span className="text-[12px] text-primary font-semibold flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Drone LIDAR + Thermal
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/60 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by drain name, ID, sector..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-9 pr-4 py-2 text-body-sm focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Risk Level Filter */}
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-body-sm text-on-surface font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">🔴 Critical Risk</option>
            <option value="high">🟠 High Risk</option>
            <option value="moderate">🟡 Moderate Risk</option>
            <option value="healthy">🟢 Healthy</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-body-sm text-on-surface font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Channel Types</option>
            <option value="culvert">Box Culvert</option>
            <option value="canal">Lined Canal</option>
            <option value="swale">Swale / Open Drain</option>
            <option value="outfall">Tidal Outfall</option>
          </select>
        </div>
      </div>

      {/* Segments Table / List */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] uppercase font-label-caps text-outline">
                <th className="py-3 px-4">Asset ID &amp; Name</th>
                <th className="py-3 px-4">Sector / Community</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Hydraulic Capacity</th>
                <th className="py-3 px-4">Blockage</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 text-[13px]">
              {filteredSegments.map((seg) => (
                <tr
                  key={seg.id}
                  onClick={() => onInspectSegment && onInspectSegment(seg)}
                  className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-bold text-on-surface">
                    <div className="flex items-center gap-2">
                      <span className="bg-surface-container-high px-2 py-0.5 rounded font-data-mono text-[11px]">
                        {seg.id}
                      </span>
                      {seg.name}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">{seg.sector}</td>
                  <td className="py-3.5 px-4 text-outline text-[12px]">{seg.type}</td>
                  <td className="py-3.5 px-4 font-data-mono text-[12px]">{seg.capacity}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            seg.blockagePercent >= 80
                              ? 'bg-risk-critical'
                              : seg.blockagePercent >= 60
                              ? 'bg-risk-high'
                              : 'bg-risk-healthy'
                          }`}
                          style={{ width: `${seg.blockagePercent}%` }}
                        ></div>
                      </div>
                      <span className="font-data-mono text-[11px] font-bold">{seg.blockagePercent}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-data-mono ${
                        seg.riskLevel === 'critical'
                          ? 'bg-error-container text-on-error-container'
                          : seg.riskLevel === 'high'
                          ? 'bg-amber-100 text-amber-900'
                          : seg.riskLevel === 'moderate'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {seg.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-surface-container px-2.5 py-1 rounded-full text-[11px] font-semibold text-on-surface">
                      {seg.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onInspectSegment && onInspectSegment(seg)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container"
                        title="View Digital Twin Telemetry"
                      >
                        <span className="material-symbols-outlined text-[18px]">hub</span>
                      </button>
                      <button
                        type="button"
                        disabled={seg.status === 'resolved' || seg.blockagePercentage === 0}
                        onClick={() => {
                          if (seg.status !== 'resolved' && seg.blockagePercentage !== 0) {
                            onOpenDispatch && onOpenDispatch(seg);
                          }
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          seg.status === 'resolved' || seg.blockagePercentage === 0
                            ? 'text-outline cursor-not-allowed opacity-40'
                            : 'text-primary hover:bg-primary/10 cursor-pointer'
                        }`}
                        title={seg.status === 'resolved' || seg.blockagePercentage === 0 ? 'Segment Cleared' : 'Dispatch Crew'}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {seg.status === 'resolved' || seg.blockagePercentage === 0 ? 'check_circle' : 'send'}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Defect Modal */}
      {showDefectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-primary px-6 py-4 text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">build</span>
                <h3 className="font-title-md font-bold text-[17px]">Log Infrastructure Defect</h3>
              </div>
              <button onClick={() => setShowDefectModal(false)} className="p-1 rounded-lg text-white/80 hover:text-white">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleLogDefect} className="p-6 space-y-4 text-body-sm">
              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[13px]">Select Drainage Asset</label>
                <select
                  value={selectedDrainForDefect?.id}
                  onChange={(e) => setSelectedDrainForDefect(segments.find((s) => s.id === e.target.value))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                >
                  {segments.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[13px]">Defect Classification</label>
                <select
                  value={defectType}
                  onChange={(e) => setDefectType(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                >
                  <option value="Wall Crack / Collapse">Wall Crack / Culvert Sidewall Collapse</option>
                  <option value="Siltation / Bed Sediment">Severe Bed Siltation (&gt;50% capacity loss)</option>
                  <option value="Sluice Gate Mechanical Failure">Sluice Gate / Outfall Mechanical Failure</option>
                  <option value="Missing Grating / Vandalism">Missing Ingress Grating / Manhole Hazard</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[13px]">Inspector Notes &amp; Repair Request</label>
                <textarea
                  rows={3}
                  required
                  value={defectNotes}
                  onChange={(e) => setDefectNotes(e.target.value)}
                  placeholder="Describe location, severity, structural risk, and required machinery..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDefectModal(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant font-label-caps text-[12px] hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-5 py-2 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs cursor-pointer"
                >
                  Submit &amp; Sync with Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
