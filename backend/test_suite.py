import sys
import time
from fastapi.testclient import TestClient
import main
from services.aqi_service import aqi_service
from services.groq_service import groq_service

client = TestClient(main.app)

tests_passed = 0
total_tests = 0

def test(name, condition, details=''):
    global tests_passed, total_tests
    total_tests += 1
    if condition:
        tests_passed += 1
        print(f"  [PASS] {name} | {details}")
    else:
        print(f"  [FAIL] {name} | {details}")

print("==========================================================")
print("     BreatheWise AI - Comprehensive Automated Test Suite   ")
print("==========================================================")

# 1. Health & Root Endpoints
r = client.get("/")
test("Root Endpoint", r.status_code == 200, f"Status: {r.status_code}")

r = client.get("/health")
cfg = r.json().get("groq_configured")
test("Health Endpoint", r.status_code == 200 and r.json().get("status") == "healthy", f"Groq Configured: {cfg}")

# 2. Location Geocoding Search
r = client.get("/api/aqi/search?q=London")
results = r.json().get("results", [])
test("Location Search (London)", r.status_code == 200 and len(results) > 0, f"Found {len(results)} locations")

# 2b. Location Search Empty Query (Preset Fallback)
r = client.get("/api/aqi/search?q=")
empty_res = r.json().get("results", [])
test("Location Search Empty Query", r.status_code == 200 and len(empty_res) == 5, f"Returned {len(empty_res)} presets")

# 2c. Location Search Nonexistent Query
r = client.get("/api/aqi/search?q=xyznonexistent99999")
none_res = r.json().get("results", [])
test("Location Search Nonexistent", r.status_code == 200 and len(none_res) == 0, "Correctly returned empty list")

# 3. Live AQI Query for Delhi
r = client.get("/api/aqi/current?lat=28.65195&lon=77.23149&city=Delhi&country=India")
data = r.json()
test("AQI Current (Delhi)", r.status_code == 200 and data.get("aqi") is not None, f"AQI: {data.get('aqi')}, PM2.5: {data.get('pm2_5')}, Category: {data.get('category')}")
test("AQI Dominant Pollutant", data.get("dominant_pollutant") in ["PM2.5", "PM10"], f"Dominant: {data.get('dominant_pollutant')}")
test("AQI Hourly Forecast Data", len(data.get("hourly_trends", [])) > 0, f"{len(data.get('hourly_trends', []))} data points")
test("AQI Weather Metrics", data.get("temperature") is not None and data.get("humidity") is not None, f"Temp: {data.get('temperature')}°C, Humidity: {data.get('humidity')}%")

# 3b. AQI In-Memory TTL Cache Hit
t0 = time.time()
r_cached = client.get("/api/aqi/current?lat=28.65195&lon=77.23149&city=Delhi&country=India")
t_cached = time.time() - t0
cached_data = r_cached.json()
cache_key = "28.65_77.23"
has_cache_entry = cache_key in aqi_service._aqi_cache
test("AQI TTL Cache Hit", r_cached.status_code == 200 and has_cache_entry and t_cached < 0.1, f"Cache verified in {t_cached*1000:.1f}ms")

# 3c. Search TTL Cache Hit
search_cached = "london" in aqi_service._search_cache
test("Search Geocoding Cache Hit", search_cached, "Search cache entry active")

# 3d. Persistent Connection Pool
pool_client = aqi_service._get_client()
test("Persistent Connection Pool", pool_client is not None and not pool_client.is_closed, f"Pooled client active (timeout={pool_client.timeout.read}s)")

# 3e. AQI Query by City Name Endpoint
r = client.get("/api/aqi/city/London")
test("AQI City by Name (London)", r.status_code == 200 and r.json().get("city") is not None, f"City: {r.json().get('city')}")

r = client.get("/api/aqi/city/xyznonexistent99999")
test("AQI City by Name 404 Not Found", r.status_code == 404, f"Status: {r.status_code}")

# 4. Fallback AQI simulation on invalid coordinates
r = client.get("/api/aqi/current?lat=999.0&lon=999.0&city=Nowhere")
test("AQI Graceful Error Fallback", r.status_code == 200, "Graceful fallback returned without crash")

