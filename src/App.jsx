import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/views/DashboardView';
import IncidentsView from './components/views/IncidentsView';
import AIPriorityView from './components/views/AIPriorityView';
import DispatchView from './components/views/DispatchView';
import DigitalTwinView from './components/views/DigitalTwinView';
import DrainageNetworkView from './components/views/DrainageNetworkView';
import FloodRiskView from './components/views/FloodRiskView';
import FieldTeamsView from './components/views/FieldTeamsView';
import WasteIntelligenceView from './components/views/WasteIntelligenceView';
import AIInsightsView from './components/views/AIInsightsView';
import AnalyticsView from './components/views/AnalyticsView';
import AlertsView from './components/views/AlertsView';
import AdministrationView from './components/views/AdministrationView';

import LoginView from './components/auth/LoginView';

import DispatchModal from './components/modals/DispatchModal';
import SegmentDetailsModal from './components/modals/SegmentDetailsModal';
import IncidentDetailModal from './components/modals/IncidentDetailModal';
import HelpModal from './components/modals/HelpModal';

import { dataService, isSupabaseConfigured } from './lib/supabase';
import { isViewAllowed, getPermissionsForRole } from './lib/rbac';

export default function App() {
  const [currentUser, setCurrentUser] = useState({
    name: 'Kwame Mensah (Command Lead)',
    email: 'kwame.mensah@winneba.gov.gh',
    role: 'Municipal Officer',
    dept: 'Operations Command',
    municipalityId: 'winneba'
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState('winneba');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Database State
  const [municipalitiesList, setMunicipalitiesList] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [drainageSegments, setDrainageSegments] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [priorityActions, setPriorityActions] = useState([]);
  const [fieldTeams, setFieldTeams] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Selection State
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dispatchItem, setDispatchItem] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch all live data from Supabase
  const loadData = useCallback(async (muniId = selectedMunicipalityId) => {
    try {
      setIsLoading(true);
      const [
        munisRes,
        kpiRes,
        drainsRes,
        incRes,
        aiRes,
        teamsRes,
        dispRes,
        logsRes,
        alertsRes,
        weatherRes,
        usersRes
      ] = await Promise.all([
        dataService.getMunicipalities(),
        dataService.getKpis(muniId),
        dataService.getDrainageSegments(muniId),
        dataService.getIncidents('all', muniId),
        dataService.getAiPriorityActions(muniId),
        dataService.getFieldTeams(muniId),
        dataService.getDispatches(muniId),
        dataService.getAuditLogs(),
        dataService.getAlerts(muniId),
        dataService.getWeather(muniId),
        dataService.getUsers(muniId)
      ]);

      if (munisRes?.length) setMunicipalitiesList(munisRes);
      if (kpiRes) setKpis(kpiRes);
      if (drainsRes) setDrainageSegments(drainsRes);
      if (incRes) setIncidents(incRes);
      if (aiRes) setPriorityActions(aiRes);
      if (teamsRes) setFieldTeams(teamsRes);
      if (dispRes) setDispatches(dispRes);
      if (logsRes) setAuditLogs(logsRes);
      if (alertsRes) setAlerts(alertsRes);
      if (weatherRes) setWeather(weatherRes);
      if (usersRes) setUsersList(usersRes);
    } catch (err) {
      console.error('Failed to load database records:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMunicipalityId]);

  useEffect(() => {
    loadData(selectedMunicipalityId);
  }, [selectedMunicipalityId, loadData]);

  const selectedMunicipality =
    municipalitiesList.find((m) => m.id === selectedMunicipalityId) ||
    municipalitiesList[0] || {
      id: 'winneba',
      name: 'Winneba Municipal Assembly',
      region: 'Central Region, Ghana',
      lat: 5.3556,
      lng: -0.6247,
      zoom: 14
    };

  // Dispatch handler
  const handleConfirmDispatch = async (dispatchData) => {
    const result = await dataService.dispatchTeam(dispatchData);
    if (result.success) {
      showToast(`✓ Field Team dispatched successfully to Drain ${dispatchData.drainId}!`);
      await loadData(selectedMunicipalityId);
    }
  };

  // Update incident status
  const handleUpdateIncidentStatus = async (incidentId, newStatus, teamId = null) => {
    await dataService.updateIncidentStatus(incidentId, newStatus, teamId);
    showToast(`✓ Incident ${incidentId} marked as ${newStatus}!`);
    await loadData(selectedMunicipalityId);
  };

  // Update drainage segment
  const handleUpdateSegment = async (segmentId, updates) => {
    await dataService.updateDrainageSegment(segmentId, updates);
    showToast(`✓ Drainage segment ${segmentId} updated in live database.`);
    await loadData(selectedMunicipalityId);
  };

  const handleSelectSegment = (segment) => {
    setSelectedSegment(segment);
  };

  const handleSelectIncident = (incident) => {
    setSelectedIncident(incident);
  };

  const handleOpenDispatch = (item) => {
    setDispatchItem(item);
  };

  const userRole = currentUser?.role || 'Municipal Officer';
  const permissions = getPermissionsForRole(userRole);

  // Ensure currentView is permitted for current role
  useEffect(() => {
    if (currentUser && !isViewAllowed(currentUser.role, currentView)) {
      setCurrentView(permissions.allowedViews[0] || 'incidents');
    }
  }, [currentUser, currentView, permissions.allowedViews]);

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.municipalityId) {
            setSelectedMunicipalityId(user.municipalityId);
          }
          const perms = getPermissionsForRole(user.role);
          setCurrentView(perms.allowedViews[0] || 'dashboard');
          showToast(`Welcome back, ${user.name}!`);
        }}
      />
    );
  }

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-lg antialiased">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-primary text-on-primary px-5 py-3 rounded-xl shadow-xl border border-primary-fixed flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="text-[13px] font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedMunicipality={selectedMunicipality}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          showToast('Logged out of Command Session.');
        }}
      />

      {/* Main Content Area */}
      <div className="pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          currentView={currentView}
          municipalities={municipalitiesList}
          selectedMunicipalityId={selectedMunicipalityId}
          onSelectMunicipality={(id) => setSelectedMunicipalityId(id)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          weatherData={weather}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* Main Routed Views */}
        <main className="relative pt-16 min-h-screen bg-background pb-12">
          {currentView === 'dashboard' && (
            <DashboardView
              kpis={kpis}
              drainageSegments={drainageSegments}
              priorityActions={priorityActions}
              selectedMunicipality={selectedMunicipality}
              onSelectSegment={handleSelectSegment}
              selectedSegmentId={selectedSegment?.id}
              onDispatchAction={handleOpenDispatch}
              onViewDetailsAction={(action) => {
                const targetDrain = drainageSegments.find((d) => d.id === action.drainId);
                setSelectedSegment(targetDrain || action);
              }}
              onInspectRisk={(type) => {
                if (type === 'drains') setCurrentView('digital-twin');
                else setCurrentView('incidents');
              }}
            />
          )}

          {currentView === 'incidents' && (
            <IncidentsView
              incidents={incidents}
              onSelectIncident={handleSelectIncident}
              onOpenDispatch={handleOpenDispatch}
              onUpdateStatus={handleUpdateIncidentStatus}
            />
          )}

          {currentView === 'ai-priority' && (
            <AIPriorityView
              priorityActions={priorityActions}
              onDispatch={handleOpenDispatch}
              onViewDetails={(action) => {
                const targetDrain = drainageSegments.find((d) => d.id === action.drainId);
                setSelectedSegment(targetDrain || action);
              }}
            />
          )}

          {currentView === 'dispatch' && (
            <DispatchView
              fieldTeams={fieldTeams}
              dispatches={dispatches}
              onOpenDispatchModal={handleOpenDispatch}
              onRefreshData={() => loadData(selectedMunicipalityId)}
            />
          )}

          {currentView === 'field-teams' && (
            <FieldTeamsView
              fieldTeams={fieldTeams}
              onOpenDispatch={handleOpenDispatch}
              onRefreshData={() => loadData(selectedMunicipalityId)}
            />
          )}

          {currentView === 'digital-twin' && (
            <DigitalTwinView
              drainageSegments={drainageSegments}
              onSelectSegment={handleSelectSegment}
              onOpenDispatch={handleOpenDispatch}
              onUpdateSegment={handleUpdateSegment}
            />
          )}

          {currentView === 'drainage-network' && (
            <DrainageNetworkView
              drainageSegments={drainageSegments}
              onOpenDispatch={handleOpenDispatch}
              onInspectSegment={handleSelectSegment}
              onUpdateSegment={handleUpdateSegment}
            />
          )}

          {currentView === 'flood-risk' && (
            <FloodRiskView
              drainageSegments={drainageSegments}
              onInspectInfrastructure={(name) => {
                const targetDrain = drainageSegments[0];
                setSelectedSegment(targetDrain);
              }}
              onOpenDispatch={handleOpenDispatch}
            />
          )}

          {currentView === 'waste-intelligence' && (
            <WasteIntelligenceView
              incidents={incidents}
              drainageSegments={drainageSegments}
              onOpenDispatch={handleOpenDispatch}
            />
          )}

          {currentView === 'ai-insights' && (
            <AIInsightsView
              drainageSegments={drainageSegments}
              priorityActions={priorityActions}
              onOpenDispatch={handleOpenDispatch}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              currentUser={currentUser}
              kpis={kpis}
              drainageSegments={drainageSegments}
              incidents={incidents}
            />
          )}

          {currentView === 'alerts' && (
            <AlertsView
              currentUser={currentUser}
              alertsList={alerts}
              onRefreshAlerts={() => loadData(selectedMunicipalityId)}
            />
          )}

          {currentView === 'administration' && (
            <AdministrationView
              auditLogsList={auditLogs}
              usersList={usersList}
              incidentsList={incidents}
              currentUser={currentUser}
              onRefreshData={() => loadData(selectedMunicipalityId)}
              onOpenDispatch={handleOpenDispatch}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <DispatchModal
        isOpen={Boolean(dispatchItem)}
        onClose={() => setDispatchItem(null)}
        targetItem={dispatchItem}
        fieldTeamsList={fieldTeams}
        onConfirmDispatch={handleConfirmDispatch}
      />

      <SegmentDetailsModal
        isOpen={Boolean(selectedSegment)}
        onClose={() => setSelectedSegment(null)}
        segment={selectedSegment}
        onOpenDispatch={handleOpenDispatch}
        onUpdateSegment={handleUpdateSegment}
      />

      <IncidentDetailModal
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        incident={selectedIncident}
        onOpenDispatch={handleOpenDispatch}
        onUpdateStatus={handleUpdateIncidentStatus}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
