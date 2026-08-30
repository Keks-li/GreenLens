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
  const [currentUser, setCurrentUser] = useState(null);

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
  const [citizenRewards, setCitizenRewards] = useState([]);
  const [reportCategories, setReportCategories] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [rewardCatalog, setRewardCatalog] = useState([]);
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Selection State
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dispatchItem, setDispatchItem] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [focusedLocation, setFocusedLocation] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Exact Notification State Tracking
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      const stored = localStorage.getItem('greenlens_read_notifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleMarkAllNotificationsRead = () => {
    const allIds = (incidents || []).map((i) => i.id);
    const updated = new Set(allIds);
    setReadNotificationIds(updated);
    try {
      localStorage.setItem('greenlens_read_notifications', JSON.stringify([...updated]));
    } catch {}
  };

  const handleMarkNotificationRead = (incidentId) => {
    setReadNotificationIds((prev) => {
      const updated = new Set(prev);
      updated.add(incidentId);
      try {
        localStorage.setItem('greenlens_read_notifications', JSON.stringify([...updated]));
      } catch {}
      return updated;
    });
  };

  // Exact count of active unread items
  const unreadNotificationsCount = (incidents || []).filter(
    (i) => i.status !== 'resolved' && !readNotificationIds.has(i.id)
  ).length;

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
        usersRes,
        rewardsRes,
        categoriesRes,
        wasteRes,
        catalogRes,
        badgesRes
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
        dataService.getUsers(muniId),
        dataService.getCitizenRewards(muniId),
        dataService.getReportCategories(),
        dataService.getWasteTypes(),
        dataService.getRewardCatalog(),
        dataService.getBadges()
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
      if (rewardsRes) setCitizenRewards(rewardsRes);
      if (categoriesRes) setReportCategories(categoriesRes);
      if (wasteRes) setWasteTypes(wasteRes);
      if (catalogRes) setRewardCatalog(catalogRes);
      if (badgesRes) setBadges(badgesRes);
    } catch (err) {
      console.error('Failed to load database records:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMunicipalityId]);

  useEffect(() => {
    loadData(selectedMunicipalityId);
  }, [selectedMunicipalityId, loadData]);

  // Real-time listener for incoming citizen uploads and reports
  useEffect(() => {
    const unsubscribe = dataService.subscribeToReports(
      (newReport) => {
        showToast(`🚨 New Citizen Upload: ${newReport.title} (${newReport.refuseType || 'Refuse'})!`);
        setUnreadNotificationsCount((prev) => prev + 1);
        setIncidents((prev) => [newReport, ...prev.filter((p) => p.id !== newReport.id)]);
      },
      (updatedReport) => {
        setIncidents((prev) =>
          prev.map((p) =>
            p.rawId === updatedReport.id || p.id === `REP-${String(updatedReport.id).padStart(3, '0')}`
              ? { ...p, rawStatus: updatedReport.status }
              : p
          )
        );
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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

  // Locate and center directly on the interactive map
  const handleLocateOnMap = (item) => {
    if (!item) return;
    const lat = item.latitude || item.coordinates?.lat || 5.3556;
    const lng = item.longitude || item.coordinates?.lng || -0.6247;
    
    // Close any popup modals so the map is fully visible
    setSelectedIncident(null);
    setSelectedSegment(null);
    setDispatchItem(null);

    setFocusedLocation({
      lat,
      lng,
      zoom: 17,
      id: item.id,
      title: item.title || item.name,
      item: item
    });

    setCurrentView('dashboard');
    
    // Smooth scroll to map on the dashboard
    setTimeout(() => {
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }, 100);
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
        setCurrentView={(viewId) => {
          setCurrentView(viewId);
          setIsMobileNavOpen(false);
        }}
        selectedMunicipality={selectedMunicipality}
        currentUser={currentUser}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        incidentsCount={incidents.filter(i => i.status !== 'resolved').length || incidents.length}
        aiPriorityCount={priorityActions.length}
        alertsCount={alerts.length}
        onLogout={() => {
          setCurrentUser(null);
          showToast('Logged out of Command Session.');
        }}
      />

      {/* Main Content Area */}
      <div className="pl-0 lg:pl-72 flex flex-col min-h-screen w-full overflow-x-hidden">
        {/* Top Header */}
        <Header
          currentView={currentView}
          municipalities={municipalitiesList}
          selectedMunicipalityId={selectedMunicipalityId}
          onSelectMunicipality={(id) => setSelectedMunicipalityId(id)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          weatherData={weather}
          incidents={incidents}
          unreadCount={unreadNotificationsCount}
          readNotificationIds={readNotificationIds}
          onSelectIncident={(item) => {
            handleMarkNotificationRead(item.id);
            handleSelectIncident(item);
          }}
          onLocateOnMap={(item) => {
            handleMarkNotificationRead(item.id);
            handleLocateOnMap(item);
          }}
          onClearUnread={handleMarkAllNotificationsRead}
          onMarkAsRead={handleMarkNotificationRead}
          onNavigateView={(v) => {
            setCurrentView(v);
            setIsMobileNavOpen(false);
          }}
          onOpenHelp={() => setIsHelpOpen(true)}
          onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
        />

        {/* Main Routed Views */}
        <main className="relative pt-16 min-h-screen bg-background pb-12 w-full">
          {currentView === 'dashboard' && (
            <DashboardView
              kpis={kpis}
              drainageSegments={drainageSegments}
              incidents={incidents}
              weather={weather}
              focusedLocation={focusedLocation}
              priorityActions={priorityActions}
              selectedMunicipality={selectedMunicipality}
              fieldTeams={fieldTeams}
              dispatches={dispatches}
              onNavigateView={(v) => {
                setCurrentView(v);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectSegment={handleSelectSegment}
              onSelectIncident={handleSelectIncident}
              selectedSegmentId={selectedSegment?.id}
              onDispatchAction={handleOpenDispatch}
              onOpenDispatch={handleOpenDispatch}
              onViewDetailsAction={(action) => {
                const targetDrain = drainageSegments.find((d) => d.id === action.drainId);
                setSelectedSegment(targetDrain || action);
              }}
              onInspectRisk={(type) => {
                if (type === 'drains') setCurrentView('digital-twin');
                else setCurrentView('incidents');
              }}
              onLocateOnMap={handleLocateOnMap}
              onRefreshData={() => loadData(selectedMunicipalityId)}
            />
          )}

          {currentView === 'incidents' && (
            <IncidentsView
              incidents={incidents}
              categories={reportCategories}
              onSelectIncident={handleSelectIncident}
              onOpenDispatch={handleOpenDispatch}
              onUpdateStatus={handleUpdateIncidentStatus}
              onLocateOnMap={handleLocateOnMap}
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
              incidents={incidents}
              onInspectInfrastructure={(segment) => {
                const target = typeof segment === 'object' ? segment : drainageSegments.find((d) => d.id === segment || d.name === segment) || drainageSegments[0];
                setSelectedSegment(target);
              }}
              onSelectSegment={handleSelectSegment}
              onOpenDispatch={handleOpenDispatch}
            />
          )}

          {currentView === 'waste-intelligence' && (
            <WasteIntelligenceView
              citizenRewards={citizenRewards}
              wasteTypes={wasteTypes}
              rewardCatalog={rewardCatalog}
              badges={badges}
              drainageSegments={drainageSegments}
              incidents={incidents}
              onOpenDispatch={handleOpenDispatch}
              onRefreshData={() => loadData(selectedMunicipalityId)}
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
              selectedMunicipality={selectedMunicipality}
              kpis={kpis}
              drainageSegments={drainageSegments}
              incidents={incidents}
              fieldTeams={fieldTeams}
              citizenRewards={citizenRewards}
              weather={weather}
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
              selectedMunicipality={selectedMunicipality}
              kpis={kpis}
              drainageSegments={drainageSegments}
              fieldTeams={fieldTeams}
              citizenRewards={citizenRewards}
              weather={weather}
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
        onLocateOnMap={handleLocateOnMap}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
