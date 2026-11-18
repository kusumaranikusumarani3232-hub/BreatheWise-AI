/**
 * BreatheWise AI Centralized API Service
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function searchLocations(query) {
  try {
    const res = await fetch(`${API_BASE}/api/aqi/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      return data.results || [];
    }
  } catch (err) {
    console.warn("Backend search failed, querying Open-Meteo directly:", err);
  }

  // Direct client fallback to Open-Meteo geocoding if backend is unreachable
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
    if (res.ok) {
      const data = await res.json();
      return (data.results || []).map(item => ({
        id: item.id,
        name: item.name,
        country: item.country || '',
        admin1: item.admin1 || '',
        latitude: item.latitude,
        longitude: item.longitude,
        timezone: item.timezone || 'UTC'
      }));
    }
  } catch (directErr) {
    console.error("Direct geocoding error:", directErr);
  }
  return [];
}

export async function getCurrentAQI(lat, lon, city = '', country = '') {
  try {
    const res = await fetch(
      `${API_BASE}/api/aqi/current?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend AQI failed, querying Open-Meteo directly:", err);
  }

  // Direct client fallback to Open-Meteo
  try {
    const [aqRes, wxRes] = await Promise.all([
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&hourly=pm2_5,pm10,us_aqi&past_hours=24&forecast_hours=24`),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`)
    ]);

    if (aqRes.ok) {
      const aq = await aqRes.json();
      const wx = wxRes.ok ? await wxRes.json() : {};
      const currentAq = aq.current || {};
      const aqi = currentAq.us_aqi || Math.round((currentAq.pm2_5 || 25) * 2.1);
      
      let category = "Good";
      let color = "#10b981";
      let bg_color = "bg-emerald-50 text-emerald-800 border-emerald-200";
      let health_guidance = "Air quality is satisfactory. Safe for outdoor routines.";

      if (aqi > 200) {
        category = "Very Unhealthy";
        color = "#a855f7";
        bg_color = "bg-purple-50 text-purple-800 border-purple-200";
        health_guidance = "Health alert: Inversion trapping smog. Avoid outdoor exercise and seal windows.";
      } else if (aqi > 150) {
        category = "Unhealthy";
        color = "#ef4444";
        bg_color = "bg-red-50 text-red-800 border-red-200";
        health_guidance = "Everyone may experience effects. Use N95 masks outdoors.";
      } else if (aqi > 100) {
        category = "Unhealthy for Sensitive Groups";
        color = "#f97316";
        bg_color = "bg-orange-50 text-orange-800 border-orange-200";
        health_guidance = "Sensitive individuals should reduce heavy exertion outdoors.";
      } else if (aqi > 50) {
        category = "Moderate";
        color = "#eab308";
        bg_color = "bg-amber-50 text-amber-800 border-amber-200";
        health_guidance = "Acceptable air quality for most individuals.";
      }

      const hourly = aq.hourly || {};
      const times = hourly.time || [];
      const pm25s = hourly.pm2_5 || [];
      const pm10s = hourly.pm10 || [];
      const aqis = hourly.us_aqi || [];
      
      const hourly_trends = [];
      for (let i = 0; i < times.length; i += 2) {
        hourly_trends.push({
          time: times[i],
          pm2_5: pm25s[i] || null,
          pm10: pm10s[i] || null,
          us_aqi: aqis[i] || Math.round((pm25s[i] || 20) * 2)
        });
      }

      return {
        city: city || "Detected Location",
        country: country || "",
        latitude: lat,
        longitude: lon,
        aqi: aqi,
        category: category,
        category_level: category.toLowerCase().replace(/ /g, '_'),
        color: color,
        bg_color: bg_color,
        health_guidance: health_guidance,
        dominant_pollutant: "PM2.5",
        pm2_5: currentAq.pm2_5 || 35.0,
        pm10: currentAq.pm10 || 55.0,
        carbon_monoxide: currentAq.carbon_monoxide || 800.0,
        nitrogen_dioxide: currentAq.nitrogen_dioxide || 24.0,
        ozone: currentAq.ozone || 45.0,
        temperature: wx.current ? wx.current.temperature_2m : 22.0,
        humidity: wx.current ? wx.current.relative_humidity_2m : 55.0,
        last_updated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data_source: "Open-Meteo European Atmosphere Monitoring (Direct Client)",
        is_live: true,
        hourly_trends: hourly_trends
      };
    }
  } catch (directErr) {
    console.error("Direct Open-Meteo error:", directErr);
  }

  // Simulated fallback if all networks fail
  return {
    city: city || "Offline Demo City",
    country: country || "",
    latitude: lat,
    longitude: lon,
    aqi: 145,
    category: "Unhealthy for Sensitive Groups",
    category_level: "unhealthy_sensitive",
    color: "#f97316",
    bg_color: "bg-orange-50 text-orange-800 border-orange-200",
    health_guidance: "Members of sensitive groups should limit prolonged outdoor exertion.",
    dominant_pollutant: "PM2.5",
    pm2_5: 52.4,
    pm10: 84.1,
    carbon_monoxide: 1100.0,
    nitrogen_dioxide: 28.5,
    ozone: 38.0,
    temperature: 21.0,
    humidity: 58.0,
    last_updated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    data_source: "Simulated Demo (Offline Mode)",
    is_live: false,
    hourly_trends: []
  };
}

export async function sendAIChat(message, history, aqiContext, userProfile, userGroqKey) {
  try {
    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        aqi_context: aqiContext,
        user_profile: userProfile,
        user_groq_key: userGroqKey
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("AI Chat request failed:", err);
  }

  // Client-side rule-based fallback
  const aqi = aqiContext?.aqi || 120;
  return {
    reply: `### Air Quality Analysis for ${aqiContext?.city || 'your area'} (AQI: ${aqi})\n\n` +
      `At an AQI of ${aqi}, fine particulates (PM2.5) are elevated. \n\n` +
      `**Safety Guidelines:**\n` +
      `- Avoid strenuous outdoor aerobic workouts during early morning inversions.\n` +
      `- Keep home windows sealed when outdoor pollution peaks.\n` +
      `- Use a certified N95 or KF94 mask if commuting near congested traffic corridors.\n` +
      `- Clean kitchen exhaust filters to minimize indoor cooking fume accumulation.\n\n` +
      `*Notice: BreatheWise provides air safety recommendations, not clinical diagnoses.*`,
    mode: "rule_based_fallback",
    model: "breathewise-client-fallback",
    follow_up_suggestions: [
      "Is it safe to go outside today?",
      "Can my children play outdoors?",
      "What precautions should elderly family members take?",
      "How can I improve indoor air quality?"
    ]
  };
}

export async function getDailyPlanner(city, aqi, pm2_5, userProfile, hourlyForecast) {
  try {
    const res = await fetch(`${API_BASE}/api/planner/daily`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city,
        aqi,
        pm2_5,
        user_profile: userProfile,
        hourly_forecast: hourlyForecast
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Daily planner request failed:", err);
  }

  // Client-side fallback routine
  return {
    date: new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    overall_status: aqi > 150 ? "High Smog Alert: Unhealthy" : "Moderate Air Quality",
    safer_outdoor_windows: ["1:00 PM – 3:30 PM (Midday solar mixing window)"],
    morning_routine: {
      time_window: "Morning (6:00 AM – 10:30 AM)",
      title: aqi > 150 ? "Thermal Inversion Smog Spike" : "Morning Commute Caution",
      recommendation: "Keep windows closed. Postpone running to midday. Wear an N95 if commuting outdoors.",
      caution_level: aqi > 150 ? "high" : "medium",
      why: "Cold ground temperatures trap localized vehicular exhaust and dust close to breathing level."
    },
    afternoon_routine: {
      time_window: "Afternoon (11:00 AM – 4:00 PM)",
      title: "Atmospheric Mixing Window",
      recommendation: "Safest window for necessary errands and school pickups.",
      caution_level: "low",
      why: "Solar radiation creates vertical air convection, reducing surface PM2.5 concentrations."
    },
    evening_routine: {
      time_window: "Evening & Night (5:00 PM – 10:00 PM)",
      title: "Night Cooling Inversion",
      recommendation: "Seal doors, operate kitchen range hoods during cooking, and turn on bedroom air purifiers.",
      caution_level: aqi > 150 ? "high" : "low",
      why: "Rapid radiative cooling at sunset re-establishes a thermal ceiling, re-trapping emissions."
    },
    indoor_exercise_alternatives: [
      "Bodyweight Strength Circuit (Pushups, Squats, Planks)",
      "Indoor Stationary Cycling or Treadmill with Air Filter",
      "Restorative Yoga and Core Pilates"
    ],
    low_emission_commute_advice: "Prefer electric metro trains or shared carpooling with internal AC air recirculation.",
    school_and_work_precautions: [
      "Suspend outdoor physical sports during peak morning hours.",
      "Ensure classrooms maintain filtered indoor ventilation."
    ],
    critical_warnings: aqi > 150 ? ["Limit outdoor playtime for young children and seniors."] : []
  };
}

export async function getImpactPresets() {
  try {
    const res = await fetch(`${API_BASE}/api/impact/presets`);
    if (res.ok) return await res.json();
  } catch (err) {}
  return [];
}

export async function getImpactSummary(actions) {
  try {
    const res = await fetch(`${API_BASE}/api/impact/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions })
    });
    if (res.ok) return await res.json();
  } catch (err) {}

  // Fallback calculation
  let totalCo2 = 0;
  let carTrips = 0;
  let km = 0;
  actions.forEach(a => {
    totalCo2 += a.co2_saved_kg || 0;
    if (a.action_type?.includes('transit') || a.action_type?.includes('carpool')) carTrips++;
    km += a.distance_km || 0;
  });

  return {
    total_co2_saved_kg: Number(totalCo2.toFixed(2)),
    car_trips_replaced: carTrips,
    clean_km_traveled: Number(km.toFixed(1)),
    actions_completed: actions.length,
    weekly_breakdown: [
      { day: "Mon", co2_kg: 1.2, actions_count: 1 },
      { day: "Tue", co2_kg: 2.4, actions_count: 2 },
      { day: "Wed", co2_kg: 0.8, actions_count: 1 },
      { day: "Thu", co2_kg: 3.1, actions_count: 2 },
      { day: "Fri", co2_kg: 2.1, actions_count: 1 },
      { day: "Sat", co2_kg: 0.5, actions_count: 1 },
      { day: "Sun", co2_kg: 1.8, actions_count: 1 }
    ],
    calculation_assumptions: [
      "Gasoline car emissions: ~0.18 kg CO2e/km.",
      "Metro/bus emissions: ~0.04 kg CO2e/passenger-km.",
      "Anti-idling factor: 0.25 kg CO2e per 10 min engine cutoff."
    ],
    distinction_disclaimer: "CO2 savings denote greenhouse gas mitigation. Personal PM2.5 protection requires indoor filtration and N95 masks."
  };
}

export async function getCommunityChallenges() {
  try {
    const res = await fetch(`${API_BASE}/api/community/challenges`);
    if (res.ok) return await res.json();
  } catch (err) {}
  return [];
}

export async function getSafetyTips() {
  try {
    const res = await fetch(`${API_BASE}/api/community/tips`);
    if (res.ok) return await res.json();
  } catch (err) {}
  return [];
}

export async function generateShareCard(city, aqi, category, keyAdvice) {
  try {
    const res = await fetch(`${API_BASE}/api/community/share-card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, aqi, category, key_advice: keyAdvice })
    });
    if (res.ok) return await res.json();
  } catch (err) {}

  return {
    title: `Air Quality Alert: ${city} (AQI ${aqi})`,
    card_text: `🚨 BreatheWise Air Safety Alert for ${city}\nAQI: ${aqi} (${category})\nPriority: ${keyAdvice}\n\nWear an N95 mask outdoors, keep windows sealed during dawn and night, and run HEPA air filtration indoors.\n\nBreathe Better. Live Smarter. Protect Your Community.`,
    formatted_html_snippet: `<div class='p-4 border rounded'><h4>${city} - AQI ${aqi} (${category})</h4><p>${keyAdvice}</p></div>`
  };
}
