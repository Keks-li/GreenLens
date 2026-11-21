import React, { useState } from 'react';

export default function Header({
  currentView,
  municipalities = [],
  selectedMunicipalityId,
  onSelectMunicipality,
  searchQuery,
  setSearchQuery,
  weatherData,
  incidents = [],
  unreadCount = 0,
  readNotificationIds = new Set(),
  onSelectIncident,
  onLocateOnMap,
  onClearUnread,
  onMarkAsRead,
  onNavigateView,
  onOpenHelp,
  onToggleMobileNav
}) {
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all', 'citizen', 'critical'
  const [showWeatherPopover, setShowWeatherPopover] = useState(false);

  const weather = weatherData || { temp: '--', condition: 'Telemetry Active' };
  const munisList = municipalities || [];

  const getBreadcrumbTitle = (viewId) => {
    switch (viewId) {
      case 'dashboard': return 'Overview';
      case 'incidents': return 'Incident Monitoring';
      case 'ai-priority': return 'AI Priority Queue';
      case 'dispatch': return 'Operations Dispatch';
      case 'field-teams': return 'Field Teams Roster';
      case 'digital-twin': return 'Drainage Digital Twin';
      case 'drainage-network': return 'Hydraulic Network';
      case 'flood-risk': return 'Flood Risk Matrix';
      case 'waste-intelligence': return 'Waste Intelligence';
      case 'ai-insights': return 'AI Simulation & Insights';
      case 'analytics': return 'Municipal Analytics';
      case 'alerts': return 'Emergency Alerts';
      case 'administration': return 'Administration & Audit';
      default: return 'Command Center';
    }
  };

  // Filter recent upload activities
  const recentActivities = (incidents || []).filter((inc) => {
    if (notificationFilter === 'citizen') return inc.sourceTable === 'reports' || inc.reportedBy?.includes('Citizen') || inc.id?.startsWith('REP');
    if (notificationFilter === 'critical') return inc.severity === 'critical' || inc.severity === 'high';
    return true;
  }).slice(0, 10);

  const handleToggleNotifications = () => {
    setShowNotificationsMenu(!showNotificationsMenu);
  };

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-md border-b border-outline-variant/60 z-40 flex items-center justify-between px-3 sm:px-6 md:px-8 select-none gap-2">
      {/* Left side: Mobile menu button, Municipality selector & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink overflow-hidden">
        {/* Mobile menu hamburger toggle */}
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
          title="Open Menu"
          aria-label="Open Navigation Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Municipality Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-on-surface-variant text-body-sm bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/70 shadow-2xs shrink-0">
          <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-primary">location_on</span>
          <select
            value={selectedMunicipalityId}
            onChange={(e) => onSelectMunicipality(e.target.value)}
            className="bg-transparent font-bold text-on-surface focus:outline-none cursor-pointer text-[12px] sm:text-[13px] max-w-[120px] sm:max-w-none truncate"
          >
            {munisList.map((mun) => (
              <option key={mun.id} value={mun.id}>
                {mun.name}
              </option>
            ))}
          </select>
        </div>

        {/* Breadcrumbs - Only show on large viewports to prevent collision with search */}
        <nav className="hidden xl:flex items-center gap-1.5 text-on-surface-variant text-[13px] min-w-0 overflow-hidden pl-3 border-l border-outline-variant/60">
          <span
            onClick={() => onNavigateView && onNavigateView('dashboard')}
            className="hover:text-primary transition-colors cursor-pointer shrink-0 font-semibold"
          >
            {currentView === 'dashboard' ? 'Overview' : 'Operations'}
          </span>
          <span className="material-symbols-outlined text-[14px] text-outline shrink-0">chevron_right</span>
          <span className="text-on-surface font-bold truncate max-w-[160px]">{getBreadcrumbTitle(currentView)}</span>
        </nav>
      </div>

      {/* Right side: Search, Telemetry Weather, AI status, Notifications */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
        {/* Search Input */}
        <div className="relative flex items-center hidden sm:flex">
          <span className="material-symbols-outlined absolute left-3 text-outline text-[17px] pointer-events-none">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city data..."
            className="bg-surface-container-low border border-outline-variant/80 rounded-full pl-9 pr-7 py-1.5 text-[12px] sm:text-[13px] w-28 md:w-40 lg:w-44 xl:w-52 focus:w-36 md:focus:w-48 lg:focus:w-56 transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none placeholder:text-outline/70"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-outline hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          )}
        </div>

        {/* Live Weather & Rainfall Prediction Telemetry */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowWeatherPopover(!showWeatherPopover)}
            className="flex items-center gap-1.5 sm:gap-2 bg-[#e0f2fe] border border-[#bae6fd] text-[#0369a1] px-3 py-1.5 rounded-full shadow-2xs hover:bg-[#d0ebfd] transition-all cursor-pointer font-semibold"
            title="Open-Meteo Rainfall & Hydrology Forecast"
          >
            <span className="material-symbols-outlined text-[#0284c7] text-[16px] sm:text-[17px] animate-pulse">cloud</span>
            <span className="text-body-sm font-bold text-[12px] sm:text-[13px]">{weather?.temp || '--°C'}</span>
            <span className="text-[11px] font-bold hidden md:inline flex items-center gap-1">
              <span>🌧️ {weather?.rain24hMm ?? 0}mm</span>
            </span>
          </button>

          {/* Rainfall Prediction Popover */}
          {showWeatherPopover && (
            <div className="absolute right-0 top-11 w-80 bg-surface-container-lowest rounded-2xl shadow-card-hover border border-outline-variant p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/60 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">rainy</span>
                  <span className="font-title-md text-[13px] text-on-surface font-bold">Open-Meteo Rainfall Prediction</span>
                </div>
                <span className="text-[10px] bg-primary-container text-on-primary-container font-bold uppercase px-2 py-0.5 rounded-full font-data-mono">Live API</span>
              </div>

              <div className="space-y-2.5 text-[12px]">
                <div className="p-3 rounded-2xl bg-primary-container/20 border border-primary/20 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant font-medium">Projected 24h Rainfall:</span>
                    <span className="font-bold text-risk-critical font-data-mono">{weather?.rain24hMm ?? 0} mm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant font-medium">Precipitation Probability:</span>
                    <span className="font-bold text-primary font-data-mono">{weather?.rainProbability || '0%'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant font-medium">Current Wind &amp; Humidity:</span>
                    <span className="font-semibold text-on-surface">{weather?.wind || '--'} • {weather?.humidity || '--'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/50">
                  <span className="text-[10px] uppercase font-bold text-outline block mb-1">Hydrological Impact Advisory:</span>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {weather?.warning || 'Live weather telemetry synchronizing with Open-Meteo.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Core Status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container text-on-primary-container rounded-full border border-[#bbf7d0] shadow-2xs font-semibold">
          <span className="material-symbols-outlined text-primary text-[17px] animate-spin" style={{ animationDuration: '6s' }}>
            temp_preferences_custom
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">AI Active</span>
        </div>

        {/* Notifications Dropdown Drawer */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={handleToggleNotifications}
            title="Recent Incident & Upload Activities"
            className="relative p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-risk-critical text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse shadow-sm border border-surface">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Detailed Notification & Recent Activities Drawer */}
          {showNotificationsMenu && (
            <div className="absolute right-0 top-12 w-96 max-w-[90vw] bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden flex flex-col max-h-[85vh]">
              {/* Drawer Header */}
              <div className="p-4 border-b border-outline-variant/60 bg-surface-container-low/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">feed</span>
                  <div>
                    <h3 className="font-title-md text-[14px] text-on-surface font-bold">Incident Activities &amp; Uploads</h3>
                    <p className="text-[11px] text-on-surface-variant">
                      {unreadCount > 0 ? `${unreadCount} unread incident reports` : 'All incident notifications reviewed'}
                    </p>
                  </div>
                </div>
                {unreadCount > 0 && onClearUnread && (
                  <button
                    type="button"
                    onClick={onClearUnread}
                    className="text-[11px] font-bold text-primary hover:underline bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-full cursor-pointer transition-colors shrink-0"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex px-3 pt-2.5 border-b border-outline-variant/40 gap-2 bg-surface-container-low/30 text-[11px]">
                {[
                  { id: 'all', label: 'All', count: incidents.length },
                  { id: 'citizen', label: 'Citizen Scans', count: incidents.filter(i => i.id?.startsWith('REP')).length },
                  { id: 'critical', label: 'High / Critical', count: incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setNotificationFilter(tab.id)}
                    className={`pb-2 px-2 font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      notificationFilter === tab.id
                        ? 'text-primary border-b-2 border-primary font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] opacity-75 font-data-mono">({tab.count})</span>
                  </button>
                ))}
              </div>

              {/* Activities List */}
              <div className="overflow-y-auto divide-y divide-outline-variant/30 p-2 space-y-1">
                {recentActivities.length === 0 ? (
                  <div className="p-6 text-center text-on-surface-variant text-[12px]">
                    <span className="material-symbols-outlined text-outline text-[32px] block mb-1">inbox</span>
                    No incident activities found for this filter.
                  </div>
                ) : (
                  recentActivities.map((item) => {
                    const isCritical = item.severity === 'critical';
                    const isHigh = item.severity === 'high';
                    const isCitizenScan = item.id?.startsWith('REP');
                    const isUnread = !readNotificationIds?.has(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl hover:bg-surface-container-low transition-all flex items-start gap-3 group relative cursor-pointer ${
                          isUnread ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => {
                          if (onMarkAsRead) onMarkAsRead(item.id);
                          setShowNotificationsMenu(false);
                          if (onSelectIncident) onSelectIncident(item);
                        }}
                      >
                        {/* Thumbnail / Status icon */}
                        <div className="relative shrink-0 mt-0.5">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-11 h-11 rounded-lg object-cover border border-outline-variant/40"
                            />
                          ) : (
                            <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                              isCritical ? 'bg-error-container text-risk-critical' : 'bg-primary/10 text-primary'
                            }`}>
                              <span className="material-symbols-outlined text-[20px]">
                                {isCritical ? 'warning' : 'report'}
                              </span>
                            </div>
                          )}
                          {isCitizenScan && (
                            <span
                              title="Citizen Mobile Upload"
                              className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary text-on-primary rounded-full flex items-center justify-center text-[9px] shadow-xs"
                            >
                              📱
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="New / Unread"></span>
                              )}
                              <h4 className="font-title-sm text-[13px] font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                                {item.title}
                              </h4>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                              isCritical ? 'bg-error-container text-risk-critical' : isHigh ? 'bg-amber-100 text-amber-900' : 'bg-surface-container text-outline'
                            }`}>
                              {item.severity}
                            </span>
                          </div>

                          {/* Refuse Material Tag & Category */}
                          <div className="flex items-center gap-1.5 flex-wrap my-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              🗑️ {item.refuseType || item.category || 'Refuse Debris'}
                            </span>
                            {item.estimatedWasteVolume && (
                              <span className="text-[10px] font-data-mono text-outline font-semibold">
                                {item.estimatedWasteVolume}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-1">
                            <span className="truncate">
                              By <strong className="text-on-surface">{item.reportedBy}</strong> • {item.reportedAt || 'Recent'}
                            </span>

                            {/* Direct Map Locate Icon Button */}
                            <button
                              type="button"
                              title="Locate on Exact Incident Map"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onMarkAsRead) onMarkAsRead(item.id);
                                setShowNotificationsMenu(false);
                                if (onLocateOnMap) onLocateOnMap(item);
                              }}
                              className="p-1 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-primary transition-all flex items-center gap-1 text-[10px] font-bold px-2 cursor-pointer border border-outline-variant/40"
                            >
                              <span className="material-symbols-outlined text-[14px]">explore</span>
                              <span>Map</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-3 bg-surface-container-low/60 border-t border-outline-variant/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotificationsMenu(false);
                    if (onNavigateView) onNavigateView('incidents');
                  }}
                  className="text-primary hover:underline text-[12px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Reports &amp; Incidents</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotificationsMenu(false)}
                  className="text-[11px] text-outline hover:text-on-surface cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <button
            onClick={onOpenHelp}
            title="System Documentation & Guide"
            className="p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">help</span>
          </button>
        </div>
      </div>
    </header>
  );
}
