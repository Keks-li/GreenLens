import React, { useState } from 'react';

export default function IncidentDetailModal({
  isOpen,
  onClose,
  incident,
  onOpenDispatch,
  onUpdateStatus
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-outline-variant w-full max-w-xl overflow-hidden animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-surface-container-low/80 backdrop-blur-md px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center text-risk-critical">
              <span className="material-symbols-outlined text-[22px]">report_problem</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-title-md font-bold text-on-surface text-[17px]">
                  {incident.title}
                </h3>
              </div>
              <p className="text-[12px] text-on-surface-variant">
                ID: {incident.id} • {incident.reportedAt}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-body-sm">
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
                {incident.aiConfidence || '96% AI Verified'}
              </div>

              <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] flex justify-between items-center border border-white/15">
                <span>📍 {incident.coords}</span>
                <span className="text-primary-fixed font-bold">Click to {isPhotoExpanded ? 'shrink' : 'zoom'} photo</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-surface-container-low/70 backdrop-blur-xs p-4 rounded-2xl border border-outline-variant/60">
            <span className="text-[10px] uppercase font-label-caps text-outline font-bold">Report Description</span>
            <p className="text-on-surface text-[14px] mt-1 leading-relaxed">{incident.description}</p>
          </div>

          {/* Incident Metadata Grid with Transparent Cards */}
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="bg-surface-container-low/70 backdrop-blur-xs p-3.5 rounded-xl border border-outline-variant/40">
              <span className="text-outline font-semibold block text-[11px]">Reported By</span>
              <div className="text-on-surface font-medium mt-0.5">{incident.reportedBy}</div>
            </div>
            <div className="bg-surface-container-low/70 backdrop-blur-xs p-3.5 rounded-xl border border-outline-variant/40">
              <span className="text-outline font-semibold block text-[11px]">Associated Drain</span>
              <div className="text-primary font-bold mt-0.5">{incident.drainId || 'Unlinked'}</div>
            </div>
            <div className="bg-surface-container-low/70 backdrop-blur-xs p-3.5 rounded-xl border border-outline-variant/40">
              <span className="text-outline font-semibold block text-[11px]">Estimated Waste Volume</span>
              <div className="text-on-surface font-medium mt-0.5">{incident.estimatedWasteVolume || 'N/A'}</div>
            </div>
            <div className="bg-surface-container-low/70 backdrop-blur-xs p-3.5 rounded-xl border border-outline-variant/40">
              <span className="text-outline font-semibold block text-[11px]">Current Status</span>
              <div className="capitalize font-bold text-on-surface mt-0.5">{incident.status}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-container-low/80 backdrop-blur-md px-6 py-4 border-t border-outline-variant flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-on-surface-variant font-label-caps text-[12px] hover:bg-surface-container transition-colors cursor-pointer"
          >
            Dismiss
          </button>

          <div className="flex items-center gap-2">
            {incident.status !== 'resolved' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleResolve}
                className="bg-secondary-container text-on-secondary-container px-4 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-secondary/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Mark Resolved
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenDispatch && onOpenDispatch(incident);
              }}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Dispatch Resolution Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
