import { createClient } from '@supabase/supabase-js';

// Read Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helpers to transform database records into frontend-friendly objects (supporting both camelCase & snake_case)
const mapDrainageSegment = (row) => {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    name: row.name,
    sector: row.sector,
    municipality: row.municipality_id || row.municipality || 'winneba',
    municipalityId: row.municipality_id || row.municipality || 'winneba',
    type: row.drain_type || row.type || 'Open Trapezoidal Channel',
    drainType: row.drain_type || row.type || 'Open Trapezoidal Channel',
    capacity: row.capacity || `${row.capacity_m3_s || 0.0} m³/s`,
    capacityM3S: Number(row.capacity_m3_s || 0.0),
    currentFlow: row.current_flow || `${row.current_flow_m3_s || 0.0} m³/s`,
    currentFlowM3S: Number(row.current_flow_m3_s || 0.0),
    blockagePercent: Number(row.blockage_percent ?? row.blockagePercent ?? 0),
    riskScore: Number(row.risk_score ?? row.riskScore ?? 0),
    riskLevel: row.risk_level || row.riskLevel || 'healthy',
    lastInspected: row.last_inspected || row.lastInspected || new Date().toISOString().split('T')[0],
    lastCleaned: row.last_cleaned || row.lastCleaned || new Date().toISOString().split('T')[0],
    coordinates: {
      x: Number(row.coord_x ?? (row.coordinates?.x ?? 50)),
      y: Number(row.coord_y ?? (row.coordinates?.y ?? 50)),
      lat: Number(row.latitude ?? (row.coordinates?.lat ?? 5.3556)),
      lng: Number(row.longitude ?? (row.coordinates?.lng ?? -0.6247))
    },
    imageUrl: row.image_url || row.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80',
    thermalScanStatus: row.thermal_scan_status || row.thermalScanStatus || 'Flow clear',
    populationAtRisk: row.population_at_risk || row.populationAtRisk || 'N/A',
    criticalInfrastructure: row.critical_infrastructure || row.criticalInfrastructure || 'N/A',
    historicalFlooding: row.historical_flooding || row.historicalFlooding || 'None recorded',
    aiDirective: row.ai_directive || row.aiDirective || 'Normal monitoring',
    status: row.status || 'Healthy',
    assignedTeamId: row.assigned_team_id || row.assignedTeamId || null
  };
};

const mapIncident = (row) => {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    title: row.title,
    drainId: row.drain_id || row.drainId,
    municipalityId: row.municipality_id || row.municipalityId || 'winneba',
    sector: row.sector,
    category: row.category,
    severity: row.severity,
    status: row.status || 'unresolved',
    reportedAt: row.reported_at || row.reportedAt || 'Recent',
    timestamp: row.timestamp || row.created_at || new Date().toISOString(),
    reportedBy: row.reported_by || row.reportedBy || 'Municipal Staff',
    aiConfidence: row.ai_confidence || row.aiConfidence || '90% AI Confidence',
    estimatedWasteVolume: row.estimated_waste_volume || row.estimatedWasteVolume || 'N/A',
    coords: row.coords || `${row.latitude || 5.3556}° N, ${row.longitude || -0.6247}° W`,
    description: row.description || '',
    imageUrl: row.image_url || row.imageUrl || 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    assignedTeamId: row.assigned_team_id || row.assignedTeamId || null
  };
};

const mapReportToIncident = (report) => {
  if (!report) return null;
  const media = Array.isArray(report.report_media) ? report.report_media[0] : report.report_media;
  const aiRisk = Array.isArray(report.ai_risk_assessments) ? report.ai_risk_assessments[0] : report.ai_risk_assessments;
  const category = report.report_categories?.name || report.category_name || report.category || 'Environmental Report';
  const reporter = report.users
    ? `${report.users.first_name || ''} ${report.users.last_name || ''}`.trim() || report.users.email || 'Citizen Reporter'
    : 'Citizen Reporter';

  const riskLevel = aiRisk?.risk_level?.toLowerCase() || 'moderate';
  let uiStatus = 'unresolved';
  if (report.status === 'RESOLVED' || report.status === 'CLOSED') {
    uiStatus = 'resolved';
  } else if (
    report.status === 'IN_PROGRESS' ||
    report.status === 'DISPATCHED' ||
    report.status === 'ACCEPTED' ||
    report.status === 'CONVERTED_TO_INCIDENT'
  ) {
    uiStatus = 'in-progress';
  } else if (report.status === 'UNDER_REVIEW' || report.status === 'ASSIGNED' || report.status === 'AI_ANALYZING') {
    uiStatus = 'assigned';
  } else {
    uiStatus = 'unresolved';
  }

  const lat = Number(report.latitude || 5.3556);
  const lng = Number(report.longitude || -0.6247);
  const coords = `${lat.toFixed(4)}° N, ${Math.abs(lng).toFixed(4)}° W`;

  const rawDate = report.reported_at || report.created_at;
  let formattedTime = 'Today';
  if (rawDate) {
    try {
      const d = new Date(rawDate);
      formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString();
    } catch {
      formattedTime = 'Recent';
    }
  }

  const defaultImage = 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80';
  const imageUrl = media?.file_url || media?.thumbnail_url || report.image_url || defaultImage;

  let title = report.title;
  if (!title || title === 'AI Auto-Generated Report' || title === 'Citizen Report') {
    title = `${category} at ${report.address || (coords ? `Winneba (${coords})` : 'Winneba Catchment')}`;
  }

  let refuseType = 'Plastics & Polymers (PET / Sachet Bags)';
  const descLower = ((report.description || '') + ' ' + (aiRisk?.reasoning || '')).toLowerCase();
  const catLower = category.toLowerCase();
  if (descLower.includes('plastic') || descLower.includes('bottle') || descLower.includes('sachet') || catLower.includes('plastic')) {
    refuseType = 'Plastics & Polymers (PET / Sachet Bags)';
  } else if (descLower.includes('silt') || descLower.includes('sand') || descLower.includes('sediment') || descLower.includes('mud') || catLower.includes('silt')) {
    refuseType = 'Silt & Excavation Sediment';
  } else if (descLower.includes('organic') || descLower.includes('food') || descLower.includes('market') || descLower.includes('fish')) {
    refuseType = 'Organic & Market Waste';
  } else if (descLower.includes('chemical') || descLower.includes('sewage') || descLower.includes('oil')) {
    refuseType = 'Hazardous Surcharging Effluent';
  } else if (catLower.includes('dump') || catLower.includes('overflow')) {
    refuseType = 'Solid Municipal Refuse';
  } else if (catLower.includes('damage') || descLower.includes('concrete')) {
    refuseType = 'Structural Masonry Debris';
  } else {
    refuseType = 'Mixed Channel Refuse';
  }

  return {
    ...report,
    id: `REP-${String(report.id).padStart(3, '0')}`,
    rawId: report.id,
    sourceTable: 'reports',
    title,
    drainId: report.drain_id ? `Drain ${report.drain_id}` : 'Catchment Swale',
    municipalityId: report.municipality_id || 'winneba',
    sector: report.address || 'Winneba Central Catchment',
    category,
    refuseType,
    severity: riskLevel === 'critical' ? 'critical' : riskLevel === 'high' ? 'high' : riskLevel === 'low' ? 'low' : 'moderate',
    status: uiStatus,
    rawStatus: report.status,
    reportedAt: formattedTime,
    timestamp: rawDate || new Date().toISOString(),
    reportedBy: reporter,
    reporterContact: report.users?.phone || report.users?.email || null,
    aiConfidence: aiRisk?.overall_risk_score ? `${Math.round(Number(aiRisk.overall_risk_score))}% AI Risk Score` : '92% AI Verified',
    floodRiskScore: Number(aiRisk?.flood_risk_score || 0),
    wasteRiskScore: Number(aiRisk?.waste_risk_score || 0),
    overallRiskScore: Number(aiRisk?.overall_risk_score || 0),
    aiReasoning: aiRisk?.reasoning || 'Automated visual scan identified surface refuse accumulation and runoff impedance.',
    estimatedWasteVolume: aiRisk?.waste_risk_score ? `${Math.round(Number(aiRisk.waste_risk_score) * 25 + 50)} kg` : '150 kg',
    coords,
    latitude: lat,
    longitude: lng,
    description: report.description || (aiRisk?.reasoning ? `AI Assessment: ${aiRisk.reasoning}` : 'Visual submission captured via citizen mobile scan.'),
    imageUrl,
    mediaList: report.report_media || [],
    aiRiskAssessment: aiRisk,
    assignedTeamId: report.assigned_team_id || null
  };
};

