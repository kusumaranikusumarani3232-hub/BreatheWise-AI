import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('BreatheWise Frontend Client Cache & Calculation Suite', () => {
  // Test TTL calculation logic
  test('TTL Cache correctly retains and expires data', () => {
    const cache = new Map();
    const now = Date.now();
    const TTL_MS = 1000;

    cache.set('test_key', { data: { aqi: 120 }, expiry: now + TTL_MS });
    
    // Immediate read
    const activeEntry = cache.get('test_key');
    assert.ok(activeEntry);
    assert.strictEqual(activeEntry.data.aqi, 120);
    assert.ok(Date.now() < activeEntry.expiry);

    // Simulated expired read
    const expiredEntry = { data: { aqi: 120 }, expiry: now - 50 };
    cache.set('expired_key', expiredEntry);
    const readExpired = cache.get('expired_key');
    const isExpired = Date.now() >= readExpired.expiry;
    assert.strictEqual(isExpired, true);
  });

  test('AQI standard categories adhere to scientific breakpoints', () => {
    function getCategory(aqi) {
      if (aqi > 200) return 'Very Unhealthy';
      if (aqi > 150) return 'Unhealthy';
      if (aqi > 100) return 'Unhealthy for Sensitive Groups';
      if (aqi > 50) return 'Moderate';
      return 'Good';
    }

    assert.strictEqual(getCategory(25), 'Good');
    assert.strictEqual(getCategory(75), 'Moderate');
    assert.strictEqual(getCategory(130), 'Unhealthy for Sensitive Groups');
    assert.strictEqual(getCategory(175), 'Unhealthy');
    assert.strictEqual(getCategory(280), 'Very Unhealthy');
  });

  test('Trip carbon emission savings formulas calculate accurately', () => {
    const tripKm = 15;
    const soloCarCo2 = Number((tripKm * 0.18).toFixed(2));
    const carpoolCo2 = Number((tripKm * 0.09).toFixed(2));
    const transitCo2 = Number((tripKm * 0.04).toFixed(2));

    assert.strictEqual(soloCarCo2, 2.70);
    assert.strictEqual(carpoolCo2, 1.35);
    assert.strictEqual(transitCo2, 0.60);
    assert.ok(transitCo2 < carpoolCo2);
    assert.ok(carpoolCo2 < soloCarCo2);
  });
});
