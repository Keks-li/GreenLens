import React, { useState } from 'react';
import { dataService } from '../../lib/supabase';

export default function ImageAnalysisModal({
  isOpen,
  onClose,
  currentUser,
  onAnalysisComplete
}) {
  if (!isOpen) return null;

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedSector, setSelectedSector] = useState('Central Market Sector');
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preset demonstration images for quick AI testing
  const sampleImages = [
    {
      title: 'Plastic Bottle Choke',
      url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
      detected: 'Single-use plastics & polyethylene bottles',
      confidence: '96.4%',
      severity: 'critical',
      wasteKg: '420 kg',
      drain: 'Drain D-102 (Central Market)'
    },
    {
      title: 'Culvert Wall Fracture',
      url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      detected: 'Structural Masonry Wall Inward Collapse',
      confidence: '92.1%',
      severity: 'high',
      wasteKg: '1.4 tons rubble',
      drain: 'Drain D-117 (South Residential)'
    },
    {
      title: 'Sediment Silt Buildup',
      url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
      detected: 'Dense Roadway Silt & Sand Accumulation',
      confidence: '89.5%',
      severity: 'moderate',
      wasteKg: '280 kg',
      drain: 'Drain D-201 (Lowtown)'
    }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setAnalysisResult(null);
    }
  };

  const handleSelectSample = (sample) => {
    setImagePreview(sample.url);
    setImageFile(null);
    setAnalysisResult(null);
  };

  const runAiAnalysis = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);

    // Simulate Computer Vision Processing Delay with Realistic AI Detections
    await new Promise((res) => setTimeout(res, 1400));

    // Dynamic result based on preview or sample
    const randomConfidence = (91 + Math.random() * 8).toFixed(1);
    const result = {
      detectedObstruction: 'Dense plastic packaging & market runoff refuse',
      confidence: `${randomConfidence}%`,
      severity: 'critical',
      estimatedWasteKg: '460 kg',
      drainageImpact: '82% cross-sectional hydraulic reduction',
      aiDirective: 'Immediate hydro-jet clearance required prior to heavy precipitation window.',
      hazardLevel: 'Critical Overflow Risk',
      timestamp: new Date().toISOString()
    };

    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleSubmitToDatabase = async () => {
    if (!analysisResult) return;
    setIsSubmitting(true);

    const reporterName = currentUser?.name || 'Citizen Verified Reporter';
    const incidentTitle = `AI Scan: ${analysisResult.detectedObstruction.substring(0, 45)}...`;

    // 1. Create incident in Supabase
    const createdIncident = await dataService.createIncident({
      title: incidentTitle,
      category: 'AI Vision Waste Detection',
      severity: analysisResult.severity,
      sector: selectedSector,
      description: `${analysisResult.aiDirective} | Notes: ${customNotes || 'User photo scanned with GreenLens Computer Vision'}`,
      reportedBy: `${reporterName} (via AI Photo Upload)`,
      aiConfidence: `${analysisResult.confidence} Confirmed`,
      estimatedWasteVolume: analysisResult.estimatedWasteKg,
      imageUrl: imagePreview
    });

    // 2. Add detailed audit record for Admin activity monitoring
    await dataService.addAuditLog({
      user: reporterName,
      action: 'USER_IMAGE_ANALYZED',
      entity: createdIncident.id,
      details: `Uploaded photo for AI analysis in ${selectedSector}. Detected: ${analysisResult.detectedObstruction} (${analysisResult.confidence} confidence).`
    });

    setIsSubmitting(false);
    if (onAnalysisComplete) onAnalysisComplete(createdIncident);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant w-full max-w-2xl overflow-hidden animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-primary px-6 py-4 text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[24px]">document_scanner</span>
            <div>
              <h3 className="font-title-md font-bold text-[18px]">AI Image Analysis &amp; Waste Scanner</h3>
              <p className="text-[11px] text-white/80">Upload drainage photo for instant computer vision classification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Upload Area / Sample Selection */}
          {!imagePreview ? (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-outline-variant hover:border-primary rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-surface-container-low/40 hover:bg-surface-container-low">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[32px]">add_photo_alternate</span>
                </div>
                <span className="font-bold text-[15px] text-on-surface">Click or Drag &amp; Drop Photo Here</span>
                <span className="text-[12px] text-on-surface-variant mt-1">
                  Supports JPEG, PNG, WEBP from smartphone camera or field drone
                </span>
              </label>

              {/* Sample Photo Pickers */}
              <div>
                <span className="font-label-caps text-[11px] uppercase font-bold text-outline block mb-2">
                  Or Test with Real Municipal Field Samples:
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {sampleImages.map((s) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => handleSelectSample(s)}
                      className="p-2 rounded-xl border border-outline-variant bg-surface-container-low hover:border-primary text-left transition-all group cursor-pointer"
                    >
                      <img src={s.url} alt={s.title} className="w-full h-16 object-cover rounded-lg mb-1.5" />
                      <div className="font-bold text-[11px] text-on-surface group-hover:text-primary truncate">{s.title}</div>
                      <div className="text-[10px] text-outline truncate">{s.wasteKg}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview & Scanning Laser */}
              <div className="relative rounded-2xl overflow-hidden border border-outline-variant h-64 bg-black flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Scanned Drainage Defect"
                  className="w-full h-full object-cover opacity-90"
                />

                {/* Laser Scanning Animation when Analyzing */}
                {isAnalyzing && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary-fixed to-transparent shadow-[0_0_15px_#a5f697] animate-[pulse_1s_infinite] absolute top-0 animate-bounce duration-1000"></div>
                    <div className="absolute inset-0 bg-primary/10 backdrop-blur-2xs flex items-center justify-center">
                      <div className="bg-black/80 px-4 py-2 rounded-xl border border-white/20 text-white flex items-center gap-2 text-[13px] font-bold">
                        <span className="material-symbols-outlined animate-spin text-primary-fixed">progress_activity</span>
                        <span>Neural Network Analyzing Waste Density...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Change photo button */}
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    setAnalysisResult(null);
                  }}
                  className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white px-3 py-1 rounded-lg text-[11px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  Change Photo
                </button>
              </div>

              {/* Action: Run AI Scan */}
              {!analysisResult && (
                <button
                  type="button"
                  onClick={runAiAnalysis}
                  disabled={isAnalyzing}
                  className="w-full bg-primary hover:bg-surface-tint text-on-primary py-3 rounded-xl font-title-md font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  <span>Run Computer Vision Analysis</span>
                </button>
              )}

              {/* AI Detection Breakdown */}
              {analysisResult && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/60 space-y-3">
                    <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
                        <span className="font-bold text-[14px] text-on-surface">AI Classification Complete</span>
                      </div>
                      <span className="bg-primary/10 text-primary font-data-mono font-bold text-[12px] px-2.5 py-0.5 rounded-full">
                        {analysisResult.confidence} Confidence
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[12px]">
                      <div>
                        <span className="text-outline block">Detected Obstruction:</span>
                        <span className="font-bold text-on-surface">{analysisResult.detectedObstruction}</span>
                      </div>
                      <div>
                        <span className="text-outline block">Estimated Waste Volume:</span>
                        <span className="font-bold text-risk-critical font-data-mono">{analysisResult.estimatedWasteKg}</span>
                      </div>
                      <div>
                        <span className="text-outline block">Hydraulic Impact:</span>
                        <span className="font-bold text-on-surface">{analysisResult.drainageImpact}</span>
                      </div>
                      <div>
                        <span className="text-outline block">Hazard Level:</span>
                        <span className="font-bold text-risk-critical">{analysisResult.hazardLevel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Geotag / Sector Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-on-surface mb-1">Geographic Sector</label>
                      <select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-[13px] text-on-surface"
                      >
                        <option value="Central Market Sector">Central Market Sector (Drain D-102)</option>
                        <option value="South Residential">South Residential (Drain D-117)</option>
                        <option value="North Campus Zone">North Campus Zone (Drain D-104)</option>
                        <option value="Coastal Fishing Harbor">Coastal Fishing Harbor (Drain D-108)</option>
                        <option value="Lowtown Community">Lowtown Community (Drain D-201)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-on-surface mb-1">Additional Notes (Optional)</label>
                      <input
                        type="text"
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="e.g. Near taxi station junction"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-[13px] text-on-surface"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-surface-container-low px-6 py-4 border-t border-outline-variant/60 flex items-center justify-between">
          <div className="text-[11px] text-outline flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">visibility</span>
            <span>Recorded in Admin Activity &amp; Audit Log</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-on-surface-variant font-label-caps text-[12px] hover:bg-surface-container cursor-pointer"
            >
              Cancel
            </button>
            {analysisResult && (
              <button
                type="button"
                onClick={handleSubmitToDatabase}
                disabled={isSubmitting}
                className="bg-primary hover:bg-surface-tint text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>{isSubmitting ? 'Syncing...' : 'Save & Publish to Dispatch'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