# 5. AI Chat with Rule-Based Fallback
chat_req = {
    "message": "Can my children play outdoors today during smog?",
    "history": [],
    "aqi_context": {"city": "Delhi", "aqi": 175, "category": "Unhealthy", "pm2_5": 92.0},
    "user_profile": {"has_children": True, "has_asthma_respiratory": True}
}
r = client.post("/api/ai/chat", json=chat_req)
ai_res = r.json()
test("AI Chat Assistant Response", r.status_code == 200 and len(ai_res.get("reply", "")) > 50, f"Mode: {ai_res.get('mode')}, Response Length: {len(ai_res.get('reply', ''))} chars")
test("AI Follow-up Suggestions", len(ai_res.get("follow_up_suggestions", [])) > 0, f"{len(ai_res.get('follow_up_suggestions', []))} suggestions")

# 5b. AI Empty Message Validation
r_empty = client.post("/api/ai/chat", json={"message": "   "})
test("AI Chat Empty Validation", r_empty.status_code == 400, "Empty message rejected with 400")

# 5c. AI Direct Rule-Based Engine
rule_reply = groq_service._rule_based_reply("safe to go outside", {"city": "Delhi", "aqi": 220, "category": "Very Unhealthy"}, None)
test("AI Rule-Based Fallback Engine", "not safe" in rule_reply.lower() or "avoid" in rule_reply.lower(), "Rule-based engine produced accurate smog guidance")

# 6. Daily Routine Planner
plan_req = {
    "city": "Delhi",
    "aqi": 175,
    "pm2_5": 92.0,
    "user_profile": {"has_children": True, "has_elderly": True}
}
r = client.post("/api/planner/daily", json=plan_req)
plan = r.json()
test("Daily Routine Planner", r.status_code == 200, f"Status: {plan.get('overall_status')}")
test("Planner Explains Why", len(plan.get("morning_routine", {}).get("why", "")) > 10, "Scientific reasoning provided")

# 7. Impact Tracker
impact_req = {
    "actions": [
        {"id": "1", "date": "2026-11-18", "action_type": "transit_replace_car", "label": "Metro", "distance_km": 15.0, "co2_saved_kg": 2.1, "personal_exposure_reduced": "Air filtered"},
        {"id": "2", "date": "2026-11-18", "action_type": "avoid_idle", "label": "Anti-idle", "distance_km": 0, "co2_saved_kg": 0.25, "personal_exposure_reduced": "No soot"}
    ]
}
r = client.post("/api/impact/summary", json=impact_req)
imp = r.json()
test("Impact Summary Calculation", r.status_code == 200 and imp.get("total_co2_saved_kg") == 2.35, f"Total CO2 Saved: {imp.get('total_co2_saved_kg')} kg")
test("Impact Distinction Disclaimer", "PM2.5" in imp.get("distinction_disclaimer", ""), "CO2 vs PM2.5 distinction clearly emphasized")

# 7b. Impact Presets Endpoint
r_presets = client.get("/api/impact/presets")
test("Impact Presets Endpoint", r_presets.status_code == 200 and len(r_presets.json()) == 6, f"Returned {len(r_presets.json())} presets")

# 7c. Impact Empty Actions
r_empty_imp = client.post("/api/impact/summary", json={"actions": []})
test("Impact Empty Actions Edge Case", r_empty_imp.status_code == 200 and r_empty_imp.json().get("total_co2_saved_kg") == 0.0, "Handled empty actions list cleanly")

# 8. Community Awareness
r = client.get("/api/community/challenges")
test("Community Challenges", r.status_code == 200 and len(r.json()) >= 3, f"{len(r.json())} active challenges")

r = client.get("/api/community/tips")
test("Community Safety Tips", r.status_code == 200 and len(r.json()) >= 3, f"{len(r.json())} safety guides")

# 8b. Community Share Card Generator
share_req = {
    "city": "Delhi",
    "aqi": 185,
    "category": "Unhealthy",
    "key_advice": "Wear N95 masks outdoors and seal windows."
}
r_share = client.post("/api/community/share-card", json=share_req)
test("Community Share Card Generator", r_share.status_code == 200 and "Delhi" in r_share.json().get("card_text", ""), "Share card generated with alert text")

print("----------------------------------------------------------")
print(f"RESULTS: {tests_passed} of {total_tests} tests PASSED.")
print("==========================================================")

if tests_passed == total_tests:
    sys.exit(0)
else:
    sys.exit(1)
