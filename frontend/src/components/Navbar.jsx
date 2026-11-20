import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  Wind, MapPin, Search, Navigation, RefreshCw, AlertTriangle, 
  X, Menu 
} from 'lucide-react';
import { searchLocations } from '../services/api';

const QUICK_CITIES = [
  { name: "Delhi", country: "India", latitude: 28.65, longitude: 77.23 },
  { name: "Lahore", country: "Pakistan", latitude: 31.55, longitude: 74.34 },
  { name: "Beijing", country: "China", latitude: 39.90, longitude: 116.41 },
  { name: "London", country: "United Kingdom", latitude: 51.51, longitude: -0.13 },
  { name: "New York", country: "United States", latitude: 40.71, longitude: -74.01 },
  { name: "Los Angeles", country: "United States", latitude: 34.05, longitude: -118.24 },
];

function NavbarComponent({ 
  location, 
  aqiData, 
  loading, 
  refresh, 
  selectCity, 
  useBrowserGeolocation, 
  isLocating,
  toggleSidebar
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const data = await searchLocations(searchQuery);
      setResults(data);
      setIsSearching(false);
      setShowDropdown(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCitySelect = (loc) => {
    selectCity(loc);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const aqi = aqiData?.aqi || 0;
  const isSmogHazard = aqi > 150;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Smog Alert Ribbon if severe */}
      {isSmogHazard && (
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs sm:text-sm px-4 py-1.5 flex items-center justify-between font-medium">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <AlertTriangle className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
            <span>
              <strong>Severe Winter Smog Alert in {aqiData?.city}:</strong> Air quality index ({aqi}) is high. Minimize outdoor exertion, seal window drafts, and wear an N95 respirator.
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Wind className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">BreatheWise</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-teal-100 text-teal-800 tracking-wide uppercase">AI</span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium">Breathe Better. Live Smarter.</p>
            </div>
          </div>
        </div>

        {/* Center: Search and Location Bar */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
              placeholder="Search city (e.g. Delhi, London, Beijing)..."
              className="w-full pl-9 pr-20 py-2 text-sm bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl outline-none transition-all duration-150 text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-10 pr-2 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={useBrowserGeolocation}
              disabled={isLocating}
              title="Detect my current location"
              className="absolute inset-y-1 right-1 px-2.5 flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 rounded-lg transition-colors border border-teal-200/60"
            >
              <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin text-teal-600' : ''}`} />
              <span className="hidden sm:inline">{isLocating ? "Locating..." : "GPS"}</span>
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
              <div className="p-2 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                <span>{isSearching ? "Searching..." : "Search Results"}</span>
                <span className="text-[10px] text-slate-400 font-normal">Open-Meteo Geocoding</span>
              </div>
              {results.length > 0 ? (
                results.map((loc, idx) => (
                  <button
                    key={`${loc.name}-${idx}`}
                    onClick={() => handleCitySelect(loc)}
                    className="w-full px-3 py-2.5 text-left text-sm hover:bg-teal-50 flex items-center justify-between text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900">{loc.name}</span>
                        {loc.admin1 && <span className="text-slate-500 text-xs">, {loc.admin1}</span>}
                        {loc.country && <span className="text-slate-500 text-xs">, {loc.country}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {loc.latitude?.toFixed(2)}°, {loc.longitude?.toFixed(2)}°
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  {searchQuery.length >= 2 && !isSearching ? "No matching cities found. Try another query." : "Type a city name to search."}
                </div>
              )}

              {/* Quick Preset Cities */}
              <div className="p-2.5 bg-slate-50/70">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Preset Hotspots</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CITIES.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => handleCitySelect(c)}
                      className="px-2 py-1 text-xs bg-white hover:bg-teal-100 text-slate-700 hover:text-teal-900 border border-slate-200 rounded-md font-medium transition-colors"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Location & Live Status indicator */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 bg-slate-100/90 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-700">
            <span className={`w-2 h-2 rounded-full ${aqiData?.is_live ? 'bg-emerald-500 live-indicator' : 'bg-amber-500'}`} />
            <span className="font-medium text-slate-800">{aqiData?.city || location.name}</span>
            <span className="text-slate-400">|</span>
            <span className="text-[11px] text-slate-500 truncate max-w-[140px]" title={aqiData?.data_source}>
              {aqiData?.is_live ? 'Live Data' : 'Demo Fallback'}
            </span>
          </div>

          <button
            onClick={refresh}
            disabled={loading}
            title="Refresh air quality readings"
            className="p-2 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl border border-slate-200/80 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default memo(NavbarComponent);