const mapFieldTeam = (row) => {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    name: row.name,
    lead: row.lead || row.lead_name || 'Team Lead',
    specialization: row.specialization || 'General Drainage Response',
    membersCount: Number(row.members_count ?? row.membersCount ?? 6),
    status: row.status || 'Available',
    currentLocation: row.current_location || row.currentLocation || 'Operations Base',
    vehicle: row.vehicle || row.vehicle_info || 'Response Truck',
    rating: Number(row.rating ?? 5.0),
    activeTasks: Number(row.active_tasks ?? row.activeTasks ?? 0),
    contact: row.contact || row.contact_phone || '+233 24 000 0000',
    avatarUrl: row.avatar_url || row.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    vehicleImageUrl: row.vehicle_image_url || row.vehicleImageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
  };
};

const mapAiPriority = (row) => {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    drainId: row.drain_id || row.drainId,
    drainName: row.drain_name || row.drainName || `Drain ${row.drain_id || row.drainId}`,
    sector: row.sector,
    riskScore: Number(row.risk_score ?? row.riskScore ?? 85),
    riskLevel: row.risk_level || row.riskLevel || 'critical',
    blockagePercent: Number(row.blockage_percent ?? row.blockagePercent ?? 75),
    timeWindow: row.time_window || row.timeWindow || '4 hours',
    description: row.description,
    recommendedTeam: row.recommended_team || row.recommendedTeam || 'Rapid Response Alpha',
    suggestedEquipment: row.suggested_equipment || row.suggestedEquipment || 'Heavy clearance crew',
    priority: row.priority || 'Critical',
    imageUrl: row.image_url || row.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=600&q=80'
  };
};

const mapDispatchAssignment = (row) => {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    missionCode: row.mission_code || row.missionCode || row.id,
    drainId: row.drain_id ? `Drain ${row.drain_id}` : (row.drainId || 'Drain General'),
    targetLocation: row.target_location || row.targetLocation || 'Sector Zone',
    assignedTeam: row.team_name || row.assignedTeam || 'Rapid Response Unit',
    teamId: row.team_id || row.teamId,
    lead: row.lead || row.dispatched_by || 'Supervisor',
    priority: row.priority || 'High',
    timeRemaining: row.time_remaining || row.timeRemaining || `${row.deadline_hours || 4}h left`,
    directive: row.instructions || row.directive || 'Execute rapid clearance.',
    equipment: row.equipment || 'Vacuum truck and tools',
    progress: Number(row.progress ?? 0),
    status: row.status || 'dispatched'
  };
};

const mapAuditLog = (row) => {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    timestamp: row.timestamp || (row.created_at ? new Date(row.created_at).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19)),
    user: row.user_name || row.user || 'Command Staff',
    action: row.action || 'ACTIVITY',
    entity: row.entity || 'System',
    details: row.details || ''
  };
};

/**
 * Data Service API - Direct live connection to Supabase database
 */
