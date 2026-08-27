import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Default center coordinates for Winneba, Ghana (as requested from https://www.openstreetmap.org/#map=15/5.34352/-0.62566)
const WINNEBA_CENTER = [5.34352, -0.62566];
const DEFAULT_ZOOM = 15;

// Calculate distance between two lat/lng coordinates in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371e3; // meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Tile Providers
const TILE_PROVIDERS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  topo: {
    name: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
  },
  cartoLight: {
    name: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  },
  satellite: {
    name: 'ESRI Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

export default function OpenStreetMapViewer({
  drainageSegments = [],
  incidents = [],
  selectedSegmentId = null,
  onSelectSegment,
  onSelectIncident,
  onSelectLocation,
  onOpenDispatch,
  showHeatmap = false,
  forecastHorizon = '24H',
  className = 'w-full h-full min-h-[500px]',
  interactive = true,
  viewMode = 'telemetry' // 'telemetry', 'digital-twin', 'flood-risk'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersGroupRef = useRef(null);
  const clickMarkerRef = useRef(null);

  const [activeTileType, setActiveTileType] = useState('osm');
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    drains: true,
    incidents: true,
    floodZones: showHeatmap || viewMode === 'flood-risk',
    flowLines: true
  });

  // Expose global callback for popup actions
  useEffect(() => {
    window.__greenlens_inspect_segment = (segId) => {
      const seg = drainageSegments.find((d) => d.id === segId);
      if (seg && onSelectSegment) onSelectSegment(seg);
    };
    window.__greenlens_dispatch_location = (locName, lat, lng) => {
      if (onOpenDispatch) {
        onOpenDispatch({
          drainName: locName,
          location: `GIS: ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`,
          lat: Number(lat),
          lng: Number(lng)
        });
      }
    };
    return () => {
      delete window.__greenlens_inspect_segment;
      delete window.__greenlens_dispatch_location;
    };
  }, [drainageSegments, onSelectSegment, onOpenDispatch]);

  // Initialize Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: WINNEBA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true
    });

    const tileConfig = TILE_PROVIDERS[activeTileType] || TILE_PROVIDERS.osm;
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    layersGroupRef.current = layerGroup;

    // Map click handler to inspect any point in Winneba
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;

      // Find nearest drainage culvert
      let nearestDrain = null;
      let minDistance = Infinity;

      drainageSegments.forEach((seg) => {
        const segLat = seg.coordinates?.lat || 5.3556;
        const segLng = seg.coordinates?.lng || -0.6247;
        const dist = getDistanceMeters(lat, lng, segLat, segLng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestDrain = seg;
        }
      });

      // Calculate approximate flood vulnerability based on coordinates
      const isLowBasin = lat < 5.358 && lng > -0.627;
      const riskLevel = isLowBasin ? (minDistance < 250 ? 'Critical' : 'High') : 'Moderate';
      const riskColor = riskLevel === 'Critical' ? '#ba1a1a' : riskLevel === 'High' ? '#e65100' : '#206d1f';
      const estWaterDepth = isLowBasin ? '0.35m - 0.65m' : '< 0.15m (Runoff Zone)';
      const soilSat = isLowBasin ? '88% Saturated' : '62% Saturated';
      const sectorName = lat > 5.36 ? 'North Campus / University Link' : lat < 5.348 ? 'South Fisheries / Coastal Basin' : 'Central Market / Commercial Sector';

      const locationData = {
        lat: lat.toFixed(5),
        lng: lng.toFixed(5),
        sector: sectorName,
        riskLevel,
        nearestDrain,
        distanceToNearestDrain: minDistance,
        estWaterDepth,
        soilSat
      };

      if (onSelectLocation) {
        onSelectLocation(locationData);
      }

      // Show temporary pin with rich popup
      if (clickMarkerRef.current) {
        map.removeLayer(clickMarkerRef.current);
      }

      const clickPinIcon = L.divIcon({
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: ${riskColor}; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: white;"></span>
            </div>
            <div style="width: 2px; height: 10px; background: ${riskColor};"></div>
          </div>
        `,
        className: 'osm-click-pin',
        iconSize: [24, 34],
        iconAnchor: [12, 34]
      });

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; max-width: 280px; color: #1b1c1c;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e4e2e2; padding-bottom: 6px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${riskColor};"></span>
              <strong style="font-size: 13px; font-weight: 700;">GIS Flood Assessment</strong>
            </div>
            <span style="font-size: 10px; font-weight: 700; background: ${riskColor}; color: white; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${riskLevel} Risk
            </span>
          </div>

          <div style="font-size: 11px; margin-bottom: 6px; color: #40493d;">
            <strong>Sector:</strong> ${sectorName}<br/>
            <strong>Coordinates:</strong> <span style="font-family: monospace;">${lat.toFixed(4)}°N, ${Math.abs(lng).toFixed(4)}°W</span>
          </div>

          <div style="background: #f5f3f3; padding: 6px 8px; border-radius: 6px; margin-bottom: 8px; font-size: 11px; line-height: 1.4;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #707a6b;">Est. Water Depth:</span>
              <strong style="color: ${riskColor};">${estWaterDepth}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #707a6b;">Soil Saturation:</span>
              <strong>${soilSat}</strong>
            </div>
            ${nearestDrain ? `
              <div style="display: flex; justify-content: space-between; border-top: 1px dashed #c0cab9; padding-top: 4px; margin-top: 4px;">
                <span style="color: #707a6b;">Nearest Culvert:</span>
                <strong>${nearestDrain.id} (${minDistance}m away)</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #707a6b;">Culvert Blockage:</span>
                <strong style="color: ${nearestDrain.blockagePercent > 70 ? '#ba1a1a' : '#206d1f'};">${nearestDrain.blockagePercent}%</strong>
              </div>
            ` : ''}
          </div>

          <div style="display: flex; gap: 4px; margin-top: 6px;">
            ${nearestDrain ? `
              <button
                type="button"
                onclick="window.__greenlens_inspect_segment('${nearestDrain.id}')"
                style="flex: 1; background: #206d1f; color: white; border: none; padding: 6px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;"
              >
                Inspect ${nearestDrain.id}
              </button>
            ` : ''}
            <button
              type="button"
              onclick="window.__greenlens_dispatch_location('${sectorName}', ${lat}, ${lng})"
              style="flex: 1; background: #3f6653; color: white; border: none; padding: 6px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;"
            >
              Dispatch Crew
            </button>
          </div>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: clickPinIcon })
        .addTo(map)
        .bindPopup(popupHtml, { maxWidth: 300, closeButton: true })
        .openPopup();

      clickMarkerRef.current = marker;
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when type changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const tileConfig = TILE_PROVIDERS[activeTileType] || TILE_PROVIDERS.osm;
    const newLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19
    }).addTo(map);
    tileLayerRef.current = newLayer;
  }, [activeTileType]);

  // Update GIS Overlays, Drainage Lines, Markers & Flood Risk Polygons
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;
    const layerGroup = layersGroupRef.current;
    layerGroup.clearLayers();

    // 1. Draw Drainage Polylines / Flow Network on OpenStreetMap
    if (visibleLayers.drains && visibleLayers.flowLines) {
      const mainPathCoords = [
        [5.3645, -0.6280], // D-104 North Campus
        [5.3562, -0.6231], // D-102 Central Market
        [5.3489, -0.6190], // D-117 South Residential
        [5.3412, -0.6145]  // D-108 Fisheries Landing Outfall
      ];

      // Buffer corridor
      L.polyline(mainPathCoords, {
        color: '#206d1f',
        weight: 12,
        opacity: 0.25,
        lineCap: 'round',
        dashArray: '8, 8'
      }).addTo(layerGroup);

      // Main hydraulic spine
      const spine = L.polyline(mainPathCoords, {
        color: '#206d1f',
        weight: 4,
        opacity: 0.9,
        lineCap: 'round'
      }).addTo(layerGroup);

      spine.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; color: #1b1c1c;">
          <strong style="font-size: 13px; color: #206d1f;">Primary Arterial Drainage Spine</strong>
          <p style="font-size: 11px; margin: 4px 0; color: #40493d;">Main trunk line connecting North Campus to Coastal Fisheries Outfall.</p>
          <div style="font-size: 11px; background: #f5f3f3; padding: 4px 6px; border-radius: 4px;">
            Length: <strong>3.2 km</strong> | Peak Capacity: <strong>3,400 L/s</strong>
          </div>
        </div>
      `);

      // Lateral swale connecting Lowtown
      const swale = L.polyline([
        [5.3510, -0.6310], // D-201 Lowtown
        [5.3562, -0.6231], // D-102 Central Market
        [5.3601, -0.6160]  // D-305 Hospital By-pass
      ], {
        color: '#436b58',
        weight: 3,
        opacity: 0.8,
        dashArray: '6, 6'
      }).addTo(layerGroup);

      swale.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; color: #1b1c1c;">
          <strong style="font-size: 13px; color: #436b58;">Lowtown Lateral Tributary</strong>
          <p style="font-size: 11px; margin: 4px 0; color: #40493d;">Secondary tributary funneling stormwater into Central Market basin.</p>
        </div>
      `);
    }

    // 2. Draw Flood Hazard Inundation Risk Polygons (if enabled or in flood-risk mode)
    if (visibleLayers.floodZones || showHeatmap || viewMode === 'flood-risk') {
      // High-risk flood basin near Central Market & Coastal Lagoon
      const marketCircle = L.circle([5.3562, -0.6231], {
        radius: forecastHorizon === '48H' ? 450 : 300,
        color: '#ba1a1a',
        fillColor: '#ba1a1a',
        fillOpacity: forecastHorizon === '48H' ? 0.35 : 0.22,
        weight: 2,
        dashArray: '4, 4'
      }).addTo(layerGroup);

      marketCircle.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; max-width: 270px; color: #1b1c1c;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #ba1a1a;"></span>
            <strong style="font-size: 13px; color: #ba1a1a;">Critical Flood Hazard Zone</strong>
          </div>
          <p style="font-size: 11px; margin-bottom: 6px; color: #40493d;">
            <strong>Sector:</strong> Central Market & Lowtown Commercial District<br/>
            <strong>Projected Inundation:</strong> 0.45m - 0.75m depth<br/>
            <strong>Soil Saturation:</strong> 88% (Runoff Threshold Exceeded)
          </p>
          <div style="background: #ffdad6; color: #93000a; font-size: 11px; padding: 4px 6px; border-radius: 4px; margin-bottom: 8px; font-weight: 600;">
            Primary Culvert D-102 Surcharge Risk: 94%
          </div>
          <button
            type="button"
            onclick="window.__greenlens_dispatch_location('Central Market Flood Basin', 5.3562, -0.6231)"
            style="width: 100%; background: #ba1a1a; color: white; border: none; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;"
          >
            Dispatch Emergency Pre-Clearance
          </button>
        </div>
      `);

      const residentialCircle = L.circle([5.3489, -0.6190], {
        radius: 260,
        color: '#ff8c00',
        fillColor: '#ff8c00',
        fillOpacity: 0.2,
        weight: 1.5
      }).addTo(layerGroup);

      residentialCircle.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; max-width: 260px; color: #1b1c1c;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #ff8c00;"></span>
            <strong style="font-size: 13px; color: #ff8c00;">High Flood Vulnerability Zone</strong>
          </div>
          <p style="font-size: 11px; margin-bottom: 6px; color: #40493d;">
            <strong>Sector:</strong> South Residential & Methodist Bypass<br/>
            <strong>Projected Inundation:</strong> 0.20m - 0.40m depth
          </p>
          <button
            type="button"
            onclick="window.__greenlens_dispatch_location('South Residential Zone', 5.3489, -0.6190)"
            style="width: 100%; background: #3f6653; color: white; border: none; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;"
          >
            Dispatch Crew
          </button>
        </div>
      `);
    }

    // 3. Render Drainage Segment Markers with Custom HTML Pin
    if (visibleLayers.drains && drainageSegments?.length) {
      drainageSegments.forEach((seg) => {
        const lat = seg.coordinates?.lat || 5.3556;
        const lng = seg.coordinates?.lng || -0.6247;
        const isSelected = selectedSegmentId === seg.id;
        const isCritical = seg.riskLevel === 'critical';
        const isHigh = seg.riskLevel === 'high';

        const colorBg = isCritical
          ? '#ba1a1a'
          : isHigh
          ? '#ff8c00'
          : seg.riskLevel === 'moderate'
          ? '#d97706'
          : '#206d1f';

        const iconHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${(isCritical || isHigh) ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${colorBg}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
            <div style="width: 28px; height: 28px; border-radius: 50%; background-color: ${colorBg}; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'}; transition: transform 0.2s;">
              <span style="color: white; font-family: monospace; font-size: 10px; font-weight: bold;">${seg.blockagePercent}%</span>
            </div>
            <div style="margin-top: 2px; background: rgba(255,255,255,0.95); padding: 1px 5px; border-radius: 4px; font-size: 10px; font-weight: bold; border: 1px solid #c0cab9; box-shadow: 0 2px 4px rgba(0,0,0,0.15); white-space: nowrap; color: #1b1c1c;">
              ${seg.id}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'osm-custom-drain-marker',
          iconSize: [32, 44],
          iconAnchor: [16, 22]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(layerGroup);

        const drainPopupHtml = `
          <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; max-width: 270px; color: #1b1c1c;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e4e2e2; padding-bottom: 6px; margin-bottom: 8px;">
              <strong style="font-size: 13px; color: ${colorBg};">${seg.name} (${seg.id})</strong>
              <span style="font-size: 10px; font-weight: 700; background: ${colorBg}; color: white; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                ${seg.blockagePercent}% Blocked
              </span>
            </div>

            <div style="font-size: 11px; margin-bottom: 6px; color: #40493d;">
              <strong>Sector:</strong> ${seg.sector}<br/>
              <strong>Flow Capacity:</strong> ${seg.flowCapacityText || '1,200 L/s'}<br/>
              <strong>Compound Risk Score:</strong> <b>${seg.riskScore || 85}/100</b>
            </div>

            <div style="background: #f5f3f3; padding: 6px 8px; border-radius: 6px; margin-bottom: 8px; font-size: 11px;">
              <span style="color: #707a6b;">Open-Meteo Surcharge Threat:</span><br/>
              <strong style="color: ${isCritical ? '#ba1a1a' : '#206d1f'};">
                ${isCritical ? '⚠️ Surcharge ETA: ~18 mins' : '✓ Safe Hydraulic Clearance'}
              </strong>
            </div>

            <div style="display: flex; gap: 4px;">
              <button
                type="button"
                onclick="window.__greenlens_inspect_segment('${seg.id}')"
                style="flex: 1; background: #206d1f; color: white; border: none; padding: 6px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;"
              >
                Inspect Telemetry
              </button>
              <button
                type="button"
                onclick="window.__greenlens_dispatch_location('${seg.name}', ${lat}, ${lng})"
                style="flex: 1; background: #3f6653; color: white; border: none; padding: 6px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;"
              >
                Dispatch Crew
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(drainPopupHtml, { maxWidth: 290, closeButton: true });

        marker.on('click', () => {
          if (onSelectSegment) onSelectSegment(seg);
          if (onSelectLocation) {
            onSelectLocation({
              lat: Number(lat).toFixed(5),
              lng: Number(lng).toFixed(5),
              sector: seg.sector,
              riskLevel: seg.riskLevel === 'critical' ? 'Critical' : seg.riskLevel === 'high' ? 'High' : 'Moderate',
              nearestDrain: seg,
              distanceToNearestDrain: 0,
              estWaterDepth: isCritical ? '0.45m - 0.75m' : '0.15m',
              soilSat: '88% Saturated'
            });
          }
        });

        marker.bindTooltip(
          `<strong>${seg.name} (${seg.id})</strong><br>Sector: ${seg.sector}<br>Blockage: <b>${seg.blockagePercent}%</b> | Risk: <b>${seg.riskScore}/100</b>`,
          { direction: 'top', offset: [0, -14] }
        );
      });
    }

    // 4. Render Incident Markers
    if (visibleLayers.incidents && incidents?.length) {
      incidents.forEach((inc) => {
        const lat = inc.latitude || 5.3562;
        const lng = inc.longitude || -0.6231;

        const incidentHtml = `
          <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #ba1a1a; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 6px rgba(0,0,0,0.35); transform: rotate(45deg);">
            <span style="color: white; font-size: 11px; transform: rotate(-45deg); font-weight: bold;">!</span>
          </div>
        `;

        const incIcon = L.divIcon({
          html: incidentHtml,
          className: 'osm-custom-incident-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const incMarker = L.marker([lat, lng], { icon: incIcon }).addTo(layerGroup);

        incMarker.on('click', () => {
          if (onSelectIncident) onSelectIncident(inc);
        });

        incMarker.bindTooltip(
          `<strong>🚨 ${inc.title}</strong><br>Category: ${inc.category}<br>Severity: <b>${inc.severity}</b><br>Status: <b>${inc.status}</b>`,
          { direction: 'top', offset: [0, -10] }
        );
      });
    }
  }, [drainageSegments, incidents, selectedSegmentId, visibleLayers, showHeatmap, forecastHorizon, viewMode]);

  // Recenter / Pan smoothly if selected segment changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSegmentId) return;
    const target = drainageSegments.find((d) => d.id === selectedSegmentId);
    if (target?.coordinates?.lat && target?.coordinates?.lng) {
      mapInstanceRef.current.flyTo(
        [target.coordinates.lat, target.coordinates.lng],
        16,
        { duration: 1.2 }
      );
    }
  }, [selectedSegmentId, drainageSegments]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(WINNEBA_CENTER, DEFAULT_ZOOM, { duration: 1.0 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-outline-variant/60 shadow-xs select-none ${className}`}>
      {/* OpenStreetMap Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0" />

      {/* Top Left HUD Badge */}
      <div className="absolute top-4 left-4 z-40 bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-outline-variant/80 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-caps text-[11px] font-bold text-on-surface uppercase">
            OpenStreetMap • Winneba GIS
          </span>
        </div>
        <span className="text-[11px] font-data-mono text-outline bg-surface-container px-2 py-0.5 rounded">
          5.3435° N, 0.6257° W
        </span>
      </div>

      {/* Top Right Controls & Layer Toggle */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        {/* Layer Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLayersDropdown(!showLayersDropdown)}
            className="bg-surface-container-lowest/95 hover:bg-surface-container backdrop-blur-md text-on-surface px-3 py-2 rounded-xl shadow-md border border-outline-variant text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">layers</span>
            <span>Map Layers</span>
          </button>

          {showLayersDropdown && (
            <div className="absolute right-0 top-11 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant p-3 w-56 z-50 animate-in fade-in text-body-sm">
              <div className="font-bold text-[11px] uppercase text-outline mb-2">Base Map Style</div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {Object.keys(TILE_PROVIDERS).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setActiveTileType(k);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-semibold text-left truncate cursor-pointer ${
                      activeTileType === k ? 'bg-primary text-white' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {TILE_PROVIDERS[k].name}
                  </button>
                ))}
              </div>

              <div className="border-t border-outline-variant/60 pt-2 font-bold text-[11px] uppercase text-outline mb-1.5">
                GIS Features
              </div>
              <div className="space-y-1 text-[12px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleLayers.drains}
                    onChange={(e) => setVisibleLayers({ ...visibleLayers, drains: e.target.checked })}
                    className="rounded accent-primary"
                  />
                  <span>Drainage Channels</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleLayers.incidents}
                    onChange={(e) => setVisibleLayers({ ...visibleLayers, incidents: e.target.checked })}
                    className="rounded accent-primary"
                  />
                  <span>Reported Incidents</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleLayers.floodZones}
                    onChange={(e) => setVisibleLayers({ ...visibleLayers, floodZones: e.target.checked })}
                    className="rounded accent-primary"
                  />
                  <span>Flood Inundation Zones</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Right Navigation Controls */}
      <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-10 h-10 rounded-xl bg-surface-container-lowest/95 hover:bg-surface-container shadow-md flex items-center justify-center text-on-surface hover:text-primary transition-colors border border-outline-variant cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-10 h-10 rounded-xl bg-surface-container-lowest/95 hover:bg-surface-container shadow-md flex items-center justify-center text-on-surface hover:text-primary transition-colors border border-outline-variant cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter to Winneba (5.34352, -0.62566)"
          className="w-10 h-10 rounded-xl bg-primary text-on-primary shadow-md flex items-center justify-center hover:bg-surface-tint transition-colors cursor-pointer mt-1"
        >
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>
      </div>

      {/* Bottom Left Legend */}
      <div className="absolute bottom-4 left-4 z-40 bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-outline-variant/80 flex items-center gap-3 text-[11px] font-medium text-on-surface">
        <span className="font-bold text-outline uppercase text-[10px]">Legend:</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-risk-critical"></span>
          <span>Critical &gt;80%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-risk-high"></span>
          <span>High 65-80%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
          <span>Healthy Flow</span>
        </div>
      </div>
    </div>
  );
}
