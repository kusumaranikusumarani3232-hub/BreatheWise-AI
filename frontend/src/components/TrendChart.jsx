import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine,
  CartesianGrid 
} from 'recharts';
import { Clock, TrendingUp, Info } from 'lucide-react';

export default function TrendChart({ hourlyData = [] }) {
  const [metric, setMetric] = useState('us_aqi'); // 'us_aqi' | 'pm2_5' | 'pm10'

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 text-center text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">Hourly historical and forecast data is loading or temporarily unavailable for this station.</p>
      </div>
    );
  }

  // Format data for chart display
  const formattedData = hourlyData.map((d) => {
    let label = d.time;
    if (d.time.includes('T')) {
      const parts = d.time.split('T');
      const timePart = parts[1]?.slice(0, 5) || '';
      const datePart = parts[0]?.slice(5) || ''; // MM-DD
      label = `${timePart} (${datePart})`;
    }
    return {
      time: label,
      rawTime: d.time,
      us_aqi: d.us_aqi,
      pm2_5: d.pm2_5,
      pm10: d.pm10,
    };
  });

  const getMetricConfig = () => {
    switch (metric) {
      case 'pm2_5':
        return {
          key: 'pm2_5',
          label: 'PM2.5 Concentration',
          unit: 'µg/m³',
          stroke: '#ef4444',
          fill: '#fca5a5',
          threshold: 55.4,
          thresholdLabel: 'Unhealthy PM2.5 (55 µg/m³)',
        };
      case 'pm10':
        return {
          key: 'pm10',
          label: 'PM10 Concentration',
          unit: 'µg/m³',
          stroke: '#f97316',
          fill: '#fdba74',
          threshold: 154,
          thresholdLabel: 'Unhealthy PM10 (154 µg/m³)',
        };
      default:
        return {
          key: 'us_aqi',
          label: 'Air Quality Index (AQI)',
          unit: 'AQI',
          stroke: '#0d9488',
          fill: '#99f6e4',
          threshold: 150,
          thresholdLabel: 'Unhealthy AQI Threshold (150)',
        };
    }
  };

  const config = getMetricConfig();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <span>Air Quality Trajectory & 24h Forecast</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Diurnal curve showing nighttime thermal inversion peaks and midday dispersion windows.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setMetric('us_aqi')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metric === 'us_aqi' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AQI
          </button>
          <button
            onClick={() => setMetric('pm2_5')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metric === 'pm2_5' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PM2.5
          </button>
          <button
            onClick={() => setMetric('pm10')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metric === 'pm10' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PM10
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.stroke} stopOpacity={0.4} />
                <stop offset="95%" stopColor={config.stroke} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 11, fill: '#94a3b8' }} 
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#94a3b8' }} 
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg border border-slate-700">
                      <p className="font-semibold text-slate-300 mb-1">{label}</p>
                      <p className="text-teal-400 font-bold text-sm">
                        {config.label}: {val} {config.unit}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine 
              y={config.threshold} 
              stroke="#ef4444" 
              strokeDasharray="4 4" 
              label={{ 
                value: config.thresholdLabel, 
                fill: '#ef4444', 
                fontSize: 10, 
                position: 'top' 
              }} 
            />
            <Area 
              type="monotone" 
              dataKey={config.key} 
              stroke={config.stroke} 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#metricGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-red-500 inline-block" />
          <span>Red dashed line marks safe threshold boundary</span>
        </span>
        <span>Data: Open-Meteo Atmosphere Model (Hourly)</span>
      </div>
    </div>
  );
}
