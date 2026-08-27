import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/supabase';

export default function WasteIntelligenceView({
  citizenRewards: initialCitizenRewards = [],
  onOpenDispatch,
  onRefreshData
}) {
  const [citizens, setCitizens] = useState(initialCitizenRewards);
  const [selectedTab, setSelectedTab] = useState('citizens'); // 'citizens', 'hotspots', 'materials'
  const [toastMessage, setToastMessage] = useState(null);
  const [isDisbursing, setIsDisbursing] = useState(null);

  useEffect(() => {
    if (initialCitizenRewards?.length) {
      setCitizens(initialCitizenRewards);
    }
  }, [initialCitizenRewards]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDisburseReward = async (citizenId, userName) => {
    setIsDisbursing(citizenId);
    const updated = await dataService.redeemCitizenReward(citizenId, 50.00);
    if (updated) {
      setCitizens(citizens.map(c => c.id === citizenId ? { ...c, rewardsRedeemedGhs: Number(c.rewardsRedeemedGhs || 0) + 50 } : c));
      showToast(`✓ Disbursed GHS 50.00 Eco-Reward to ${userName}! Synced with Supabase.`);
      if (onRefreshData) onRefreshData();
    } else {
      showToast(`⚠️ Could not process disbursement.`);
    }
    setIsDisbursing(null);
  };

  // Refuse hotspots tracked in Winneba
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

  // Total refuse stats from citizen rewards
  const totalRefuseKgReported = citizens.reduce((acc, c) => acc + Number(c.refuseKgReported || 0), 0);
  const totalRefuseKgCleared = citizens.reduce((acc, c) => acc + Number(c.refuseKgCleared || 0), 0);
  const totalRewardsRedeemed = citizens.reduce((acc, c) => acc + Number(c.rewardsRedeemedGhs || 0), 0);

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'Platinum Guardian':
        return 'bg-purple-100 text-purple-900 border border-purple-300';
      case 'Gold Champion':
        return 'bg-amber-100 text-amber-900 border border-amber-300';
      case 'Silver Eco-Advocate':
        return 'bg-slate-100 text-slate-800 border border-slate-300';
      default:
        return 'bg-orange-100 text-orange-900 border border-orange-200';
    }
  };

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
            <h1 className="font-headline-lg text-on-surface">Refuse Intelligence &amp; Citizen Rewards</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Track refuse reported by citizens, verified tonnage clearance, flood prevention impact, and eco-incentive rewards.
          </p>
        </div>

        <button
          onClick={() => showToast('Dispatched automated municipal collection sweep!')}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">route</span>
          Optimize Refuse Sweeps
        </button>
      </div>

      {/* Top Refuse & Rewards KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Total Refuse Reported</span>
          <div className="text-[28px] font-bold text-on-surface mt-1">{(totalRefuseKgReported / 1000).toFixed(2)} Tons</div>
          <span className="text-[12px] text-risk-critical font-bold mt-0.5 block">
            {citizens.reduce((acc, c) => acc + c.reportsCount, 0)} Verified Citizen Scans
          </span>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
            <div className="bg-risk-critical h-1.5 rounded-full w-[85%]"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Refuse Cleared from Drains</span>
          <div className="text-[28px] font-bold text-primary mt-1">{(totalRefuseKgCleared / 1000).toFixed(2)} Tons</div>
          <span className="text-[12px] text-primary font-bold mt-0.5 block">
            {totalRefuseKgReported ? Math.round((totalRefuseKgCleared / totalRefuseKgReported) * 100) : 84}% Clearance Rate
          </span>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
            <div className="bg-primary h-1.5 rounded-full w-[84%]"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Eco-Rewards Disbursed</span>
          <div className="text-[28px] font-bold text-on-surface mt-1">GHS {totalRewardsRedeemed.toFixed(2)}</div>
          <span className="text-[12px] text-on-surface-variant font-medium mt-0.5 block">
            Clean Environment Incentives
          </span>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
            <div className="bg-amber-500 h-1.5 rounded-full w-[65%]"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Active Eco-Champions</span>
          <div className="text-[28px] font-bold text-primary mt-1">{citizens.length} Citizens</div>
          <span className="text-[12px] text-on-surface-variant font-medium mt-0.5 block">
            Winneba Assembly Clean Watch
          </span>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
            <div className="bg-primary h-1.5 rounded-full w-[90%]"></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/60 gap-8">
        {[
          { id: 'citizens', label: 'Citizen Refuse Champions & Rewards', icon: 'military_tech', badge: citizens.length },
          { id: 'hotspots', label: 'Chronic Refuse Hotspots', icon: 'near_me', badge: wasteHotspots.length },
          { id: 'materials', label: 'Material Breakdown & Polymers', icon: 'pie_chart' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTab(t.id)}
            className={`pb-3.5 font-label-caps text-[13px] flex items-center gap-2 transition-all relative cursor-pointer ${
              selectedTab === t.id
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-on-surface font-semibold'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            <span>{t.label}</span>
            {t.badge !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                selectedTab === t.id ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-outline'
              }`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Citizen Refuse Champions & Rewards Table */}
      {selectedTab === 'citizens' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-title-md font-bold text-on-surface text-[17px]">
                  Citizen Reporting &amp; Environmental Cleanliness Rewards
                </h3>
                <p className="text-[12px] text-on-surface-variant">
                  Rewarded for reporting refuse choke points, verifying clean drainage, and mitigating localized flood hazards.
                </p>
              </div>
              <span className="text-[12px] font-data-mono text-outline">{citizens.length} Ranked Citizens</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] uppercase font-label-caps text-outline">
                    <th className="py-3.5 px-4">Citizen / Champion</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Reports</th>
                    <th className="py-3.5 px-4">Refuse Reported</th>
                    <th className="py-3.5 px-4">Refuse Cleared</th>
                    <th className="py-3.5 px-4">GreenPoints</th>
                    <th className="py-3.5 px-4">Eco-Tier</th>
                    <th className="py-3.5 px-4">Redeemed (GHS)</th>
                    <th className="py-3.5 px-4 text-right">Admin Reward Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-[13px]">
                  {citizens.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-on-surface flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] ${
                          idx === 0 ? 'bg-amber-400 text-amber-950 font-extrabold' : 'bg-primary/10 text-primary'
                        }`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="font-bold">{c.userName}</div>
                          <div className="text-[10px] text-outline">{c.id}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-data-mono text-[12px] text-outline whitespace-nowrap">
                        {c.phone || c.email}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-on-surface">
                        {c.reportsCount} scans
                      </td>
                      <td className="py-3.5 px-4 font-data-mono text-[12px] font-bold text-risk-critical">
                        {c.refuseKgReported} kg
                      </td>
                      <td className="py-3.5 px-4 font-data-mono text-[12px] font-bold text-primary">
                        {c.refuseKgCleared} kg
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-primary/10 text-primary font-data-mono font-bold text-[12px] px-2.5 py-0.5 rounded-full">
                          ⭐ {c.rewardPoints} pts
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getTierBadge(c.tier)}`}>
                          {c.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-data-mono text-[12px] font-bold text-on-surface">
                        GHS {Number(c.rewardsRedeemedGhs || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDisburseReward(c.id, c.userName)}
                          disabled={isDisbursing === c.id}
                          className="bg-primary hover:bg-surface-tint text-on-primary px-3 py-1.5 rounded-lg text-[11px] font-label-caps font-bold transition-all shadow-2xs hover:shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">redeem</span>
                          <span>{isDisbursing === c.id ? 'Sending...' : 'Disburse +GHS 50'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hotspots Grid */}
      {selectedTab === 'hotspots' && (
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
                      <span className="text-outline">Primary Refuse:</span>
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
                    type="button"
                    onClick={() => onOpenDispatch && onOpenDispatch({ id: hotspot.drainAffiliation, name: hotspot.name })}
                    className="bg-primary text-on-primary px-4 py-2 rounded-xl text-[12px] font-label-caps hover:bg-surface-tint transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    Deploy Refuse Sweep
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Material Breakdown */}
      {selectedTab === 'materials' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
            <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Plastics &amp; Polymers</span>
            <div className="text-[28px] font-bold text-on-surface mt-1">44%</div>
            <span className="text-[12px] text-risk-critical font-bold mt-0.5 block">
              18.8 Tons Diverted this Month
            </span>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
              <div className="bg-risk-critical h-1.5 rounded-full w-[44%]"></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
            <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Silt &amp; Soil Runoff</span>
            <div className="text-[28px] font-bold text-on-surface mt-1">32%</div>
            <span className="text-[12px] text-risk-high font-bold mt-0.5 block">
              13.7 Tons Extracted from Culverts
            </span>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
              <div className="bg-risk-high h-1.5 rounded-full w-[32%]"></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
            <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Organic &amp; Vegetative</span>
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
              Winneba EcoRecycle Facility
            </span>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
              <div className="bg-primary h-1.5 rounded-full w-[78%]"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
