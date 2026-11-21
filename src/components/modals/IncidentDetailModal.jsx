import React, { useState } from 'react';

export default function IncidentDetailModal({
  isOpen,
  onClose,
  incident,
  onOpenDispatch,
  onUpdateStatus,
  onLocateOnMap
}) {
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !incident) return null;

  const handleResolve = async () => {
    setIsUpdating(true);
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(incident.id, 'resolved');
      }
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-outline-variant w-full max-w-xl overflow-hidden animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-surface-container-low/80 backdrop-blur-md px-5 sm:px-6 py-3.5 sm:py-4 border-b border-outline-variant flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center text-risk-critical shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[22px]">report_problem</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-title-md font-bold text-on-surface text-[16px] sm:text-[17px] truncate">
                {incident.title}
              </h3>
              <p className="text-[11.5px] text-on-surface-variant truncate">
                ID: {incident.id} • {incident.reportedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onLocateOnMap && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLocateOnMap(incident);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 text-[12px] font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-2xs cursor-pointer whitespace-nowrap"
                title="See Exact Location on Map"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-700">explore</span>
                <span>See Map</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-body-sm">
          {/* Incident Clear Image Preview with Transparent HUD */}
          {incident.imageUrl && (
            <div
              onClick={() => setIsPhotoExpanded(!isPhotoExpanded)}
              className={`relative rounded-2xl overflow-hidden border border-outline-variant/60 bg-surface-container cursor-pointer transition-all duration-300 ${
                isPhotoExpanded ? 'h-72' : 'h-48'
              }`}
            >
              <img
                src={incident.imageUrl}
                alt={incident.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/25 pointer-events-none"></div>
              
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20">
                <span className="material-symbols-outlined text-primary text-[14px]">auto_awesome</span>
                {incident.aiConfidence || 'AI Verified'}
              </div>

              <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] flex justify-between items-center border border-white/15">
                <span>📍 {incident.coords}</span>
                <span className="text-primary-fixed font-bold">Click to {isPhotoExpanded ? 'shrink' : 'zoom'} photo</span>
              </div>
            </div>
          )}

          {/* Refuse Type & Category Key Information Badge */}
          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-outline block">Detected Refuse &amp; Material Type</span>
              <div className="text-[13.5px] font-bold text-on-surface flex items-center gap-1.5 mt-0.5">
                <span className="material-symbols-outlined text-primary text-[18px]">recycling</span>
                <span>{incident.refuseType || incident.category || 'Refuse'}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-outline block">Estimated Refuse Volume</span>
              <div className="text-[14px] font-bold font-data-mono text-primary mt-0.5">
                {incident.estimatedWasteVolume || incident.weightQuantityFormatted || 'Not recorded'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-surface-container-low/70 backdrop-blur-xs p-4 rounded-2xl border border-outline-variant/60">
            <span className="text-[10px] uppercase font-label-caps text-outline font-bold">Report Description</span>
            <p className="text-on-surface text-[13.5px] mt-1 leading-relaxed">{incident.description}</p>
          </div>

          {/* AI Risk Assessment Card if present */}
          {(incident.aiRiskAssessment || incident.aiReasoning) && (
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-primary flex items-center gap-1 font-label-caps uppercase">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  AI Neural Risk Assessment
                </span>
                <span className="text-[11px] font-data-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {incident.aiConfidence}
                </span>
              </div>
              <p className="text-[13px] text-on-surface leading-relaxed">
                {incident.aiReasoning || incident.aiRiskAssessment?.reasoning}
              </p>
              {(incident.floodRiskScore !== undefined || incident.wasteRiskScore !== undefined) && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-surface-container-lowest/80 p-2 rounded-xl border border-outline-variant/30 text-[11px]">
                    <span className="text-outline block">Flood Risk Score</span>
                    <span className="font-bold text-on-surface font-data-mono">{incident.floodRiskScore ?? 0}%</span>
                  </div>
                  <div className="bg-surface-container-lowest/80 p-2 rounded-xl border border-outline-variant/30 text-[11px]">
                    <span className="text-outline block">Waste Factor Score</span>
                    <span className="font-bold text-on-surface font-data-mono">{incident.wasteRiskScore ?? 0}%</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Incident Metadata Grid with Transparent Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[12px]">
            <div className="bg-surface-container-low/70 backdrop-blur-xs p-3.5 rounded-xl border border-outline-variant/40">
              <span className="text-outline font-semibold block text-[11px]">Reported By</span>
              <div className="text-on-surface font-medium mt-0.5 truncate">{incident.reportedBy}</div>
              {incident.reporterContact && (
                <div className="text-[10px] text-primary font-data-mono mt-0.5 truncate">{incident.reporterContact}</div>
              )}
            </div>

            <div className="bg-surface-container-low/70 backdrop-blur-xs p-3.5 rounded-xl border border-outline-variant/40">
              <span className="text-outline font-semibold block text-[11px]">Associated Drain / Sector</span>
              <div className="text-primary font-bold mt-0.5 truncate">{incident.drainId || incident.sector || 'Catchment Area'}</div>
            </div>

            <div className="bg-surface-container-low/70 backdrop-blur-xs p-3.5 rounded-xl border border-outline-variant/40">
              <span className="text-outline font-semibold block text-[11px]">GPS Coordinates</span>
              <div className="font-data-mono text-on-surface font-medium mt-0.5 truncate">{incident.coords || '5.3556°N, 0.6247°W'}</div>
            </div>

            {/* Weight / Quantity Highlight Card */}
            <div className="bg-emerald-50/90 p-3.5 rounded-xl border border-emerald-300/80 shadow-2xs">
              <span className="text-emerald-900 font-bold block text-[10.5px] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-emerald-700">scale</span>
                Weight / Quantity
              </span>
              <div className="text-emerald-950 font-extrabold font-data-mono text-[16px] mt-0.5">
                {incident.weightQuantityFormatted || (incident.weight_quantity ? `${incident.weight_quantity} kg` : incident.estimatedWasteVolume || '150 kg')}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">Verified Refuse Scale</span>
            </div>

            <div className="bg-surface-container-low/70 backdrop-blur-xs p-3.5 rounded-xl border border-outline-variant/40 col-span-2 sm:col-span-2">
              <span className="text-outline font-semibold block text-[11px]">Current Status</span>
              <div className="capitalize font-bold text-on-surface mt-0.5 flex items-center gap-1.5">
                {incident.status === 'in-progress' || incident.rawStatus === 'IN_PROGRESS' ? (
                  <span className="inline-flex items-center gap-1.5 text-amber-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span>In Progress</span>
                  </span>
                ) : incident.status === 'resolved' ? (
                  <span className="inline-flex items-center gap-1.5 text-primary font-bold">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span>Resolved</span>
                  </span>
                ) : (
                  <span>{incident.rawStatus || incident.status}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sleek Footer Actions */}
        <div className="bg-surface-container-low/80 backdrop-blur-md px-5 sm:px-6 py-3.5 sm:py-4 border-t border-outline-variant flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-semibold text-[13px] transition-colors cursor-pointer"
            >
              Dismiss
            </button>

            {onLocateOnMap && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLocateOnMap(incident);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface hover:text-primary border border-outline-variant/60 text-[12.5px] font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">explore</span>
                <span>See on Map</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {incident.status !== 'resolved' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleResolve}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[12.5px] font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                <span>Mark Resolved</span>
              </button>
            )}

            <button
              type="button"
              disabled={incident.status === 'resolved'}
              onClick={() => {
                if (incident.status !== 'resolved') {
                  onClose();
                  onOpenDispatch && onOpenDispatch(incident);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-bold transition-all whitespace-nowrap ${
                incident.status === 'resolved'
                  ? 'bg-surface-container-high text-outline cursor-not-allowed opacity-60'
                  : incident.status === 'in-progress'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer'
                  : 'bg-primary hover:bg-primary/95 text-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {incident.status === 'resolved' ? 'check_circle' : incident.status === 'in-progress' ? 'engineering' : 'send'}
              </span>
              <span>
                {incident.status === 'resolved'
                  ? 'Resolved'
                  : incident.status === 'in-progress'
                  ? 'In Progress (Re-assign)'
                  : 'Dispatch Team'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
