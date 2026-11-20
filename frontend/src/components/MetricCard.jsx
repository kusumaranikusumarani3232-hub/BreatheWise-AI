import React, { memo } from 'react';

function MetricCardComponent({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  statusText, 
  statusColor = "text-slate-600 bg-slate-100",
  benchmarkText,
  iconColor = "text-teal-600 bg-teal-50"
}) {
  const displayVal = value !== null && value !== undefined ? value : "—";

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-teal-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        </div>
        {statusText && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
            {statusText}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{displayVal}</span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>

      {benchmarkText && (
        <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center gap-1">
          <span>{benchmarkText}</span>
        </p>
      )}
    </div>
  );
}

export default memo(MetricCardComponent);
