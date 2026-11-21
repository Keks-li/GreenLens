/**
 * Open-Meteo Integration & Compound Flood Prediction Engine
 * Combining real-time meteorological API telemetry from https://open-meteo.com/
 * with hydraulic drainage records and blockage levels from Supabase.
 */

export const OPEN_METEO_DEFAULT_COORDS = {
  latitude: 5.34352,
  longitude: -0.62566,
  city: 'Winneba, Ghana'
};

/**
 * Fetch live weather and forecast data from Open-Meteo API
 */
export async function fetchOpenMeteoForecast(coords = OPEN_METEO_DEFAULT_COORDS) {
  try {
    const lat = coords.latitude || OPEN_METEO_DEFAULT_COORDS.latitude;
    const lon = coords.longitude || OPEN_METEO_DEFAULT_COORDS.longitude;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&hourly=precipitation_probability,precipitation,rain&daily=precipitation_sum,precipitation_probability_max&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo API error: ${res.statusText}`);
    const data = await res.json();

    // Map weather code to human readable description
    const weatherCode = data.current?.weather_code ?? 0;
    const weatherDesc = getWeatherDescription(weatherCode);

    // Compute upcoming 24h & 48h precipitation sums
    const hourlyRain = data.hourly?.precipitation || [];
    const hourlyProb = data.hourly?.precipitation_probability || [];
    const rain24h = hourlyRain.slice(0, 24).reduce((a, b) => a + (Number(b) || 0), 0);
    const rain48h = hourlyRain.slice(0, 48).reduce((a, b) => a + (Number(b) || 0), 0);
    const maxProb24h = Math.max(...hourlyProb.slice(0, 24).map(Number), 0);

    return {
      success: true,
      provider: 'Open-Meteo API (Live)',
      endpoint: 'https://api.open-meteo.com/v1/forecast',
      timestamp: data.current?.time || new Date().toISOString(),
      current: {
        temp: `${Math.round(data.current?.temperature_2m || 28)}°C`,
        humidity: `${data.current?.relative_humidity_2m || 75}%`,
        rainCurrentMm: Number(data.current?.precipitation || 0),
        windSpeed: `${data.current?.wind_speed_10m || 15} km/h`,
        condition: weatherDesc,
        weatherCode
      },
      forecast: {
        rain24hMm: Math.round(rain24h * 10) / 10,
        rain48hMm: Math.round(rain48h * 10) / 10,
        maxProb24h: `${maxProb24h}%`,
        dailySums: data.daily?.precipitation_sum || [],
        dailyDates: data.daily?.time || [],
        hourlyTimes: (data.hourly?.time || []).slice(0, 24),
        hourlyRain: hourlyRain.slice(0, 24),
        hourlyProb: hourlyProb.slice(0, 24)
      }
    };
  } catch (err) {
    console.warn('Open-Meteo fetch failed:', err);
    return {
      success: false,
      provider: 'Open-Meteo (Offline)',
      current: {
        temp: '--°C',
        humidity: '0%',
        rainCurrentMm: 0,
        windSpeed: '0 km/h',
        condition: 'Telemetry Offline',
        weatherCode: 0
      },
      forecast: {
        rain24hMm: 0,
        rain48hMm: 0,
        maxProb24h: '0%',
        dailySums: [],
        dailyDates: [],
        hourlyTimes: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        hourlyRain: Array(24).fill(0),
        hourlyProb: Array(24).fill(0)
      }
    };
  }
}

/**
 * AI Compound Flood Risk Synthesizer
 * Computes individual drain and municipal flood overtopping risks
 * by joining Open-Meteo rainfall intensity with Supabase drainage blockage data.
 */
export function calculateCompoundFloodPredictions(drainageSegments = [], meteoData = null) {
  const rain24h = meteoData?.forecast?.rain24hMm || 28.0;
  const currentRainIntensity = meteoData?.current?.rainCurrentMm || 0;

  const segmentPredictions = drainageSegments.map((drain) => {
    const blockage = Number(drain.blockagePercentage ?? drain.blockage_percent ?? 50);
    const capacityM3s = Number(drain.capacity_m3s || drain.capacity || 25);
    const lengthM = Number(drain.lengthMeters || drain.length_meters || 500);

    // 1. Effective Discharge Capacity (m³/s)
    const effectiveCapacity = Math.max(0.5, capacityM3s * (1 - blockage / 100));

    // 2. Storm Runoff Inflow (m³/s) under Open-Meteo 24h Rain event
    // Q = C * I * A / 360 (Rational Method approximation for urban catchment)
    const runoffCoefficient = 0.75; // Urban impervious surface
    const catchmentAreaHa = Math.max(5, (lengthM * 100) / 10000);
    const estimatedInflowM3s = (runoffCoefficient * (rain24h / 24) * catchmentAreaHa) / 360 * 20;

    // 3. Overtopping / Surcharge Ratio
    const surchargeRatio = estimatedInflowM3s / effectiveCapacity;
    const overtoppingProbability = Math.min(99, Math.round(surchargeRatio * 65 + (blockage * 0.35)));

    // 4. Time to Overflow (Hours)
    let timeToOverflowHours = 'Safe (>24h)';
    if (surchargeRatio >= 1.2) {
      timeToOverflowHours = `${Math.max(1, Math.round(6 / surchargeRatio))} hrs`;
    } else if (surchargeRatio >= 0.8) {
      timeToOverflowHours = '8 - 12 hrs';
    }

    // 5. Compound Risk Score (0 - 100)
    const compoundRiskScore = Math.min(100, Math.round(
      (blockage * 0.45) + (surchargeRatio * 35) + (rain24h > 20 ? 20 : 10)
    ));

    let riskLevel = 'healthy';
    if (compoundRiskScore >= 80) riskLevel = 'critical';
    else if (compoundRiskScore >= 60) riskLevel = 'high';
    else if (compoundRiskScore >= 40) riskLevel = 'moderate';

    return {
      id: drain.id,
      name: drain.name,
      sector: drain.sector,
      blockagePercent: blockage,
      effectiveCapacityM3s: Math.round(effectiveCapacity * 10) / 10,
      estimatedInflowM3s: Math.round(estimatedInflowM3s * 10) / 10,
      overtoppingProbability: `${overtoppingProbability}%`,
      timeToOverflow: timeToOverflowHours,
      compoundRiskScore,
      riskLevel,
      advisory: compoundRiskScore >= 80
        ? `CRITICAL OVERTOPPING RISK: Culvert capacity restricted to ${Math.round(effectiveCapacity)}m³/s. Open-Meteo ${rain24h}mm storm surge will breach banks within ${timeToOverflowHours}. Immediate vac-truck strike recommended.`
        : compoundRiskScore >= 60
        ? `HIGH HAZARD: Moderate silting combined with ${rain24h}mm forecast may surcharge low-elevation inlets.`
        : `STABLE: Channel capacity adequate for ${rain24h}mm projected rainfall.`
    };
  });

  // Calculate Municipal-Wide Flood Index
  const avgRisk = segmentPredictions.length
    ? Math.round(segmentPredictions.reduce((acc, s) => acc + s.compoundRiskScore, 0) / segmentPredictions.length)
    : 0;

  const criticalDrainsCount = segmentPredictions.filter(s => s.riskLevel === 'critical').length;
  const highDrainsCount = segmentPredictions.filter(s => s.riskLevel === 'high').length;

  return {
    municipalRiskIndex: avgRisk,
    alertLevel: avgRisk >= 75 ? 'Critical Flood Warning' : avgRisk >= 55 ? 'High Flood Alert' : 'Advisory Watch',
    criticalDrainsCount,
    highDrainsCount,
    segmentPredictions,
    topRiskDrains: segmentPredictions.sort((a, b) => b.compoundRiskScore - a.compoundRiskScore).slice(0, 5)
  };
}

function getWeatherDescription(code) {
  switch (code) {
    case 0: return 'Clear Sky';
    case 1: return 'Mainly Clear';
    case 2: return 'Partly Cloudy';
    case 3: return 'Overcast';
    case 45: return 'Fog';
    case 51: return 'Light Drizzle';
    case 53: return 'Moderate Drizzle';
    case 55: return 'Dense Drizzle';
    case 61: return 'Slight Rain';
    case 63: return 'Moderate Rain';
    case 65: return 'Heavy Convective Rain';
    case 80: return 'Rain Showers';
    case 81: return 'Heavy Showers';
    case 82: return 'Violent Cloudburst';
    case 95: return 'Thunderstorm Active';
    default: return 'Convective Weather';
  }
}
