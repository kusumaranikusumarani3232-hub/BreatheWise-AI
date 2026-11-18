import React from 'react';
import { 
  CloudRain, 
  Thermometer, 
  Wind, 
  ShieldAlert, 
  Sparkles, 
  CalendarClock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Activity,
  ArrowRight
} from 'lucide-react';
import AQIBadge from '../components/AQIBadge';
import MetricCard from '../components/MetricCard';
import TrendChart from '../components/TrendChart';

export default function DashboardPage({ aqiData, loading, setActiveTab, userProfile }) {
  if (loading && !aqiData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Fetching real-time atmospheric measurements...</p>
      </div>
    );
  }

  const aqi = aqiData?.aqi || 0;
  const pm25 = aqiData?.pm2_5;
  const pm10 = aqiData?.pm10;
  const temp = aqiData?.temperature;
  const hum = aqiData?.humidity;
  const no2 = aqiData?.nitrogen_dioxide;
  const co = aqiData?.carbon_monoxide;
  const o3 = aqiData?.ozone;

  // Evaluate status tags
  const getPm25Status = (val) => {
    if (val === undefined || val === null) return { text: "No Data", color: "bg-slate-100 text-slate-600" };
    if (val <= 12) return { text: "WHO Safe", color: "bg-emerald-100 text-emerald-800" };
    if (val <= 35.4) return { text: "Moderate", color: "bg-amber-100 text-amber-800" };
    if (val <= 55.4) return { text: "Unhealthy for Sensitive", color: "bg-orange-100 text-orange-800" };
    if (val <= 150.4) return { text: "Unhealthy", color: "bg-red-100 text-red-800" };
    return { text: "Severe Inversion", color: "bg-rose-900 text-rose-100" };
  };

  const pm25Status = getPm25Status(pm25);

  return (
    <div className="space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Smart Air Quality Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time atmospheric monitoring, winter smog tracking, and health advisories for {aqiData?.city}.
          </p>
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult AI Assistant</span>
          </button>
          <button
            onClick={() => setActiveTab('daily-planner')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <CalendarClock className="w-3.5 h-3.5 text-teal-600" />
            <span>Plan Today's Routine</span>
          </button>
        </div>
      </div>

      {/* Main AQI Display Card */}
      <AQIBadge aqiData={aqiData} />

      {/* Key Atmospheric Metrics Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          Key Atmospheric Pollutants & Weather
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <MetricCard
            icon={Wind}
            label="PM2.5"
            value={pm25}
            unit="µg/m³"
            statusText={pm25Status.text}
            statusColor={pm25Status.color}
            benchmarkText="WHO target: < 15 µg/m³"
            iconColor="text-red-600 bg-red-50"
          />
          <MetricCard
            icon={Activity}
            label="PM10"
            value={pm10}
            unit="µg/m³"
            statusText={pm10 > 154 ? "Elevated" : "Acceptable"}
            statusColor={pm10 > 154 ? "bg-orange-100 text-orange-800" : "bg-emerald-100 text-emerald-800"}
            benchmarkText="EPA target: < 54 µg/m³"
            iconColor="text-orange-600 bg-orange-50"
          />
          <MetricCard
            icon={Thermometer}
            label="Temperature"
            value={temp}
            unit="°C"
            benchmarkText={temp && temp < 15 ? "Cool ground air (Inversion risk)" : "Mild surface temp"}
            iconColor="text-sky-600 bg-sky-50"
          />
          <MetricCard
            icon={CloudRain}
            label="Humidity"
            value={hum}
            unit="%"
            benchmarkText={hum && hum > 65 ? "High moisture binds smog" : "Normal relative humidity"}
            iconColor="text-blue-600 bg-blue-50"
          />
          <MetricCard
            icon={Flame}
            label="NO2 (Nitrogen)"
            value={no2}
            unit="µg/m³"
            benchmarkText="Tailpipe & industrial combustion"
            iconColor="text-amber-600 bg-amber-50"
          />
          <MetricCard
            icon={ShieldAlert}
            label="Carbon Monoxide"
            value={co}
            unit="µg/m³"
            benchmarkText="Vehicle incomplete combustion"
            iconColor="text-indigo-600 bg-indigo-50"
          />
        </div>
      </div>

      {/* Hourly Trend Chart */}
      <TrendChart hourlyData={aqiData?.hourly_trends || []} />

      {/* Actionable Health Protection Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Outdoor Exposure */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-sm">
            <Wind className="w-4 h-4 text-teal-600" />
            <h4>Outdoor Exertion Guidance</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            {aqi > 150
              ? "Avoid jogging or strenuous aerobic workouts outdoors. Heavy respiration brings toxic PM2.5 directly into lung alveoli."
              : aqi > 100
              ? "Moderate outdoor cardio. Avoid busy road corridors during early morning rush hour."
              : "Outdoor conditions are favorable for walking, cycling, and recreation."}
          </p>
          <div className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-100">
            {aqi > 150 ? "Wear a certified N95 / FFP2 mask outdoors" : "Cloth masks do not filter fine PM2.5"}
          </div>
        </div>

        {/* Card 2: Indoor Air Protection */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4>Home & Indoor Protocol</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            {aqi > 150
              ? "Keep windows sealed against thermal inversion smog. Run a true HEPA or DIY Corsi-Rosenthal box purifier."
              : "Ventilate your home during peak afternoon sunlight (12 PM - 3 PM) to refresh indoor air."}
          </p>
          <button 
            onClick={() => setActiveTab('indoor-coach')}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Open Indoor Air Quality Coach <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3: Vulnerable Family Shield */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h4>Vulnerable Family Members</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            {userProfile?.has_asthma_respiratory
              ? "Asthma sensitivity is enabled in your profile. Keep rescue inhalers accessible and avoid cold morning air."
              : "Children, seniors, and asthma patients inhale higher particulate concentrations relative to lung capacity."}
          </p>
          <button 
            onClick={() => setActiveTab('settings')}
            className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            Review Family Sensitivity Profile <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
