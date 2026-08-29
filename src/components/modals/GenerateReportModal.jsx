import React, { useState } from 'react';
import { generateMunicipalPdfReport } from '../../lib/pdfReportGenerator';

export default function GenerateReportModal({
  isOpen,
  onClose,
  selectedMunicipality,
  currentUser,
  kpis,
  drainageSegments,
  incidents,
  fieldTeams,
  citizenRewards,
  usersList,
  weather,
  onSuccess
}) {
  const [reportType, setReportType] = useState('executive');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const reportOptions = [
    {
      id: 'executive',
      title: 'Executive Municipal Summary Report',
      description: 'Comprehensive environmental situation briefing with KPIs, critical conduits, flood risk metrics, and recent incidents.',
      icon: 'summarize',
      badge: 'Recommended'
    },
    {
      id: 'drainage',
      title: 'Drainage & Hydraulic Telemetry Audit',
      description: 'Complete audit of all stormwater channels, culverts, blockage percentages, structural status, and digital twin flow data.',
      icon: 'waves',
      badge: 'Infrastructure'
    },
    {
      id: 'incidents',
      title: 'Incident Logs & Field Dispatch Report',
      description: 'Full log of citizen reports, AI priority assessments, field team dispatches, and resolution timestamps.',
      icon: 'report_problem',
      badge: 'Operations'
    },
    {
      id: 'users',
      title: 'Personnel & Citizen Engagement Ledger',
      description: 'Directory of municipal staff, field workers, citizen champions, reward points, and audit activities.',
      icon: 'group',
      badge: 'Administration'
    }
  ];

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600)); // Smooth UX feedback

      const filename = generateMunicipalPdfReport({
        reportType,
        municipality: selectedMunicipality || { name: 'Winneba Municipal Assembly', region: 'Central Region' },
        generatedBy: currentUser?.name || 'Municipal Officer',
        kpis,
        drainageSegments,
        incidents,
        fieldTeams,
        citizenRewards,
        usersList,
        weather
      });

      if (onSuccess) {
        onSuccess(`✓ PDF Report "${filename}" generated and downloaded successfully!`);
      }
      onClose();
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant w-full max-w-xl overflow-hidden animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary px-6 py-5 text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
            </div>
            <div>
              <h3 className="font-title-md font-bold text-white text-[18px] leading-tight">
                Generate Municipal PDF Report
              </h3>
              <p className="text-[12px] text-white/80">
                Official document export for assembly meetings, audits, and field briefs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider text-outline mb-2">
              Select Report Scope &amp; Format
            </label>
            <div className="space-y-2.5">
              {reportOptions.map((opt) => {
                const isSelected = reportType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setReportType(opt.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-primary-container/25 border-primary ring-1 ring-primary/20 shadow-xs'
                        : 'bg-surface-container-low/60 border-outline-variant/60 hover:bg-surface-container-high'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container-highest text-outline'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-[14px] text-on-surface">{opt.title}</span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[12px] text-on-surface-variant leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Report Metadata Preview */}
          <div className="bg-surface-container-low/80 p-3.5 rounded-2xl border border-outline-variant/60 text-[12px] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-outline">Jurisdiction Target:</span>
              <span className="font-semibold text-on-surface">
                {selectedMunicipality?.name || 'Winneba Municipal Assembly'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Live Telemetry Source:</span>
              <span className="font-semibold text-primary">Open-Meteo &amp; Supabase Cloud Database</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Document Standard:</span>
              <span className="font-semibold text-on-surface">A4 Portrait • High-Res Digital Seal</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-surface-container-low/50 border-t border-outline-variant/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-on-surface-variant font-bold text-[13px] hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleDownload}
            className="bg-primary hover:bg-surface-tint text-on-primary font-bold text-[13px] px-6 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Generating PDF Document...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Download Official PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
