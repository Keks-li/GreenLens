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

  // Fetch KPI metrics
  async getKpis(municipalityId = 'winneba') {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('system_metrics')
          .select('*')
          .eq('municipality_id', municipalityId)
          .single();
        if (!error && data) {
          return {
            reportsToday: data.reports_today || { value: 0, change: '0%', trend: 'stable' },
            criticalIncidents: data.critical_incidents || { value: 0, change: '0', trend: 'stable' },
            highFloodRisk: data.high_flood_risk || { value: 0, unit: 'Areas', trend: 'stable' },
            activeCleanups: data.active_cleanups || { value: 0, change: '0', trend: 'stable' },
            resolvedToday: data.resolved_today || { value: 0, change: '0%', trend: 'stable' },
            wasteRemoved: data.waste_removed || { value: 0.0, unit: 'Tons', trend: 'stable' }
          };
        }
      } catch (err) {
        console.error('Supabase getKpis error:', err);
      }
    }
    return null;
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

  // Fetch incident feed
  async getIncidents(statusFilter = 'all', municipalityId = 'winneba') {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('incidents').select('*');
        if (municipalityId && municipalityId !== 'all') {
          query = query.eq('municipality_id', municipalityId);
        }
        if (statusFilter && statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data?.length) {
          return data.map(mapIncident);
        }
      } catch (err) {
        console.error('Supabase getIncidents error:', err);
      }
    }
    return [];
  },

  // Update incident status
  async updateIncidentStatus(incidentId, status, assignedTeamId = null) {
    const timestamp = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = { status, updated_at: timestamp };
        if (assignedTeamId) payload.assigned_team_id = assignedTeamId;
        if (status === 'resolved') payload.resolved_at = timestamp;

        const { data, error } = await supabase
          .from('incidents')
          .update(payload)
          .eq('id', incidentId)
          .select();

        if (!error && data?.length) return mapIncident(data[0]);
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
      } catch (err) {
        console.error('Supabase getAiPriorityActions error:', err);
      }
    }
    return [];
  },

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
          return data.map(mapFieldTeam);
        }
      } catch (err) {
        console.error('Supabase getFieldTeams error:', err);
      }
    }
    return [];
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

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Insert dispatch assignment
        await supabase.from('dispatch_assignments').insert([{
          id: missionId,
          mission_code: missionId,
          drain_id: drainId,
          team_id: teamId,
          municipality_id: 'winneba',
          target_location: `Drain Segment ${drainId}`,
          priority: priority,
          deadline_hours: deadlineHours,
          time_remaining: `${deadlineHours}h 00m`,
          instructions: instructions,
          equipment: priority === 'Critical' ? 'Hydro-jet + Vac Truck' : 'Excavator & Flatbed',
          progress: 10,
          status: 'dispatched',
          dispatched_by: 'Command Lead (You)'
        }]);

        // 2. Update drain status
        await supabase.from('drainage_segments')
          .update({ status: 'Dispatched', assigned_team_id: teamId, updated_at: new Date().toISOString() })
          .eq('id', drainId);

        // 3. Update field team status
        await supabase.from('field_teams')
          .update({ status: 'On Mission' })
          .eq('id', teamId);

        // 4. Log audit event
        await this.addAuditLog({
          user: 'Command Lead (You)',
          action: 'TEAM_DISPATCHED',
          entity: `Drain ${drainId}`,
          details: `Assigned team ${teamId} with ${priority} priority (${deadlineHours}h window).`
        });

        return { success: true, missionId };
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

  // Fetch Users
  async getUsers(municipalityId = 'winneba') {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('system_users').select('*').order('created_at', { ascending: false });
        if (!error && data?.length) {
          return data.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            department: u.department,
            status: u.status || 'Active'
          }));
        }
      } catch (err) {
        console.error('Supabase getUsers error:', err);
      }
    }
    return [];
  },

  // Create/Invite User
  async createUser(userData) {
    const id = userData.id || `usr-${Date.now()}`;
    const payload = {
      id,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'Municipal Officer',
      department: userData.department || 'Operations Command',
      status: userData.status || 'Active',
      municipality_id: userData.municipalityId || 'winneba'
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('system_users').insert([payload]).select();
        if (!error && data?.length) {
          await this.addAuditLog({
            action: 'USER_INVITED',
            entity: `User ${userData.name}`,
            details: `Invited user ${userData.email} as ${userData.role}.`
          });
          return data[0];
        }
      } catch (err) {
        console.error('Supabase createUser error:', err);
      }
    }
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

  // Fetch Weather Data
  async getWeather(municipalityId = 'winneba') {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('weather_data').select('*').eq('municipality_id', municipalityId).single();
        if (!error && data) {
          return {
            temp: data.temp,
            condition: data.condition,
            rainForecastHours: data.rain_forecast_hours,
            rainProbability: data.rain_probability,
            wind: data.wind,
            humidity: data.humidity,
            warning: data.warning
          };
        }
      } catch (err) {
        console.error('Supabase getWeather error:', err);
      }
    }
    return {
      temp: '29°C',
      condition: 'Scattered Clouds',
      rainForecastHours: 18,
      rainProbability: '78%',
      wind: '14 km/h SW',
      humidity: '82%',
      warning: 'High convective rainfall expected within 18 hours.'
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

  // Disburse / Redeem Citizen Eco-Reward
  async redeemCitizenReward(citizenId, amountGhs = 50.00) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: current, error: fetchErr } = await supabase
          .from('citizen_rewards')
          .select('*')
          .eq('id', citizenId)
          .single();

        if (!fetchErr && current) {
          const updatedRedeemed = Number(current.rewards_redeemed_ghs || 0) + Number(amountGhs);
          const { data, error } = await supabase
            .from('citizen_rewards')
            .update({ rewards_redeemed_ghs: updatedRedeemed })
            .eq('id', citizenId)
            .select();

          if (!error && data?.length) {
            await this.addAuditLog({
              action: 'ECO_REWARD_DISBURSED',
              entity: `Citizen ${current.user_name}`,
              details: `Disbursed GHS ${amountGhs.toFixed(2)} eco-reward for refuse cleanup & flood prevention impact.`
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
  }
};
