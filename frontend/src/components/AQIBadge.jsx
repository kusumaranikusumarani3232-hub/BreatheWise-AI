import React from 'react';
import { AlertCircle, ShieldAlert, CheckCircle2, Wind, Eye } from 'lucide-react';

export default function AQIBadge({ aqiData }) {
  if (!aqiData) return null;

  const aqi = aqiData.aqi || 0;
  const category = aqiData.category || "Moderate";
  const dominant = aqiData.dominant_pollutant || "PM2.5";
  const healthGuidance = aqiData.health_guidance || "";
  const color = aqiData.color || "#10b981";
  const isLive = aqiData.is_live;
  const dataSource = aqiData.data_source;
  const lastUpdated = aqiData.last_updated;

  // Percentage on 0-500 scale for progress bar indicator (capped at 100%)
  const percentage = Math.min(Math.round((aqi / 400) * 100), 100);

  // Health risk badge color
  const getBadgeIcon = () => {
    if (aqi <= 50) return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    if (aqi <= 100) return <CheckCircle2 className="w-5 h-5 text-amber-600" />;
    if (aqi <= 150) return <AlertCircle className="w-5 h-5 text-orange-600" />;
    return <ShieldAlert className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Background soft ambient glow based on category color */}
      <div 
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      {/* Top Header: Location, Live Status, Data Source */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>{aqiData.city}</span>
            {aqiData.country && <span className="text-sm font-normal text-slate-500">({aqiData.country})</span>}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Updated: <span className="font-medium text-slate-600">{lastUpdated}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isLive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {isLive ? 'Live API Data' : 'Simulated Demo Data'}
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline" title={dataSource}>
            {dataSource.includes('Open-Meteo') ? 'Open-Meteo' : dataSource}
          </span>
        </div>
      </div>

      {/* Main AQI Reading Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Huge AQI number and Category */}
        <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-baseline gap-3">
            <span 
              className="text-6xl sm:text-7xl font-extrabold tracking-tight"
              style={{ color: color }}
            >
              {aqi}
            </span>
            <div className="text-left">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">US AQI</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Pollutant: {dominant}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span 
              className="px-3.5 py-1 rounded-full text-sm font-bold text-white shadow-xs"
              style={{ backgroundColor: color }}
            >
              {category}
            </span>
          </div>
        </div>

        {/* Right Column: Health Guidance & Action */}
        <div className="md:col-span-7 bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
          <div className="flex items-start gap-2.5">
            <div className="shrink-0 mt-0.5">{getBadgeIcon()}</div>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">
                Health Action Guidance
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {healthGuidance}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scale Visualizer Bar */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
          <span>0 Good</span>
          <span>50 Mod</span>
          <span>100 USG</span>
          <span>150 Unhealthy</span>
          <span>200 Very Unhealthy</span>
          <span>300+ Hazardous</span>
        </div>

        <div className="relative h-2.5 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 via-amber-400 via-orange-500 via-red-500 via-purple-600 to-rose-950">
          {/* Pointer indicator */}
          <div 
            className="absolute top-0 bottom-0 w-2 bg-white border border-slate-900 shadow-md rounded-full transform -translate-x-1/2"
            style={{ left: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
