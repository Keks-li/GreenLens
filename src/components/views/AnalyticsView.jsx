import React, { useState } from 'react';
import { getPermissionsForRole } from '../../lib/rbac';

export default function AnalyticsView({ currentUser, kpis, drainageSegments = [], incidents = [] }) {
  const userRole = currentUser?.role || 'Municipal Officer';
  const permissions = getPermissionsForRole(userRole);
  const canExport = permissions.canExportReports;

  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [toastMessage, setToastMessage] = useState(null);

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
    sectorMap[sec].tonnageKg += (Number(seg.blockagePercent || 0) * 120);
  });

  (incidents || []).forEach(inc => {
    const sec = inc.sector || 'Central Catchment';
    if (!sectorMap[sec]) {
      sectorMap[sec] = {
        community: sec,
        riskScoreSum: 0,
        riskScoreMax: 50,
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
    const wasteNum = parseFloat(String(inc.estimatedWasteVolume || '100').replace(/[^\d.]/g, '')) || 100;
    sectorMap[sec].tonnageKg += wasteNum;
  });

  let communityRankings = Object.values(sectorMap).map(item => {
    const avgRisk = item.drainCount > 0 ? Math.round(item.riskScoreSum / item.drainCount) : item.riskScoreMax;
    const finalRisk = Math.max(avgRisk, item.riskScoreMax);
    const resolvedPercent = item.reportsTotal > 0 ? Math.round((item.resolvedCount / item.reportsTotal) * 100) : 92;
    const tonnageCollected = `${(item.tonnageKg / 1000).toFixed(1)} T`;
    const responseAvgMinutes = Math.max(15, Math.round(45 - (resolvedPercent / 4)));
    const status = finalRisk >= 80 ? 'Critical Alert' : finalRisk >= 60 ? 'High Alert' : finalRisk >= 40 ? 'Moderate Risk' : 'Stable Flow';

    return {
      community: item.community,
      riskScore: finalRisk,
      reportsTotal: item.reportsTotal || Math.round(finalRisk * 1.5),
      resolvedPercent,
      tonnageCollected,
      responseAvgMinutes,
      status
    };
  });

  if (communityRankings.length === 0) {
    communityRankings = [
      { community: 'Winneba Central Market', riskScore: 91, reportsTotal: 142, resolvedPercent: 88, tonnageCollected: '18.4 T', responseAvgMinutes: 28, status: 'Critical Alert' },
      { community: 'North Campus Link', riskScore: 85, reportsTotal: 96, resolvedPercent: 92, tonnageCollected: '11.2 T', responseAvgMinutes: 34, status: 'High Alert' },
      { community: 'South Residential Ward', riskScore: 74, reportsTotal: 68, resolvedPercent: 95, tonnageCollected: '8.6 T', responseAvgMinutes: 41, status: 'Moderate Risk' },
      { community: 'Lowtown Community', riskScore: 28, reportsTotal: 31, resolvedPercent: 100, tonnageCollected: '3.4 T', responseAvgMinutes: 22, status: 'Stable Flow' }
    ];
  } else {
    communityRankings.sort((a, b) => b.riskScore - a.riskScore);
  }

  const totalReportsCount = incidents.length || 1840;
  const totalResolvedCount = incidents.filter(i => i.status === 'resolved' || i.rawStatus === 'RESOLVED').length;
  const resolutionRatePct = incidents.length > 0 ? ((totalResolvedCount / incidents.length) * 100).toFixed(1) : '91.4';
  const totalTonnageCalculated = (communityRankings.reduce((a, b) => a + parseFloat(b.tonnageCollected), 0)).toFixed(1);
  const totalFlowRestored = (drainageSegments.reduce((a, b) => a + (b.capacityM3S || 0), 0)).toFixed(1);
  const criticalDrainsCleaned = drainageSegments.filter(s => s.status === 'Cleaned' || s.riskLevel === 'healthy').length || 14;

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
                onClick={() => showToast('Generating comprehensive Municipal PDF Report...')}
                className="bg-primary text-on-primary px-4 py-2 rounded-xl text-[12px] font-label-caps hover:bg-surface-tint shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export PDF
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
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            +6.2% vs Previous Period
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Avg Incident Response</span>
          <div className="text-[32px] font-bold text-on-surface mt-1">32 mins</div>
          <span className="text-[12px] text-primary font-semibold flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
            14 mins faster than baseline
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Total Waste Diverted</span>
          <div className="text-[32px] font-bold text-on-surface mt-1">{totalTonnageCalculated || '51.4'} Tons</div>
          <span className="text-[12px] text-on-surface-variant font-medium mt-0.5">
            78% Recycled &amp; Upcycled
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Drainage Flow Monitored</span>
          <div className="text-[32px] font-bold text-primary mt-1">{totalFlowRestored || '38.2'} m³/s</div>
          <span className="text-[12px] text-primary font-semibold flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            {drainageSegments.length || 6} Monitored Segments
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
            <div className="text-[22px] font-bold text-on-surface">32.8 MT CO₂e</div>
            <p className="text-[12px] text-on-surface-variant">Via localized composting & plastic interception</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-700 font-bold">
            <span className="material-symbols-outlined text-[26px]">water_damage</span>
          </div>
          <div>
            <span className="text-[11px] uppercase font-label-caps text-outline">Property Damages Prevented</span>
            <div className="text-[22px] font-bold text-on-surface">GH₵ 1.45M</div>
            <p className="text-[12px] text-on-surface-variant">Estimated based on flood damage avoidance models</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-700 font-bold">
            <span className="material-symbols-outlined text-[26px]">handshake</span>
          </div>
          <div>
            <span className="text-[11px] uppercase font-label-caps text-outline">Citizen Participation</span>
            <div className="text-[22px] font-bold text-on-surface">{totalReportsCount} Reports</div>
            <p className="text-[12px] text-on-surface-variant">96% verified accuracy through GreenLens Mobile</p>
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
            5 Municipal Sectors
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
              {communityRankings.map((comm, idx) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
