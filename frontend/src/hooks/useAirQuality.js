import { useState, useEffect, useCallback } from 'react';
import { getCurrentAQI, searchLocations } from '../services/api';

const DEFAULT_LOCATION = {
  name: "Delhi",
  country: "India",
  latitude: 28.65195,
  longitude: 77.23149
};

export function useAirQuality() {
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("breathewise_location");
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const fetchAQI = useCallback(async (loc) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCurrentAQI(loc.latitude, loc.longitude, loc.name, loc.country);
      setAqiData(data);
    } catch (err) {
      console.error("Failed to load air quality:", err);
      setError("Unable to update air quality data. Showing latest cached reading.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAQI(location);
    try {
      localStorage.setItem("breathewise_location", JSON.stringify(location));
    } catch (e) {}
  }, [location, fetchAQI]);

  const selectCity = (loc) => {
    setLocation({
      name: loc.name,
      country: loc.country || '',
      latitude: loc.latitude,
      longitude: loc.longitude
    });
  };

  const useBrowserGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let detectedCity = "My Location";
        let detectedCountry = "";

        // Try reverse geocoding via Open-Meteo or search
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (res.ok) {
            const data = await res.json();
            detectedCity = data.city || data.locality || data.principalSubdivision || "Current Location";
            detectedCountry = data.countryName || "";
          }
        } catch (e) {
          // Fallback to coordinates
          detectedCity = `Lat ${latitude.toFixed(2)}, Lon ${longitude.toFixed(2)}`;
        }

        const newLoc = {
          name: detectedCity,
          country: detectedCountry,
          latitude,
          longitude
        };
        setLocation(newLoc);
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation denied or timed out:", err.message);
        alert("Location access was denied or timed out. You can still search or select any city.");
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  return {
    location,
    aqiData,
    loading,
    error,
    isLocating,
    refresh: () => fetchAQI(location),
    selectCity,
    useBrowserGeolocation
  };
}
