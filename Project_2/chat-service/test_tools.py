"""
Manual test script — run while hospital-service (port 8083) is running:
    python test_tools.py
"""

import json
from tools import (
    hospital_search_tool,
    get_hospital_by_id_tool,
    doctor_search_tool,
    get_doctor_by_id_tool,
)


def p(result):
    """Parse and pretty-print a tool result with accurate count."""
    try:
        parsed = json.loads(result)

        # Determine count:
        # 1. If it's a list, use its length.
        # 2. If it's a dictionary and doesn't contain an error message, it's 1 result.
        # 3. Otherwise (errors or unexpected formats), show 0.
        if isinstance(parsed, list):
            count = len(parsed)
        elif isinstance(parsed, dict) and "error" not in parsed:
            count = 1
        else:
            count = 0

        print(f"  ✓  count={count}")
        print(f"  {json.dumps(parsed, indent=2)[:400]}...")
    except Exception:
        # Fallback for non-JSON or raw text errors
        print(f"  result = {result[:300]}")


# ── hospital_search ────────────────────────────────────────────────────────────

print("\n" + "=" * 55)
print("TESTING  hospital_search")
print("=" * 55)

print("\n1. All hospitals (no filter, top 5):")
p(hospital_search_tool.invoke({}))

print("\n2. Filter by city:")
p(hospital_search_tool.invoke({"city": "Tangail"}))

print("\n3. Filter by hospital type PUBLIC:")
p(hospital_search_tool.invoke({"hospital_types": ["PUBLIC"]}))

print("\n4. Filter by type GENERAL + PRIVATE (array):")
p(hospital_search_tool.invoke({"hospital_types": ["GENERAL", "PRIVATE"]}))

print("\n5. Filter by name (with typo 'Generl Hospitl'):")
p(hospital_search_tool.invoke({"hospital_name": "General Hospitl"}))

print("\n6. Filter by thana:")
p(hospital_search_tool.invoke({"thana": "Sashar"}))

print("\n7. GPS nearby (Dhaka center, 10 km radius):")
p(
    hospital_search_tool.invoke(
        {"latitude": 23.8103, "longitude": 90.4125, "radius_km": 10}
    )
)

print("\n8. Combined: city + type:")
p(hospital_search_tool.invoke({"city": "Dhaka", "hospital_types": ["PRIVATE"]}))


# ── get_hospital_by_id ─────────────────────────────────────────────────────────

print("\n" + "=" * 3)
print("TESTING  get_hospital_by_id")
print("=" * 55)

print("\n1. Hospital ID 1:")
p(get_hospital_by_id_tool.invoke({"hospital_id": 1}))

print("\n2. Hospital ID 2:")
p(get_hospital_by_id_tool.invoke({"hospital_id": 2}))

print("\n3. Non-existent ID 9999:")
print(f"  result = {get_hospital_by_id_tool.invoke({'hospital_id': 9999})}")


# ── doctor_search ──────────────────────────────────────────────────────────────

print("\n" + "=" * 55)
print("TESTING  doctor_search")
print("=" * 55)

print("\n1. All doctors (no filter):")
p(doctor_search_tool.invoke({}))

print("\n2. Filter by specialty 'Cardiology':")
p(doctor_search_tool.invoke({"specialties": ["Cardiology"]}))

print("\n3. Filter by specialty with typo 'Cardiolgy':")
p(doctor_search_tool.invoke({"specialties": ["Cardiolgy"]}))

print("\n4. Filter by city:")
p(doctor_search_tool.invoke({"city": "Tangail"}))

print("\n5. Filter by hospital name:")
p(doctor_search_tool.invoke({"hospital_name": "General Hospital"}))

print("\n6. Filter by doctor name (partial):")
p(doctor_search_tool.invoke({"doctor_name": "Ahmed"}))

print("\n7. Combined: specialty + city:")
p(doctor_search_tool.invoke({"specialties": ["Cardiology"], "city": "Dhaka"}))


# ── get_doctor_by_id ──────────────────────────────────────────────────────────

print("\n" + "=" * 55)
print("TESTING  get_doctor_by_id")
print("=" * 55)

print("\n1. Doctor ID 1:")
p(get_doctor_by_id_tool.invoke({"doctor_id": 1}))

print("\n2. Doctor ID 5:")
p(get_doctor_by_id_tool.invoke({"doctor_id": 5}))

print("\n3. Non-existent ID 9999:")
print(f"  result = {get_doctor_by_id_tool.invoke({'doctor_id': 9999})}")

print("\n" + "=" * 55)
print("ALL TESTS COMPLETE")
print("=" * 55)
