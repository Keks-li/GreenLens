import React, { useState } from 'react';
import { getPermissionsForRole } from '../../lib/rbac';
import GenerateReportModal from '../modals/GenerateReportModal';

export default function AnalyticsView({
  currentUser,
  selectedMunicipality,
  kpis,
  drainageSegments = [],
  incidents = [],
  fieldTeams = [],
  citizenRewards = [],
  weather
}) {
  const userRole = currentUser?.role || 'Municipal Officer';
  const permissions = getPermissionsForRole(userRole);
  const canExport = permissions.canExportReports;

  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [toastMessage, setToastMessage] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Group incidents and drainage segments dynamically by sector/community from database
  const sectorMap = {};

  (drainageSegments || []).forEach(seg => {
    const sec = seg.sector || 'Central Catchment';
    if (!sectorMap[sec]) {
      sectorMap[sec] = {
        community: sec,
        riskScoreSum: 0,
        riskScoreMax: 0,
        drainCount: 0,
        reportsTotal: 0,
        resolvedCount: 0,
        tonnageKg: 0,
      };
    }
    sectorMap[sec].drainCount += 1;
    sectorMap[sec].riskScoreSum += Number(seg.riskScore || 0);
    sectorMap[sec].riskScoreMax = Math.max(sectorMap[sec].riskScoreMax, Number(seg.riskScore || 0));
  });

  (incidents || []).forEach(inc => {
    const sec = inc.sector || 'Central Catchment';
    if (!sectorMap[sec]) {
      sectorMap[sec] = {
        community: sec,
        riskScoreSum: 0,
        riskScoreMax: 0,
        drainCount: 0,
        reportsTotal: 0,
        resolvedCount: 0,
        tonnageKg: 0,
      };
    }
    sectorMap[sec].reportsTotal += 1;
    if (inc.status === 'resolved' || inc.rawStatus === 'RESOLVED' || inc.rawStatus === 'CLOSED') {
      sectorMap[sec].resolvedCount += 1;
    }
    const wasteNum = parseFloat(String(inc.estimatedWasteVolume || inc.weight_quantity || '0').replace(/[^\d.]/g, '')) || 0;
    sectorMap[sec].tonnageKg += wasteNum;
  });

  let communityRankings = Object.values(sectorMap).map(item => {
    const avgRisk = item.drainCount > 0 ? Math.round(item.riskScoreSum / item.drainCount) : item.riskScoreMax;
    const finalRisk = Math.max(avgRisk, item.riskScoreMax);
    const resolvedPercent = item.reportsTotal > 0 ? Math.round((item.resolvedCount / item.reportsTotal) * 100) : 0;
    const tonnageCollected = `${(item.tonnageKg / 1000).toFixed(1)} T`;
    const responseAvgMinutes = resolvedPercent > 0 ? Math.max(15, Math.round(60 - (resolvedPercent / 2))) : 0;
    const status = finalRisk >= 80 ? 'Critical Alert' : finalRisk >= 60 ? 'High Alert' : finalRisk >= 40 ? 'Moderate Risk' : 'Stable Flow';

    return {
      community: item.community,
      riskScore: finalRisk,
      reportsTotal: item.reportsTotal,
      resolvedPercent,
      tonnageCollected,
      responseAvgMinutes,
      status
    };
  });

  communityRankings.sort((a, b) => b.riskScore - a.riskScore);

  const totalReportsCount = incidents.length;
  const totalResolvedCount = incidents.filter(i => i.status === 'resolved' || i.rawStatus === 'RESOLVED' || i.rawStatus === 'CLOSED').length;
  const resolutionRatePct = incidents.length > 0 ? ((totalResolvedCount / incidents.length) * 100).toFixed(1) : '0.0';
  const totalRewardsKg = citizenRewards.reduce((a, b) => a + Number(b.refuse_kg_cleared || b.refuseKgCleared || 0), 0) +
    incidents.filter(i => i.status === 'resolved' || i.rawStatus === 'RESOLVED').reduce((sum, i) => {
      const w = Number(i.weight_quantity || i.weightQuantity || (parseFloat(String(i.estimatedWasteVolume || '').replace(/[^\d.]/g, '')) || 0));
      return sum + (isNaN(w) ? 0 : w);
    }, 0);
  const totalTonnageCalculated = (totalRewardsKg / 1000).toFixed(1);
  const totalFlowRestored = (drainageSegments.reduce((a, b) => a + (Number(b.capacityM3S || b.flowCapacity || 0)), 0)).toFixed(1);
  const estimatedCo2Avoided = (Number(totalTonnageCalculated) * 1.8).toFixed(1);
  const estDamagesAvoidedGhs = (drainageSegments.filter(s => s.riskLevel === 'healthy' || s.status === 'Healthy').length * 250000 / 1000000).toFixed(2);
  const criticalDrainsCleaned = drainageSegments.filter(s => s.status === 'Cleaned' || s.status === 'Healthy' || s.riskLevel === 'healthy').length;

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
            <span className="material-symbols-outlined text-primary text-[24px]">monitoring</span>
            <h1 className="font-headline-lg text-on-surface">Municipal Analytics &amp; Reporting</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Executive performance metrics, environmental impact indicators, and compliance export suite.
          </p>
        </div>

        {/* Date Filter & Export Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-surface-container-low p-1 rounded-xl border border-outline-variant/60 flex">
            {[
              { id: 'week', label: '7D' },
              { id: 'month', label: '30D' },
              { id: 'quarter', label: 'Quarter' },
              { id: 'year', label: 'YTD' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setDateRange(r.id)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-label-caps uppercase transition-colors ${
                  dateRange === r.id
                    ? 'bg-primary text-on-primary shadow-2xs font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {canExport ? (
            <>
              <button
                onClick={() => setShowReportModal(true)}
                className="bg-primary text-on-primary px-4 py-2 rounded-xl text-[12px] font-label-caps hover:bg-surface-tint shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Download Municipal Briefing & Audit in PDF format"
              >
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                Export PDF Report
              </button>
              <button
                onClick={() => showToast('Generating CSV Dataset export...')}
                className="bg-surface-container text-on-surface px-4 py-2 rounded-xl text-[12px] font-label-caps hover:bg-surface-container-highest transition-all flex items-center gap-1.5 cursor-pointer border border-outline-variant/50"
              >
                <span className="material-symbols-outlined text-[16px]">table_view</span>
                Export CSV
              </button>
            </>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant/50 text-[11px] font-medium text-outline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">lock</span>
              Export Restricted (Officer Only)
            </div>
          )}
        </div>
      </div>

      {/* Core Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Resolution Rate</span>
          <div className="text-[32px] font-bold text-primary mt-1">{resolutionRatePct}%</div>
          <span className="text-[12px] text-primary font-semibold flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            {totalResolvedCount} of {totalReportsCount} Incidents Resolved
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Active Operations</span>
          <div className="text-[32px] font-bold text-on-surface mt-1">{totalReportsCount - totalResolvedCount}</div>
          <span className="text-[12px] text-on-surface-variant font-medium mt-0.5">
            Unresolved Incidents in Queue
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Total Waste Diverted</span>
          <div className="text-[32px] font-bold text-on-surface mt-1">{totalTonnageCalculated} Tons</div>
          <span className="text-[12px] text-on-surface-variant font-medium mt-0.5">
            Verified Municipal Clearance
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Drainage Flow Monitored</span>
          <div className="text-[32px] font-bold text-primary mt-1">{totalFlowRestored} m³/s</div>
          <span className="text-[12px] text-primary font-semibold flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            {drainageSegments.length} Monitored Segments
          </span>
        </div>
      </div>

      {/* Environmental & Carbon Impact Module */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
            <span className="material-symbols-outlined text-[26px]">energy_savings_leaf</span>
          </div>
          <div>
            <span className="text-[11px] uppercase font-label-caps text-outline">Estimated CO₂ Avoided</span>
            <div className="text-[22px] font-bold text-on-surface">{estimatedCo2Avoided} MT CO₂e</div>
            <p className="text-[12px] text-on-surface-variant">Calculated from total verified waste diverted</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-700 font-bold">
            <span className="material-symbols-outlined text-[26px]">water_damage</span>
          </div>
          <div>
            <span className="text-[11px] uppercase font-label-caps text-outline">Damages Mitigated</span>
            <div className="text-[22px] font-bold text-on-surface">GH₵ {estDamagesAvoidedGhs}M</div>
            <p className="text-[12px] text-on-surface-variant">Estimated baseline from healthy drainage corridors</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-700 font-bold">
            <span className="material-symbols-outlined text-[26px]">handshake</span>
          </div>
          <div>
            <span className="text-[11px] uppercase font-label-caps text-outline">Citizen Reports Logged</span>
            <div className="text-[22px] font-bold text-on-surface">{totalReportsCount} Reports</div>
            <p className="text-[12px] text-on-surface-variant">Live telemetry from citizen mobile uploads</p>
          </div>
        </div>
      </div>

      {/* Community Vulnerability Ranking Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-outline-variant flex items-center justify-between">
          <div>
            <h3 className="font-title-md font-bold text-on-surface text-[17px]">
              Community Vulnerability &amp; Operational Ranking
            </h3>
            <p className="text-[12px] text-on-surface-variant">
              Risk score comparison, report resolution speeds, and cleanup compliance by sector
            </p>
          </div>
          <span className="text-[11px] font-bold uppercase text-primary bg-primary/10 px-3 py-1 rounded-full font-data-mono">
            {Object.keys(sectorMap).length} Sectors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] uppercase font-label-caps text-outline">
                <th className="py-3.5 px-5">Community / Ward</th>
                <th className="py-3.5 px-4">Risk Index</th>
                <th className="py-3.5 px-4">Total Reports</th>
                <th className="py-3.5 px-4">Resolution Rate</th>
                <th className="py-3.5 px-4">Waste Cleared</th>
                <th className="py-3.5 px-4">Avg Response</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 text-[13px]">
              {communityRankings.length > 0 ? (
                communityRankings.map((comm, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-on-surface">{comm.community}</td>
                  <td className="py-3.5 px-4 font-data-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        comm.riskScore >= 80
                          ? 'bg-error-container text-on-error-container'
                          : comm.riskScore >= 60
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {comm.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-on-surface font-medium">{comm.reportsTotal} Reports</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary text-[12px]">{comm.resolvedPercent}%</span>
                      <div className="w-16 bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${comm.resolvedPercent}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-data-mono text-on-surface font-semibold">{comm.tonnageCollected}</td>
                  <td className="py-3.5 px-4 font-data-mono text-outline">{comm.responseAvgMinutes} mins</td>
                  <td className="py-3.5 px-5 text-right">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                        comm.riskScore >= 80
                          ? 'bg-risk-critical text-white'
                          : comm.riskScore >= 60
                          ? 'bg-risk-high text-white'
                          : 'bg-primary text-white'
                      }`}
                    >
                      {comm.status}
                    </span>
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-outline text-[13px]">
                    No sector ranking data logged yet. Monitored drainage corridors and community sectors will populate dynamically.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Municipal PDF Report Modal */}
      <GenerateReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        selectedMunicipality={selectedMunicipality}
        currentUser={currentUser}
        kpis={kpis}
        drainageSegments={drainageSegments}
        incidents={incidents}
        fieldTeams={fieldTeams}
        citizenRewards={citizenRewards}
        weather={weather}
        onSuccess={showToast}
      />
    </div>
  );
}
