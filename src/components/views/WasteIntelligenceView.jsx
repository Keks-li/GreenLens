import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/supabase';

export default function WasteIntelligenceView({
  citizenRewards: initialCitizenRewards = [],
  wasteTypes = [],
  rewardCatalog = [],
  badges = [],
  drainageSegments = [],
  incidents = [],
  onOpenDispatch,
  onRefreshData
}) {
  const [citizens, setCitizens] = useState(initialCitizenRewards);
  const [selectedTab, setSelectedTab] = useState('citizens'); // 'citizens', 'hotspots', 'materials', 'catalog'
  const [toastMessage, setToastMessage] = useState(null);
  const [disburseModalCitizen, setDisburseModalCitizen] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isSubmittingDisbursement, setIsSubmittingDisbursement] = useState(false);

  useEffect(() => {
    if (initialCitizenRewards) {
      setCitizens(initialCitizenRewards);
    }
  }, [initialCitizenRewards]);

  useEffect(() => {
    if (rewardCatalog?.length && !selectedPackage) {
      setSelectedPackage(rewardCatalog[0]);
    }
  }, [rewardCatalog, selectedPackage]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenDisburseModal = (citizen) => {
    setDisburseModalCitizen(citizen);
    // Auto-select best matching package or default to first
    if (rewardCatalog.length) {
      setSelectedPackage(rewardCatalog[0]);
    }
  };

  const handleConfirmDisburse = async () => {
    if (!disburseModalCitizen || !selectedPackage) return;
    setIsSubmittingDisbursement(true);

    try {
      const updated = await dataService.redeemCitizenReward(
        disburseModalCitizen.id,
        selectedPackage
      );

      if (updated) {
        showToast(`✓ Disbursed ${selectedPackage.name} to ${disburseModalCitizen.userName} (${disburseModalCitizen.phone})!`);
        if (onRefreshData) onRefreshData();
        setDisburseModalCitizen(null);
      } else {
        showToast('⚠️ Could not process package disbursement.');
      }
    } finally {
      setIsSubmittingDisbursement(false);
    }
  };

  // Derive chronic refuse hotspots dynamically from database drainage segments & reports
  const dynamicHotspots = (drainageSegments || []).map((seg, idx) => {
    const isCrit = seg.riskLevel === 'critical' || seg.riskScore >= 80;
    const isHigh = seg.riskLevel === 'high' || (seg.riskScore >= 60 && seg.riskScore < 80);
    const relatedIncidents = (incidents || []).filter(i => i.drainId?.includes(seg.id) || i.sector === seg.sector);
    const materialType = relatedIncidents[0]?.refuseType || (seg.sector?.toLowerCase().includes('market') ? 'Single-Use Plastics & Organic Packaging' : 'Plastics & Silt Sediment');
    const totalIncidentKg = relatedIncidents.reduce((sum, i) => {
      const w = Number(i.weight_quantity || i.weightQuantity || (parseFloat(String(i.estimatedWasteVolume || '').replace(/[^\d.]/g, '')) || 0));
      return sum + (isNaN(w) ? 0 : w);
    }, 0);
    const tonnage = totalIncidentKg > 0 ? (totalIncidentKg / 1000).toFixed(1) : (seg.blockagePercent ? ((seg.blockagePercent * Number(seg.capacityM3S || 1) * 10) / 1000).toFixed(1) : '0.0');

    return {
      id: `HOT-${String(idx + 1).padStart(2, '0')}`,
      name: `${seg.name} Hotspot`,
      sector: seg.sector,
      tonnageMonthly: `${tonnage} Tons`,
      primaryMaterial: materialType,
      severity: isCrit ? 'Critical' : isHigh ? 'High' : 'Moderate',
      drainAffiliation: `Drain ${seg.id}`,
      recurrenceRate: isCrit ? 'Weekly Re-accumulation' : 'Rain-Triggered Sedimentation',
      trend: isCrit ? 'Elevated Silt Influx' : 'Stable Flow Monitoring'
    };
  });

  const wasteHotspots = dynamicHotspots;

  // Real-time material classification percentages derived from live reports & incidents
  const incidentCategories = (incidents || []).reduce((acc, inc) => {
    const t = (inc.refuseType || inc.category || '').toLowerCase();
    const w = Number(inc.weight_quantity || inc.weightQuantity || (parseFloat(String(inc.estimatedWasteVolume || '').replace(/[^\d.]/g, '')) || 50));
    if (t.includes('plastic') || t.includes('bottle') || t.includes('sachet')) acc.plastic += w;
    else if (t.includes('silt') || t.includes('sediment') || t.includes('sand')) acc.silt += w;
    else if (t.includes('organic') || t.includes('food') || t.includes('vegetative')) acc.organic += w;
    else acc.other += w;
    return acc;
  }, { plastic: 0, silt: 0, organic: 0, other: 0 });

  const totalCatKg = (incidentCategories.plastic + incidentCategories.silt + incidentCategories.organic + incidentCategories.other) || 1;
  const hasIncidentData = (incidentCategories.plastic + incidentCategories.silt + incidentCategories.organic + incidentCategories.other) > 0;
  const plasticPct = hasIncidentData ? Math.round((incidentCategories.plastic / totalCatKg) * 100) : 0;
  const siltPct = hasIncidentData ? Math.round((incidentCategories.silt / totalCatKg) * 100) : 0;
  const organicPct = hasIncidentData ? Math.round((incidentCategories.organic / totalCatKg) * 100) : 0;
  const otherPct = hasIncidentData ? Math.max(0, 100 - plasticPct - siltPct - organicPct) : 0;

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

  const getTelcoBadge = (phone = '') => {
    if (phone.includes('24') || phone.includes('54') || phone.includes('55') || phone.includes('59')) {
      return { name: 'MTN', color: 'bg-yellow-400/20 text-yellow-950 border border-yellow-400/40' };
    }
    if (phone.includes('20') || phone.includes('50')) {
      return { name: 'Telecel', color: 'bg-red-500/15 text-red-700 border border-red-500/30' };
    }
    if (phone.includes('26') || phone.includes('27') || phone.includes('57')) {
      return { name: 'AirtelTigo', color: 'bg-blue-500/15 text-blue-700 border border-blue-500/30' };
    }
    return { name: 'Direct Top-Up', color: 'bg-surface-container text-outline' };
  };

  const dataPackages = (rewardCatalog || []).filter(r => r.name.toLowerCase().includes('data') || r.name.toLowerCase().includes('mb') || r.name.toLowerCase().includes('gb'));
  const airtimePackages = (rewardCatalog || []).filter(r => !dataPackages.some(dp => dp.id === r.id));

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
            <span className="material-symbols-outlined text-primary text-[24px]">wifi_tethering</span>
            <h1 className="font-headline-lg text-on-surface">Data &amp; Airtime Rewards Intelligence</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Incentivize citizen waste reporting with direct telecom packages (MTN, Telecel, AirtelTigo data bundles &amp; airtime credits).
          </p>
        </div>

        <button
          onClick={() => showToast('Initiated automated data incentive batch for top 10 contributors!')}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">cell_tower</span>
          Batch Disburse Data / Airtime
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
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Data &amp; Airtime Packages Sent</span>
          <div className="text-[28px] font-bold text-on-surface mt-1">
            {Math.round(totalRewardsRedeemed / 10)} Packages
          </div>
          <span className="text-[12px] text-primary font-semibold mt-0.5 block">
            Equiv. GHS {totalRewardsRedeemed.toFixed(2)} in bundles
          </span>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
            <div className="bg-primary h-1.5 rounded-full w-[70%]"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Active Citizen Contributors</span>
          <div className="text-[28px] font-bold text-primary mt-1">{citizens.length} Champions</div>
          <span className="text-[12px] text-on-surface-variant font-medium mt-0.5 block">
            Earning Telecom Bundles for Clean Drains
          </span>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
            <div className="bg-primary h-1.5 rounded-full w-[90%]"></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/60 gap-4 sm:gap-8 overflow-x-auto">
        {[
          { id: 'citizens', label: 'Citizen Rewards Ledger', icon: 'military_tech', badge: citizens.length },
          { id: 'catalog', label: 'Packages Catalog', icon: 'redeem', badge: rewardCatalog.length || undefined },
          { id: 'hotspots', label: 'Chronic Refuse Hotspots', icon: 'near_me', badge: wasteHotspots.length },
          { id: 'materials', label: 'Waste Ontology & Recyclables', icon: 'pie_chart', badge: wasteTypes.length || undefined }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTab(t.id)}
            className={`pb-3.5 font-label-caps text-[12px] sm:text-[13px] flex items-center gap-2 transition-all relative cursor-pointer shrink-0 whitespace-nowrap ${
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

      {/* Tab 1: Citizen Data & Airtime Rewards Table */}
      {selectedTab === 'citizens' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-title-md font-bold text-on-surface text-[17px]">
                  Citizen Reporting &amp; Telecom Incentives (Data &amp; Airtime)
                </h3>
                <p className="text-[12px] text-on-surface-variant">
                  Points earned by citizen observers are redeemable as instant mobile data packages and airtime top-ups across Ghana telcos.
                </p>
              </div>
              <span className="text-[12px] font-data-mono text-outline">{citizens.length} Ranked Citizens</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] uppercase font-label-caps text-outline">
                    <th className="py-3.5 px-4">Citizen Champion</th>
                    <th className="py-3.5 px-4">Phone (Telco)</th>
                    <th className="py-3.5 px-4">Reports</th>
                    <th className="py-3.5 px-4">Refuse Reported</th>
                    <th className="py-3.5 px-4">Refuse Cleared</th>
                    <th className="py-3.5 px-4">GreenPoints</th>
                    <th className="py-3.5 px-4">Eco-Tier</th>
                    <th className="py-3.5 px-4">Data/Airtime Disbursed</th>
                    <th className="py-3.5 px-4 text-right">Send Telecom Package</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-[13px]">
                  {citizens.map((c, idx) => {
                    const telco = getTelcoBadge(c.phone);
                    return (
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
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-data-mono text-[12px] text-on-surface">{c.phone || c.email}</div>
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${telco.color}`}>
                            {telco.name}
                          </span>
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
                          <span className="text-[10px] text-outline block font-normal">
                            ≈ {Math.round((Number(c.rewardsRedeemedGhs || 0)) / 10 * 1.2)} GB Data
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenDisburseModal(c)}
                            className="bg-primary hover:bg-surface-tint text-on-primary px-3.5 py-1.5 rounded-xl text-[11px] font-label-caps font-bold transition-all shadow-2xs hover:shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[15px]">wifi_tethering</span>
                            <span>Disburse Package</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Data & Airtime Packages Catalog & Badges */}
      {selectedTab === 'catalog' && (
        <div className="space-y-8">
          {/* Mobile Data Packages */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-outline-variant/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">language</span>
                </div>
                <div>
                  <h3 className="font-title-md font-bold text-on-surface text-[17px]">
                    Mobile Data Bundles (MTN, Telecel, AirtelTigo)
                  </h3>
                  <p className="text-[12px] text-on-surface-variant">
                    High-speed internet packages credited directly to citizen phones upon drain clearing and verified reporting.
                  </p>
                </div>
              </div>
              <span className="text-[12px] font-data-mono text-outline">{dataPackages.length} Data Bundles</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
              {dataPackages.map((pkg) => (
                <div key={pkg.id} className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/40 space-y-3 flex flex-col justify-between hover:border-primary/40 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-data-mono font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                        ⭐ {pkg.points_required} Points
                      </span>
                      <span className="text-[10px] uppercase font-bold text-outline">
                        Stock: {pkg.quantity_available}
                      </span>
                    </div>
                    <h4 className="font-title-md font-bold text-on-surface text-[16px] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[18px]">wifi</span>
                      {pkg.name}
                    </h4>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed">{pkg.description}</p>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between text-[11px]">
                    <span className="text-primary font-bold">● {pkg.status}</span>
                    <span className="font-data-mono text-outline">Data Bundle #{pkg.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Airtime Top-Up Packages */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-outline-variant/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">call</span>
                </div>
                <div>
                  <h3 className="font-title-md font-bold text-on-surface text-[17px]">
                    Voice &amp; SMS Airtime Top-Ups
                  </h3>
                  <p className="text-[12px] text-on-surface-variant">
                    Direct airtime vouchers sent to citizen lines for call credit and emergency notifications.
                  </p>
                </div>
              </div>
              <span className="text-[12px] font-data-mono text-outline">{airtimePackages.length} Airtime Vouchers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
              {airtimePackages.map((pkg) => (
                <div key={pkg.id} className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/40 space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-data-mono font-bold bg-amber-500/10 text-amber-800 px-2.5 py-0.5 rounded-full">
                        ⭐ {pkg.points_required} Points
                      </span>
                      <span className="text-[10px] uppercase font-bold text-outline">
                        Stock: {pkg.quantity_available}
                      </span>
                    </div>
                    <h4 className="font-title-md font-bold text-on-surface text-[16px] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-600 text-[18px]">phone_in_talk</span>
                      {pkg.name}
                    </h4>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed">{pkg.description}</p>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between text-[11px]">
                    <span className="text-amber-800 font-bold">● {pkg.status}</span>
                    <span className="font-data-mono text-outline">Airtime #{pkg.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-outline-variant/60 flex items-center justify-between">
              <div>
                <h3 className="font-title-md font-bold text-on-surface text-[17px]">
                  Citizen Achievement Badges (`badges` table)
                </h3>
                <p className="text-[12px] text-on-surface-variant">
                  Milestones awarded to community members for continuous drain preservation and prompt reporting.
                </p>
              </div>
              <span className="text-[12px] font-data-mono text-outline">{badges.length} Badges</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
              {badges.map((b) => (
                <div key={b.id} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-700 flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[20px]">military_tech</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-title-sm font-bold text-on-surface text-[14px]">{b.name}</h4>
                    <p className="text-[12px] text-on-surface-variant">{b.description}</p>
                    <span className="text-[10px] font-data-mono text-primary font-bold block pt-1">
                      Criteria: {b.criteria}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Hotspots Grid */}
      {selectedTab === 'hotspots' && (
        wasteHotspots.length > 0 ? (
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
        ) : (
          <div className="text-center py-12 text-outline text-[13px] bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/60">
            No chronic waste hotspots detected across monitored drainage segments.
          </div>
        )
      )}

      {/* Tab 4: Waste Types & Material Classification */}
      {selectedTab === 'materials' && (
        <div className="space-y-6">
          {/* Summary metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
              <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Plastics &amp; Polymers</span>
              <div className="text-[28px] font-bold text-on-surface mt-1">{plasticPct}%</div>
              <span className="text-[12px] text-risk-critical font-bold mt-0.5 block">
                {(incidentCategories.plastic / 1000).toFixed(1)} Tons Logged
              </span>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
                <div className="bg-risk-critical h-1.5 rounded-full" style={{ width: `${plasticPct}%` }}></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
              <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Silt &amp; Soil Runoff</span>
              <div className="text-[28px] font-bold text-on-surface mt-1">{siltPct}%</div>
              <span className="text-[12px] text-risk-high font-bold mt-0.5 block">
                {(incidentCategories.silt / 1000).toFixed(1)} Tons in Conduits
              </span>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
                <div className="bg-risk-high h-1.5 rounded-full" style={{ width: `${siltPct}%` }}></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
              <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Organic &amp; Vegetative</span>
              <div className="text-[28px] font-bold text-on-surface mt-1">{organicPct}%</div>
              <span className="text-[12px] text-primary font-bold mt-0.5 block">
                {(incidentCategories.organic / 1000).toFixed(1)} Tons Recorded
              </span>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${organicPct}%` }}></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
              <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Other Refuse Material</span>
              <div className="text-[28px] font-bold text-primary mt-1">{otherPct}%</div>
              <span className="text-[12px] text-on-surface-variant font-medium mt-0.5 block">
                {(incidentCategories.other / 1000).toFixed(1)} Tons General Waste
              </span>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${otherPct}%` }}></div>
              </div>
            </div>
          </div>

          {/* Live Waste Types Database Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-outline-variant/60 flex items-center justify-between">
              <div>
                <h3 className="font-title-md font-bold text-on-surface text-[17px]">
                  Database Waste Types &amp; Material Classifications
                </h3>
                <p className="text-[12px] text-on-surface-variant">
                  Standardized material ontology stored in Supabase (`waste_types` table).
                </p>
              </div>
              <span className="text-[12px] font-data-mono text-outline">{wasteTypes.length} Material Types</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
              {wasteTypes.map((wt) => (
                <div key={wt.id} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-on-surface text-[14px]">{wt.name}</span>
                    <span className="text-[10px] font-data-mono px-2 py-0.5 rounded-full bg-surface-container-high text-outline">
                      {wt.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className={`px-2 py-0.5 rounded-md font-bold ${wt.recyclable ? 'bg-primary/10 text-primary' : 'bg-surface-container text-outline'}`}>
                      {wt.recyclable ? '✓ Recyclable' : 'Non-Recyclable'}
                    </span>
                    {wt.hazardous && (
                      <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-md font-bold">
                        ⚠️ Hazardous
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Disburse Data & Airtime Modal */}
      {disburseModalCitizen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="bg-primary px-6 py-4 text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[24px]">wifi_tethering</span>
                <div>
                  <h3 className="font-title-md font-bold text-[17px]">Send Data or Airtime Package</h3>
                  <p className="text-[11px] text-white/80">Credited directly to citizen's mobile line</p>
                </div>
              </div>
              <button
                onClick={() => setDisburseModalCitizen(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-body-sm">
              {/* Recipient Card */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase font-bold text-outline">Recipient Citizen</div>
                  <div className="font-bold text-on-surface text-[15px]">{disburseModalCitizen.userName}</div>
                  <div className="text-[12px] font-data-mono text-primary font-semibold mt-0.5">
                    📱 {disburseModalCitizen.phone}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase font-bold text-outline">Available Points</div>
                  <div className="font-data-mono text-[16px] font-bold text-primary">
                    ⭐ {disburseModalCitizen.rewardPoints} pts
                  </div>
                </div>
              </div>

              {/* Package Selector */}
              <div>
                <label className="block font-semibold text-on-surface mb-2 text-[13px]">
                  Select Telecom Package:
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {rewardCatalog.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    const isData = pkg.name.toLowerCase().includes('data') || pkg.name.toLowerCase().includes('mb') || pkg.name.toLowerCase().includes('gb');

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-primary/10 border-primary shadow-xs'
                            : 'bg-surface-container-low border-outline-variant/40 hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[16px] ${
                            isData ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-800'
                          }`}>
                            <span className="material-symbols-outlined">
                              {isData ? 'wifi' : 'call'}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-on-surface text-[13px]">{pkg.name}</div>
                            <div className="text-[11px] text-outline">{pkg.description}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-3">
                          <span className="font-data-mono font-bold text-primary text-[12px] block">
                            ⭐ {pkg.points_required} pts
                          </span>
                          <span className="text-[10px] text-outline font-medium">
                            {pkg.quantity_available} left
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Package Confirmation Details */}
              {selectedPackage && (
                <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 flex items-center justify-between text-[12px]">
                  <span className="text-on-surface">
                    Selected: <strong className="text-primary">{selectedPackage.name}</strong>
                  </span>
                  <span className="font-data-mono font-bold text-primary">
                    Points: ⭐ {selectedPackage.points_required} pts
                  </span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDisburseModalCitizen(null)}
                  className="px-4 py-2.5 rounded-xl text-on-surface-variant font-label-caps text-[12px] hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingDisbursement || !selectedPackage}
                  onClick={handleConfirmDisburse}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>{isSubmittingDisbursement ? 'Transmitting to Telco...' : 'Confirm & Disburse Package'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