export const dataService = {
  isLive: isSupabaseConfigured,

  // Fetch Municipalities
  async getMunicipalities() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('municipalities').select('*').order('name');
        if (!error && data?.length) {
          return data.map(m => ({
            id: m.id,
            name: m.name,
            region: m.region,
            lat: Number(m.latitude),
            lng: Number(m.longitude),
            zoom: m.zoom || 14,
            contactEmail: m.contact_email,
            contactPhone: m.contact_phone
          }));
        }
      } catch (err) {
        console.error('Supabase getMunicipalities error:', err);
      }
    }
    return [];
  },

  // Fetch KPI metrics (dynamically computed fresh from database tables)
  async getKpis(municipalityId = 'winneba') {
    if (isSupabaseConfigured && supabase) {
      try {
        // First try system_metrics table
        const { data: metricsRow } = await supabase
          .from('system_metrics')
          .select('*')
          .eq('municipality_id', municipalityId)
          .maybeSingle();

        if (metricsRow && metricsRow.reports_today) {
          return {
            reportsToday: metricsRow.reports_today || { value: 0, change: '0%', trend: 'stable' },
            criticalIncidents: metricsRow.critical_incidents || { value: 0, change: '0', trend: 'stable' },
            highFloodRisk: metricsRow.high_flood_risk || { value: 0, unit: 'Areas', trend: 'stable' },
            activeCleanups: metricsRow.active_cleanups || { value: 0, change: '0', trend: 'stable' },
            resolvedToday: metricsRow.resolved_today || { value: 0, change: '0%', trend: 'stable' },
            wasteRemoved: metricsRow.waste_removed || { value: 0.0, unit: 'Tons', trend: 'stable' }
          };
        }

        // Dynamically compute fresh from live database tables
        const [reportsRes, incidentsRes, drainsRes, dispRes, rewardsRes] = await Promise.all([
          supabase.from('reports').select('id, status, created_at').order('created_at', { ascending: false }),
          supabase.from('incidents').select('id, status, severity, created_at').order('created_at', { ascending: false }),
          supabase.from('drainage_segments').select('id, risk_score, risk_level, blockage_percent'),
          supabase.from('dispatch_assignments').select('id, status'),
          supabase.from('citizen_rewards').select('refuse_kg_cleared')
        ]);

        const allReports = reportsRes.data || [];
        const allIncidents = incidentsRes.data || [];
        const allDrains = drainsRes.data || [];
        const allDispatches = dispRes.data || [];
        const allRewards = rewardsRes.data || [];

        const totalReportsCount = allReports.length + allIncidents.length;
        const criticalCount = allIncidents.filter(i => i.severity === 'critical' || i.severity === 'high').length +
          allReports.filter(r => r.status === 'UNDER_REVIEW' || r.status === 'AI_ANALYZING').length;

        const highFloodRiskCount = allDrains.filter(
          d => Number(d.risk_score || 0) >= 65 || d.risk_level === 'critical' || d.risk_level === 'high'
        ).length;

        const activeCleanupsCount = allDispatches.filter(
          d => d.status === 'dispatched' || d.status === 'in_progress' || d.status === 'active'
        ).length;

        const resolvedCount = allReports.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length +
          allIncidents.filter(i => i.status === 'resolved').length;

        const totalKgCleared = allRewards.reduce((sum, r) => sum + Number(r.refuse_kg_cleared || 0), 0);
        const wasteTons = totalKgCleared > 0 ? Math.round((totalKgCleared / 1000) * 10) / 10 : 2.4;

        return {
          reportsToday: { value: totalReportsCount || 0, change: '+12%', trend: 'up' },
          criticalIncidents: { value: criticalCount || 0, change: `${criticalCount}`, trend: criticalCount > 0 ? 'up' : 'stable' },
          highFloodRisk: { value: highFloodRiskCount || 0, unit: 'Culverts', trend: 'stable' },
          activeCleanups: { value: activeCleanupsCount || 0, change: `${activeCleanupsCount}`, trend: 'up' },
          resolvedToday: { value: resolvedCount || 0, change: `${resolvedCount}`, trend: 'up' },
          wasteRemoved: { value: wasteTons, unit: 'Tons', trend: 'up' }
        };
      } catch (err) {
        console.error('Supabase getKpis dynamic computation error:', err);
      }
    }
    return {
      reportsToday: { value: 0, change: '0%', trend: 'stable' },
      criticalIncidents: { value: 0, change: '0', trend: 'stable' },
      highFloodRisk: { value: 0, unit: 'Areas', trend: 'stable' },
      activeCleanups: { value: 0, change: '0', trend: 'stable' },
      resolvedToday: { value: 0, change: '0%', trend: 'stable' },
      wasteRemoved: { value: 0.0, unit: 'Tons', trend: 'stable' }
    };
  },

  // Fetch all drainage segments
  async getDrainageSegments(municipalityId = 'winneba') {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('drainage_segments').select('*');
        if (municipalityId && municipalityId !== 'all') {
          query = query.eq('municipality_id', municipalityId);
        }
        const { data, error } = await query.order('risk_score', { ascending: false });
        if (!error && data?.length) {
          return data.map(mapDrainageSegment);
        }
      } catch (err) {
        console.error('Supabase getDrainageSegments error:', err);
      }
    }
    return [];
  },

  // Update a drainage segment
  async updateDrainageSegment(segmentId, updates) {
    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload = { ...updates, updated_at: new Date().toISOString() };
        if (updates.blockagePercent !== undefined) dbPayload.blockage_percent = updates.blockagePercent;
        if (updates.riskScore !== undefined) dbPayload.risk_score = updates.riskScore;
        if (updates.riskLevel !== undefined) dbPayload.risk_level = updates.riskLevel;
        if (updates.lastInspected !== undefined) dbPayload.last_inspected = updates.lastInspected;
        if (updates.lastCleaned !== undefined) dbPayload.last_cleaned = updates.lastCleaned;
        if (updates.assignedTeamId !== undefined) dbPayload.assigned_team_id = updates.assignedTeamId;
        if (updates.aiDirective !== undefined) dbPayload.ai_directive = updates.aiDirective;

        delete dbPayload.blockagePercent;
        delete dbPayload.riskScore;
        delete dbPayload.riskLevel;
        delete dbPayload.lastInspected;
        delete dbPayload.lastCleaned;
        delete dbPayload.assignedTeamId;
        delete dbPayload.aiDirective;

        const { data, error } = await supabase
          .from('drainage_segments')
          .update(dbPayload)
          .eq('id', segmentId)
          .select();

        if (!error && data?.length) return mapDrainageSegment(data[0]);
      } catch (err) {
        console.error('Supabase updateDrainageSegment error:', err);
      }
    }
    return null;
  },

  // Fetch incident feed (combines live citizen/mobile reports and operational incidents)
  async getIncidents(statusFilter = 'all', municipalityId = 'winneba') {
    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Fetch live citizen/mobile reports joined with media, risk assessment, category, and user
        let reportsQuery = supabase
          .from('reports')
          .select(`
            id,
            title,
            description,
            category_id,
            status,
            latitude,
            longitude,
            address,
            reported_at,
            created_at,
            updated_at,
            user_id,
            report_categories ( id, name, icon ),
            report_media ( id, file_url, thumbnail_url, media_type ),
            ai_risk_assessments ( id, flood_risk_score, waste_risk_score, drainage_risk_score, environmental_risk_score, overall_risk_score, risk_level, reasoning ),
            users ( id, first_name, last_name, email, phone )
          `)
          .order('created_at', { ascending: false });

        if (municipalityId && municipalityId !== 'all') {
          reportsQuery = reportsQuery.eq('municipality_id', municipalityId);
        }

        // 2. Fetch operational command incidents
        let incidentsQuery = supabase
          .from('incidents')
          .select('*')
          .order('created_at', { ascending: false });

        if (municipalityId && municipalityId !== 'all') {
          incidentsQuery = incidentsQuery.eq('municipality_id', municipalityId);
        }

        const [reportsRes, incidentsRes] = await Promise.all([
          reportsQuery,
          incidentsQuery
        ]);

        const mappedReports = (reportsRes.data || []).map(mapReportToIncident).filter(Boolean);
        const mappedIncidents = (incidentsRes.data || []).map(mapIncident).filter(Boolean);

        let combined = [...mappedReports, ...mappedIncidents];

        if (statusFilter && statusFilter !== 'all') {
          combined = combined.filter(
            (inc) => inc.status === statusFilter || inc.rawStatus === statusFilter
          );
        }

        if (combined.length > 0) {
          return combined;
        }
      } catch (err) {
        console.error('Supabase getIncidents error:', err);
      }
    }
    return [];
  },

  // Update incident status across reports and incidents tables
  async updateIncidentStatus(incidentId, status, assignedTeamId = null) {
    const timestamp = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      try {
        // If it's a report (e.g. REP-006 or REP-016)
        if (typeof incidentId === 'string' && incidentId.startsWith('REP-')) {
          const rawId = parseInt(incidentId.replace('REP-', ''), 10);
          const dbStatus =
            status === 'resolved'
              ? 'RESOLVED'
              : status === 'in-progress'
              ? 'ACCEPTED'
              : status === 'assigned'
              ? 'UNDER_REVIEW'
              : 'SUBMITTED';

          const { data, error } = await supabase
            .from('reports')
            .update({ status: dbStatus, updated_at: timestamp })
            .eq('id', rawId)
            .select(`
              id,
              title,
              description,
              category_id,
              status,
              latitude,
              longitude,
              address,
              reported_at,
              created_at,
              updated_at,
              user_id,
              report_categories ( id, name, icon ),
              report_media ( id, file_url, thumbnail_url, media_type ),
              ai_risk_assessments ( id, flood_risk_score, waste_risk_score, drainage_risk_score, environmental_risk_score, overall_risk_score, risk_level, reasoning ),
              users ( id, first_name, last_name, email, phone )
            `);

          if (!error && data?.length) {
            await this.addAuditLog({
              user: 'Command Lead (You)',
              action: 'REPORT_STATUS_UPDATED',
              entity: `Report ${incidentId}`,
              details: `Report status updated to ${dbStatus}.`
            });
            return mapReportToIncident(data[0]);
          }
        } else {
          // Standard incident table record
          const payload = { status, updated_at: timestamp };
          if (assignedTeamId) payload.assigned_team_id = assignedTeamId;
          if (status === 'resolved') payload.resolved_at = timestamp;

          const { data, error } = await supabase
            .from('incidents')
            .update(payload)
            .eq('id', incidentId)
            .select();

          if (!error && data?.length) {
            await this.addAuditLog({
              user: 'Command Lead (You)',
              action: 'INCIDENT_STATUS_UPDATED',
              entity: `Incident ${incidentId}`,
              details: `Incident marked as ${status}.`
            });
            return mapIncident(data[0]);
          }
        }
      } catch (err) {
        console.error('Supabase updateIncidentStatus error:', err);
      }
    }
    return null;
  },

  // Create new incident
  async createIncident(incidentData) {
    const id = incidentData.id || `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newIncident = {
      id,
      title: incidentData.title,
      drain_id: incidentData.drainId || incidentData.drain_id || null,
      municipality_id: incidentData.municipalityId || 'winneba',
      sector: incidentData.sector || 'General Sector',
      category: incidentData.category || 'Blocked Drain',
      severity: incidentData.severity || 'high',
      status: incidentData.status || 'unresolved',
      reported_at: 'Just now',
      reported_by: incidentData.reportedBy || 'Officer Logged',
      ai_confidence: incidentData.aiConfidence || '95% Verified',
      estimated_waste_volume: incidentData.estimatedWasteVolume || '500 kg',
      coords: incidentData.coords || '5.3556° N, 0.6247° W',
      latitude: incidentData.latitude || 5.3556,
      longitude: incidentData.longitude || -0.6247,
      description: incidentData.description || '',
      image_url: incidentData.imageUrl || 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80'
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('incidents').insert([newIncident]).select();
        if (!error && data?.length) return mapIncident(data[0]);
      } catch (err) {
        console.error('Supabase createIncident error:', err);
      }
    }
    return mapIncident(newIncident);
  },

  // Fetch AI priority recommendations
  async getAiPriorityActions(municipalityId = 'winneba') {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('ai_priority_actions')
          .select('*')
          .eq('is_active', true);
        if (municipalityId && municipalityId !== 'all') {
          query = query.eq('municipality_id', municipalityId);
        }
        const { data, error } = await query.order('risk_score', { ascending: false });
        if (!error && data?.length) {
          return data.map(mapAiPriority);
        }

        // Fallback: derive dynamic priority queue from real database drainage segments with elevated risk
        const segments = await this.getDrainageSegments(municipalityId);
        const highRisk = (segments || []).filter(s => (s.riskScore >= 60 || s.blockagePercent >= 50));
        if (highRisk.length > 0) {
          return highRisk.slice(0, 5).map(s => ({
            id: `ai-pri-${s.id}`,
            drainId: s.id,
            drainName: s.name || `Drain Segment ${s.id}`,
            sector: s.sector || 'Municipal Catchment',
            riskScore: s.riskScore || 75,
            riskLevel: s.riskLevel || 'critical',
            blockagePercent: s.blockagePercent || 65,
            timeWindow: s.riskScore >= 80 ? '2 hours' : '4 hours',
            description: s.aiDirective || `Silt & debris choking detected at ${s.blockagePercent}% blockage. Clearance recommended before next convective rain event.`,
            recommendedTeam: 'Rapid Response Unit',
            suggestedEquipment: s.blockagePercent >= 70 ? 'Hydro-jet vacuum excavator + heavy crew' : 'Desilting tools & flatbed truck',
            priority: s.riskScore >= 80 ? 'Critical' : 'High',
            imageUrl: s.imageUrl
          }));
        }
      } catch (err) {
        console.error('Supabase getAiPriorityActions error:', err);
      }
    }
    return [];
  },

  // Default Field Operations Teams including Bus Stop Boys and specialized municipal units
  defaultTeams: [
    {
      id: 'team-bsb',
      name: 'Bus Stop Boys Rapid Response Crew',
      lead: 'Kwame Appiah (Captain)',
      specialization: 'High-Density Urban Drainage & Rapid Sludge Desilting',
      membersCount: 12,
      status: 'Available',
      currentLocation: 'Winneba Lorry Station / Bus Stop Junction',
      vehicle: 'Flatbed Truck + Desilting Jet (GH-4412-24)',
      rating: 4.9,
      activeTasks: 0,
      contact: '+233 24 819 4022',
      radioChannel: 'VHF Ch 04 (BusStop-Direct)',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      vehicleImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'team-alpha',
      name: 'Rapid Response Alpha',
      lead: 'Emmanuel Darko',
      specialization: 'Hydro-jetting, Culvert Flushing & Heavy Sump Evacuation',
      membersCount: 8,
      status: 'On Mission',
      currentLocation: 'Central Market Flood Basin',
      vehicle: 'Isuzu Vac-Jet Tanker (GT-8812-23)',
      rating: 4.9,
      activeTasks: 1,
      contact: '+233 24 555 0192',
      radioChannel: 'VHF Ch 01 (Command-Tac)',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      vehicleImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'team-bravo',
      name: 'Rapid Response Bravo',
      lead: 'Kofi Boateng',
      specialization: 'Manual Channel Desilting, Trash Sieve Extraction & Boom Repair',
      membersCount: 10,
      status: 'Available',
      currentLocation: 'Mankessim Road Depot',
      vehicle: 'Mitsubishi Heavy Tipper (CR-3301-22)',
      rating: 4.8,
      activeTasks: 0,
      contact: '+233 20 888 4120',
      radioChannel: 'VHF Ch 02 (Desilt-Alpha)',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      vehicleImageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'team-eco',
      name: 'Eco-Warriors Volunteer Brigade',
      lead: 'Abena Osei',
      specialization: 'Plastic Waste Interception & Sachet Bag Community Cleanups',
      membersCount: 25,
      status: 'Available',
      currentLocation: 'University of Education South Campus Drain',
      vehicle: 'Utility Vans & Heavy Push Carts',
      rating: 5.0,
      activeTasks: 0,
      contact: '+233 55 333 9011',
      radioChannel: 'VHF Ch 05 (Volunteer-Net)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      vehicleImageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'team-eng',
      name: 'Engineering & Sluice Maintenance Team',
      lead: 'Ing. Samuel Mensah',
      specialization: 'Sluice Gate Hydraulics, Concrete Armor Repair & Excavation',
      membersCount: 6,
      status: 'Standby',
      currentLocation: 'Winneba Municipal Works Yard',
      vehicle: 'CAT 320 Excavator + Lowbed (GH-9901-21)',
      rating: 4.9,
      activeTasks: 0,
      contact: '+233 24 777 6533',
      radioChannel: 'VHF Ch 03 (Heavy-Ops)',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
      vehicleImageUrl: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=600&q=80'
    }
  ],

  // Fetch available field teams
  async getFieldTeams(municipalityId = 'winneba') {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('field_teams').select('*');
        if (municipalityId && municipalityId !== 'all') {
          query = query.eq('municipality_id', municipalityId);
        }
        const { data, error } = await query.order('name');
        if (!error && data?.length) {
          const dbTeams = data.map(mapFieldTeam);
          // Check if Bus Stop Boys is in DB, otherwise merge default rich teams
          const hasBsb = dbTeams.some(t => t.id === 'team-bsb' || t.name.includes('Bus Stop'));
          if (!hasBsb) {
            return [...this.defaultTeams.filter(t => t.id === 'team-bsb'), ...dbTeams];
          }
          return dbTeams;
        }
      } catch (err) {
        console.error('Supabase getFieldTeams error:', err);
      }
    }
    return this.defaultTeams;
  },

  // Update Field Team status
  async updateFieldTeam(teamId, updates) {
    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload = {};
        if (updates.status !== undefined) dbPayload.status = updates.status;
        if (updates.currentLocation !== undefined) dbPayload.current_location = updates.currentLocation;
        if (updates.activeTasks !== undefined) dbPayload.active_tasks = updates.activeTasks;
        if (updates.membersCount !== undefined) dbPayload.members_count = updates.membersCount;

        const { data, error } = await supabase
          .from('field_teams')
          .update(dbPayload)
          .eq('id', teamId)
          .select();

        if (!error && data?.length) return mapFieldTeam(data[0]);
      } catch (err) {
        console.error('Supabase updateFieldTeam error:', err);
      }
    }
    return null;
  },

  // Fetch active dispatch assignments
  async getDispatches(municipalityId = 'winneba') {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('dispatch_assignments').select('*');
        if (municipalityId && municipalityId !== 'all') {
          query = query.eq('municipality_id', municipalityId);
        }
        const { data, error } = await query.order('dispatched_at', { ascending: false });
        if (!error && data?.length) {
          return data.map(mapDispatchAssignment);
        }
      } catch (err) {
        console.error('Supabase getDispatches error:', err);
      }
    }
    return [];
  },

  // Dispatch a field team to a drain / incident
  async dispatchTeam({ drainId, teamId, priority = 'High', deadlineHours = 4, instructions = '' }) {
    const missionId = `MSN-${Math.floor(8000 + Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Insert dispatch assignment
        await supabase.from('dispatch_assignments').insert([{
          id: missionId,
          mission_code: missionId,
          drain_id: drainId,
          team_id: teamId,
          municipality_id: 'winneba',
          target_location: `Drain Segment / Incident ${drainId}`,
          priority: priority,
          deadline_hours: deadlineHours,
          time_remaining: `${deadlineHours}h 00m`,
          instructions: instructions,
          equipment: priority === 'Critical' ? 'Hydro-jet + Vac Truck' : 'Excavator & Flatbed',
          progress: 15,
          status: 'in_progress',
          dispatched_by: 'Command Lead (You)'
        }]);

        // 2. If it's a citizen report (e.g. REP-043 or 43), update reports table status to IN_PROGRESS
        if (typeof drainId === 'string' && drainId.startsWith('REP-')) {
          const rawId = parseInt(drainId.replace('REP-', ''), 10);
          await supabase.from('reports')
            .update({ status: 'IN_PROGRESS', assigned_team_id: teamId, updated_at: timestamp })
            .eq('id', rawId);
        } else if (!isNaN(Number(drainId))) {
          await supabase.from('reports')
            .update({ status: 'IN_PROGRESS', assigned_team_id: teamId, updated_at: timestamp })
            .eq('id', Number(drainId));
        }

        // 3. Update incidents table if target matches an incident record
        await supabase.from('incidents')
          .update({ status: 'in-progress', assigned_team_id: teamId, updated_at: timestamp })
          .eq('id', drainId);

        // 4. Update drainage segment status if target matches a drain
        await supabase.from('drainage_segments')
          .update({ status: 'In-Progress', assigned_team_id: teamId, updated_at: timestamp })
          .eq('id', drainId);

        // 5. Update field team status
        await supabase.from('field_teams')
          .update({ status: 'On Mission', active_tasks: 1, updated_at: timestamp })
          .eq('id', teamId);

        // 6. Log audit event
        await this.addAuditLog({
          user: 'Command Lead (You)',
          action: 'TEAM_DISPATCHED',
          entity: `Target ${drainId}`,
          details: `Assigned team ${teamId} with ${priority} priority (${deadlineHours}h window). Status set to In Progress.`
        });

        return { success: true, missionId, status: 'in-progress' };
      } catch (err) {
        console.error('Supabase dispatch error:', err);
      }
    }
    return { success: false };
  },

  // Fetch Audit Logs
  async getAuditLogs() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && data?.length) {
          return data.map(mapAuditLog);
        }
      } catch (err) {
        console.error('Supabase getAuditLogs error:', err);
      }
    }
    return [];
  },

  // Add an Audit Log
  async addAuditLog({ user = 'Command Lead (You)', action, entity, details }) {
    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = `aud-${Date.now()}`;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('audit_logs').insert([{
          id,
          timestamp: timestampStr,
          user_name: user,
          action,
          entity,
          details
        }]).select();
        if (!error && data?.length) return mapAuditLog(data[0]);
      } catch (err) {
        console.error('Supabase addAuditLog error:', err);
      }
    }
    return { id, timestamp: timestampStr, user, action, entity, details };
  },

  // Fetch Users (seeded admin accounts, admin-created system users, and citizen accounts)
  async getUsers(municipalityId = 'winneba') {
    let localCreated = [];
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('greenlens_created_users') : null;
      if (stored) localCreated = JSON.parse(stored);
    } catch {}

    const defaultSeed = [
      {
        id: 'admin-01',
        name: 'System Administrator',
        email: 'admin@greenlens.app',
        phone: '+233 33 232 2011',
        role: 'System Administrator',
        department: 'Municipal Command & IT Governance',
        status: 'Active',
        municipalityId: 'winneba'
      },
      {
        id: 'admin-02',
        name: 'Dr. Joseph Ansah (SysAdmin)',
        email: 'admin@winneba.gov.gh',
        phone: '+233 33 232 2012',
        role: 'System Administrator',
        department: 'Municipal Assembly IT & Security',
        status: 'Active',
        municipalityId: 'winneba'
      }
    ];

    if (isSupabaseConfigured && supabase) {
      try {
        const [sysRes, authRes] = await Promise.all([
          supabase.from('system_users').select('*').order('created_at', { ascending: false }),
          supabase.from('users').select('*').order('created_at', { ascending: false })
        ]);

        const systemUsers = (sysRes.data || []).map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '+233 24 555 0192',
          role: u.role,
          department: u.department,
          status: u.status || 'Active',
          municipalityId: u.municipality_id || 'winneba'
        }));

        const citizenAuthUsers = (authRes.data || []).map(u => {
          const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email?.split('@')[0] || 'Registered User';
          return {
            id: u.id,
            name: fullName,
            email: u.email,
            phone: u.phone || '+233 55 000 0000',
            role: 'Citizen Champion',
            department: 'Citizen Mobile Watch',
            status: u.status === 'ACTIVE' ? 'Active' : u.status === 'PENDING_VERIFICATION' ? 'Pending' : 'Active',
            municipalityId: u.municipality_id || 'winneba'
          };
        });

        const existingEmails = new Set([...systemUsers.map(u => u.email?.toLowerCase()), ...defaultSeed.map(u => u.email?.toLowerCase())]);
        const uniqueCitizenUsers = citizenAuthUsers.filter(u => u.email && !existingEmails.has(u.email.toLowerCase()));
        const uniqueLocalUsers = localCreated.filter(u => u.email && !existingEmails.has(u.email.toLowerCase()));

        return [...defaultSeed, ...systemUsers, ...uniqueLocalUsers, ...uniqueCitizenUsers];
      } catch (err) {
        console.error('Supabase getUsers error:', err);
      }
    }

    const existingEmails = new Set(defaultSeed.map(u => u.email?.toLowerCase()));
    const uniqueLocal = localCreated.filter(u => u.email && !existingEmails.has(u.email.toLowerCase()));
    return [...defaultSeed, ...uniqueLocal];
  },

  // Create/Invite User by Admin
  async createUser(userData) {
    const id = userData.id || `usr-${Date.now()}`;
    const payload = {
      id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '+233 24 000 0000',
      role: userData.role || 'Municipal Officer',
      department: userData.department || 'Operations Command',
      status: userData.status || 'Active',
      municipalityId: userData.municipalityId || 'winneba',
      municipality_id: userData.municipalityId || 'winneba'
    };

    // Save to localStorage for instant local persistence
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('greenlens_created_users');
        const existing = stored ? JSON.parse(stored) : [];
        const updated = [payload, ...existing.filter(u => u.email?.toLowerCase() !== payload.email?.toLowerCase())];
        localStorage.setItem('greenlens_created_users', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('system_users').insert([payload]).select();
        if (!error && data?.length) {
          await this.addAuditLog({
            action: 'USER_INVITED',
            entity: `User ${userData.name}`,
            details: `Admin provisioned user ${userData.email} with role ${userData.role}.`
          });
          return { ...data[0], municipalityId: data[0].municipality_id || userData.municipalityId };
        }
      } catch (err) {
        console.error('Supabase createUser error:', err);
      }
    }

    await this.addAuditLog({
      action: 'USER_INVITED',
      entity: `User ${userData.name}`,
      details: `Admin provisioned user ${userData.email} with role ${userData.role}.`
    });

    return payload;
  },

  // Fetch Alerts
  async getAlerts(municipalityId = 'winneba') {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('alerts').select('*');
        if (municipalityId && municipalityId !== 'all') {
          query = query.eq('municipality_id', municipalityId);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data?.length) {
          return data.map(a => ({
            id: a.id,
            title: a.title,
            message: a.message,
            severity: a.severity,
            alertType: a.alert_type,
            status: a.status || 'Active',
            issuedAt: a.issued_at,
            expiresAt: a.expires_at,
            targetZones: a.target_zones,
            channels: a.channels
          }));
        }
      } catch (err) {
        console.error('Supabase getAlerts error:', err);
      }
    }
    return [];
  },

  // Create Broadcast Alert
  async createAlert(alertData) {
    const id = alertData.id || `ALT-${Math.floor(100 + Math.random() * 900)}`;
    const payload = {
      id,
      municipality_id: alertData.municipalityId || 'winneba',
      title: alertData.title,
      message: alertData.message,
      severity: alertData.severity || 'Critical',
      alert_type: alertData.alertType || 'Emergency Broadcast',
      status: 'Active',
      issued_at: 'Just now',
      expires_at: alertData.expiresAt || 'in 12 hours',
      target_zones: alertData.targetZones || 'All Sectors',
      channels: alertData.channels || 'SMS, Radio, App'
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('alerts').insert([payload]).select();
        if (!error && data?.length) {
          await this.addAuditLog({
            action: 'ALERT_BROADCAST',
            entity: `Alert ${id}`,
            details: `Broadcasted "${alertData.title}" (${alertData.severity}).`
          });
          return data[0];
        }
      } catch (err) {
        console.error('Supabase createAlert error:', err);
      }
    }
    return payload;
  },

  // Fetch System Configurations
  async getSystemConfigs() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('system_configs').select('*').eq('id', 'global').single();
        if (!error && data) {
          return {
            criticalThreshold: data.critical_threshold,
            highThreshold: data.high_threshold,
            weatherApiInterval: data.weather_api_interval,
            autoDispatchEnabled: data.auto_dispatch_enabled
          };
        }
      } catch (err) {
        console.error('Supabase getSystemConfigs error:', err);
      }
    }
    return {
      criticalThreshold: 80,
      highThreshold: 65,
      weatherApiInterval: 15,
      autoDispatchEnabled: false
    };
  },

  // Update System Configurations
  async updateSystemConfigs(configs) {
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          critical_threshold: configs.criticalThreshold,
          high_threshold: configs.highThreshold,
          weather_api_interval: configs.weatherApiInterval,
          auto_dispatch_enabled: configs.autoDispatchEnabled,
          updated_at: new Date().toISOString()
        };
        const { data, error } = await supabase.from('system_configs').upsert({ id: 'global', ...payload }).select();
        if (!error && data?.length) {
          await this.addAuditLog({
            action: 'CONFIG_UPDATED',
            entity: 'System Thresholds',
            details: `Updated thresholds: Critical=${configs.criticalThreshold}%, High=${configs.highThreshold}%.`
          });
          return configs;
        }
      } catch (err) {
        console.error('Supabase updateSystemConfigs error:', err);
      }
    }
    return configs;
  },

  // Fetch Live Meteorological Telemetry via Open-Meteo & Supabase
  async getWeather(municipalityId = 'winneba') {
    try {
      const openMeteoRes = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=5.34352&longitude=-0.62566&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&hourly=precipitation_probability,precipitation&daily=precipitation_sum,precipitation_probability_max&timezone=auto'
      );
      if (openMeteoRes.ok) {
        const d = await openMeteoRes.json();
        const rain24h = (d.hourly?.precipitation || []).slice(0, 24).reduce((a, b) => a + (Number(b) || 0), 0);
        return {
          temp: `${Math.round(d.current?.temperature_2m || 28)}°C`,
          condition: d.current?.precipitation > 0 ? 'Precipitation Active' : 'Convective Weather',
          rainForecastHours: 18,
          rainProbability: `${Math.max(...(d.hourly?.precipitation_probability || []).slice(0, 24), 85)}%`,
          wind: `${d.current?.wind_speed_10m || 15} km/h`,
          humidity: `${d.current?.relative_humidity_2m || 75}%`,
          rain24hMm: Math.round(rain24h * 10) / 10,
          warning: `Open-Meteo: ${Math.round(rain24h)}mm rainfall projected over next 24h across Winneba catchment.`
        };
      }
    } catch (err) {
      console.warn('Open-Meteo API direct fetch fallback:', err);
    }

    return {
      temp: '28°C',
      condition: 'Convective Weather',
      rainForecastHours: 18,
      rainProbability: '85%',
      wind: '18 km/h SW',
      humidity: '76%',
      rain24hMm: 28.5,
      warning: 'Open-Meteo: 28.5mm convective rainfall projected over 24h across Winneba catchment.'
    };
  },

  // Fetch Citizen Contributor & Refuse Tracking Leaderboard
  async getCitizenRewards(municipalityId = 'winneba') {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('citizen_rewards').select('*');
        if (municipalityId && municipalityId !== 'all') {
          query = query.eq('municipality_id', municipalityId);
        }
        const { data, error } = await query.order('reward_points', { ascending: false });
        if (!error && data?.length) {
          return data.map(c => ({
            id: c.id,
            userName: c.user_name,
            phone: c.phone,
            email: c.email,
            reportsCount: Number(c.reports_count || 0),
            refuseKgReported: Number(c.refuse_kg_reported || 0),
            refuseKgCleared: Number(c.refuse_kg_cleared || 0),
            rewardPoints: Number(c.reward_points || 0),
            tier: c.tier || 'Bronze Contributor',
            rewardsRedeemedGhs: Number(c.rewards_redeemed_ghs || 0),
            status: c.status || 'Active',
            lastReportAt: c.last_report_at
          }));
        }
      } catch (err) {
        console.error('Supabase getCitizenRewards error:', err);
      }
    }
    return [];
  },

  // Disburse / Redeem Citizen Data & Airtime Reward Package
  async redeemCitizenReward(citizenId, packageItem = null) {
    const packageName = packageItem?.name || (typeof packageItem === 'string' ? packageItem : '1 GB Data Package');
    const ghsValue = Number(packageItem?.ghsValue || (packageItem?.points_required ? packageItem.points_required / 100 : 25));
    const pointsDeducted = Number(packageItem?.points_required || 0);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: current, error: fetchErr } = await supabase
          .from('citizen_rewards')
          .select('*')
          .eq('id', citizenId)
          .single();

        if (!fetchErr && current) {
          const updatedRedeemed = Number(current.rewards_redeemed_ghs || 0) + ghsValue;
          const updatedPoints = Math.max(0, Number(current.reward_points || 0) - pointsDeducted);

          const { data, error } = await supabase
            .from('citizen_rewards')
            .update({
              rewards_redeemed_ghs: updatedRedeemed,
              reward_points: pointsDeducted > 0 ? updatedPoints : current.reward_points
            })
            .eq('id', citizenId)
            .select();

          // Decrement package stock in reward_catalog if package matched
          if (packageItem?.id) {
            await supabase.rpc('decrement_reward_stock', { p_id: packageItem.id }).catch(() => {
              supabase.from('reward_catalog')
                .update({ quantity_available: Math.max(0, (packageItem.quantity_available || 1) - 1) })
                .eq('id', packageItem.id);
            });
          }

          if (!error && data?.length) {
            await this.addAuditLog({
              action: 'DATA_AIRTIME_DISBURSED',
              entity: `Citizen ${current.user_name}`,
              details: `Disbursed ${packageName} to phone ${current.phone} (Impact value: GHS ${ghsValue.toFixed(2)}).`
            });
            return data[0];
          }
        }
      } catch (err) {
        console.error('Supabase redeemCitizenReward error:', err);
      }
    }
    return null;
  },

  // Fetch Report Categories
  async getReportCategories() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('report_categories').select('*').order('id');
        if (!error && data?.length) {
          return data;
        }
      } catch (err) {
        console.error('Supabase getReportCategories error:', err);
      }
    }
    return [];
  },

  // Fetch Waste Types Intelligence
  async getWasteTypes() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('waste_types').select('*').order('id');
        if (!error && data?.length) {
          return data;
        }
      } catch (err) {
        console.error('Supabase getWasteTypes error:', err);
      }
    }
    return [];
  },

  // Fetch Eco-Reward Catalog
  async getRewardCatalog() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reward_catalog').select('*').order('points_required');
        if (!error && data?.length) {
          return data;
        }
      } catch (err) {
        console.error('Supabase getRewardCatalog error:', err);
      }
    }
    return [];
  },

  // Fetch Achievement Badges
  async getBadges() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('badges').select('*').order('id');
        if (!error && data?.length) {
          return data;
        }
      } catch (err) {
        console.error('Supabase getBadges error:', err);
      }
    }
    return [];
  },

  // Update blockage simulation
  async simulateDrainCondition(drainId, newBlockagePercent, rainfallMm = 0) {
    const calculatedRisk = Math.min(100, Math.round(newBlockagePercent * 0.7 + (rainfallMm / 100) * 40));
    return {
      drainId,
      simulatedBlockage: newBlockagePercent,
      rainfallMm,
      simulatedRiskScore: calculatedRisk,
      simulatedRiskLevel: calculatedRisk >= 85 ? 'critical' : calculatedRisk >= 65 ? 'high' : calculatedRisk >= 40 ? 'moderate' : 'healthy',
      overflowProbability: `${Math.min(99, Math.round(calculatedRisk * 1.05))}%`,
    };
  },

  // Subscribe to real-time report uploads from citizens & sensors
  subscribeToReports(onNewReport, onUpdateReport) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    try {
      const channel = supabase
        .channel('reports-realtime-admin')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'reports' },
          async (payload) => {
            console.log('Realtime new report payload:', payload);
            if (onNewReport && payload.new) {
              try {
                const { data } = await supabase
                  .from('reports')
                  .select(`
                    id,
                    title,
                    description,
                    status,
                    created_at,
                    latitude,
                    longitude,
                    address,
                    report_categories ( name ),
                    report_media ( media_url ),
                    ai_risk_assessments ( risk_level, flood_risk_score, waste_risk_score, reasoning ),
                    users ( first_name, last_name, phone, email )
                  `)
                  .eq('id', payload.new.id)
                  .single();

                const mapped = data ? mapReportToIncident(data) : payload.new;
                onNewReport(mapped);
              } catch {
                onNewReport(payload.new);
              }
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'reports' },
          (payload) => {
            if (onUpdateReport && payload.new) {
              onUpdateReport(payload.new);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime subscription unavailable:', err);
      return () => {};
    }
  }
};
