import React, { useState } from 'react';

export default function WasteIntelligenceView({ onOpenDispatch }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const wasteHotspots = [
    {
      id: 'HOT-01',
      name: 'Central Market Stall 42 Hinterland',
      sector: 'Central Market Sector',
      tonnageMonthly: '14.2 Tons',
      primaryMaterial: 'Single-Use Plastics & Styrofoam',
      severity: 'Critical',
      drainAffiliation: 'Drain D-102',
      recurrenceRate: 'Weekly Re-accumulation',
      trend: '+18% vs Last Month'
    },
    {
      id: 'HOT-02',
      name: 'Coastal Fish Processing Swale',
      sector: 'Fishing Harbor District',
      tonnageMonthly: '9.8 Tons',
      primaryMaterial: 'Organic Fish Refuse & Packaging',
      severity: 'High',
      drainAffiliation: 'Drain D-108',
      recurrenceRate: 'Bi-Weekly Re-accumulation',
      trend: '-6% Post Enforcement'
    },
    {
      id: 'HOT-03',
      name: 'Lowtown Construction Washout',
      sector: 'Lowtown Community',
      tonnageMonthly: '6.4 Tons',
      primaryMaterial: 'Excavation Silt & Aggregates',
      severity: 'Moderate',
      drainAffiliation: 'Drain D-201',
      recurrenceRate: 'Rain-Triggered Sedimentation',
      trend: '+4% vs Last Month'
    },
    {
      id: 'HOT-04',
      name: 'North University Taxi Rank Outfall',
      sector: 'North Campus Zone',
      tonnageMonthly: '8.1 Tons',
      primaryMaterial: 'Plastic Bottles & Sachet Bags',
      severity: 'Critical',
      drainAffiliation: 'Drain D-104',
      recurrenceRate: 'Daily Commuter Litter',
      trend: '+22% vs Last Month'
    }
  ];

  return (
    <div className="px-8 py-6 w-full max-w-[1440px] mx-auto space-y-6 select-none">
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
            <span className="material-symbols-outlined text-primary text-[24px]">recycling</span>
            <h1 className="font-headline-lg text-on-surface">Waste Intelligence &amp; Hotspot Analytics</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            AI material classification, tonnage accumulation modeling, and high-frequency illegal dumping heatmaps.
          </p>
        </div>

        <button
          onClick={() => showToast('Optimized collection routes dispatched to Municipal Sanitation Fleet!')}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">route</span>
          Optimize Sanitation Routes
        </button>
      </div>

      {/* Waste Material Composition & Tonnage KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Plastics & Polymers</span>
          <div className="text-[28px] font-bold text-on-surface mt-1">44%</div>
          <span className="text-[12px] text-risk-critical font-bold mt-0.5 block">
            18.8 Tons Diverted this Month
          </span>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
            <div className="bg-risk-critical h-1.5 rounded-full w-[44%]"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Silt & Soil Runoff</span>
          <div className="text-[28px] font-bold text-on-surface mt-1">32%</div>
          <span className="text-[12px] text-risk-high font-bold mt-0.5 block">
            13.7 Tons Extracted from Culverts
          </span>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
            <div className="bg-risk-high h-1.5 rounded-full w-[32%]"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Organic & Vegetative</span>
          <div className="text-[28px] font-bold text-on-surface mt-1">16%</div>
          <span className="text-[12px] text-primary font-bold mt-0.5 block">
            6.8 Tons Composted
          </span>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
            <div className="bg-primary h-1.5 rounded-full w-[16%]"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Recycled Material Yield</span>
          <div className="text-[28px] font-bold text-primary mt-1">78.4%</div>
          <span className="text-[12px] text-on-surface-variant font-medium mt-0.5 block">
            Partner: Winneba EcoRecycle Facility
          </span>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
            <div className="bg-primary h-1.5 rounded-full w-[78%]"></div>
          </div>
        </div>
      </div>

      {/* Chronic Waste Hotspots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {wasteHotspots.map((hotspot) => {
          const isCritical = hotspot.severity === 'Critical';

          return (
            <div
              key={hotspot.id}
              className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-data-mono text-[11px] font-bold text-outline">{hotspot.id}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          isCritical ? 'bg-error-container text-on-error-container' : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {hotspot.severity} Hotspot
                      </span>
                    </div>
                    <h3 className="font-title-md text-[17px] font-bold text-on-surface mt-1">
                      {hotspot.name}
                    </h3>
                    <span className="text-[12px] text-on-surface-variant">{hotspot.sector}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-outline uppercase font-label-caps">Est. Accumulation</span>
                    <div className="font-display-lg text-[20px] font-bold text-on-surface">{hotspot.tonnageMonthly}</div>
                  </div>
                </div>

                <div className="space-y-2 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/40 text-[13px] mb-4">
                  <div className="flex justify-between">
                    <span className="text-outline">Primary Waste Type:</span>
                    <span className="font-semibold text-on-surface text-right">{hotspot.primaryMaterial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Associated Drainage Asset:</span>
                    <span className="font-bold text-primary">{hotspot.drainAffiliation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Recurrence Profile:</span>
                    <span className="font-semibold text-on-surface">{hotspot.recurrenceRate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40">
                <span className="text-[12px] font-semibold text-risk-critical">{hotspot.trend}</span>
                <button
                  onClick={() => onOpenDispatch && onOpenDispatch({ id: hotspot.drainAffiliation, name: hotspot.name })}
                  className="bg-primary text-on-primary px-4 py-2 rounded-xl text-[12px] font-label-caps hover:bg-surface-tint transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                  Deploy Waste Sweep
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
