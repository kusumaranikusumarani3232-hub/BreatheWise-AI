import { useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentAQI } from '../services/api';

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

  // Keep a ref to latest location to stabilize refresh
  const locationRef = useRef(location);
  locationRef.current = location;

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

  const selectCity = useCallback((loc) => {
    // Avoid redundant state updates if coordinates are practically identical
    setLocation(prev => {
      if (
        Math.abs(prev.latitude - loc.latitude) < 0.0001 &&
        Math.abs(prev.longitude - loc.longitude) < 0.0001 &&
        prev.name === loc.name
      ) {
        return prev;
      }
      return {
        name: loc.name,
        country: loc.country || '',
        latitude: loc.latitude,
        longitude: loc.longitude
      };
    });
  }, []);

  const refresh = useCallback(() => {
    fetchAQI(locationRef.current);
  }, [fetchAQI]);

  const useBrowserGeolocation = useCallback(() => {
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
  }, []);

  return {
    location,
    aqiData,
    loading,
    error,
    isLocating,
    refresh,
    selectCity,
    useBrowserGeolocation
  };
}
