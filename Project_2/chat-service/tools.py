import os
import json
from typing import Annotated, List, Optional
from math import radians, cos, sin, sqrt, atan2

import httpx
from langchain.tools import tool
from rapidfuzz import process, fuzz
from models import HOSPITAL_TYPE, COST_RANGE, TEST_TYPE
from dotenv import load_dotenv

load_dotenv()

# ── Only one service ──────────────────────────────────────────────────────────
BASE = os.getenv("HOSPITAL_SERVICE_URL", "http://localhost:8083")

# Confirmed endpoints from Spring Boot logs:
#   GET  /hospital/v1          → all hospitals
#   GET  /hospital/v1/{id}     → single hospital
#   GET  /api/doctors          → all doctors
#   GET  /api/doctors/{id}     → single doctor


# ── Helpers ───────────────────────────────────────────────────────────────────


def fuzzy_enum_match(value: str, choices: list, threshold: int = 80) -> Optional[str]:
    result = process.extractOne(value, choices, scorer=fuzz.ratio)
    if result and result[1] >= threshold:
        return result[0]
    return None


def _get_all_hospitals(client: httpx.Client) -> list:
    resp = client.get(f"{BASE}/hospital/v1")
    return resp.json() if 200 <= resp.status_code < 300 else []


def _get_all_doctors(client: httpx.Client) -> list:
    resp = client.get(f"{BASE}/api/doctors")
    return resp.json() if 200 <= resp.status_code < 300 else []


def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371
    dlat = radians(lat1 - lat2)
    dlon = radians(lon1 - lon2)
    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat2)) * cos(radians(lat1)) * sin(dlon / 2) ** 2
    )
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


# ── hospital_search ───────────────────────────────────────────────────────────


@tool("hospital_search", return_direct=False)
def hospital_search_tool(
    hospital_types: Annotated[
        Optional[List[str]],
        "Hospital types e.g. PUBLIC, PRIVATE, GENERAL, SPECIALIZED, CHILDREN, MATERNITY, RESEARCH, REHABILITATION. Typos allowed.",
    ] = None,
    city: Annotated[Optional[str], "City name. Typos allowed."] = None,
    thana: Annotated[Optional[str], "Thana/Upazila. Typos allowed."] = None,
    hospital_name: Annotated[Optional[str], "Hospital name. Typos allowed."] = None,
    latitude: Annotated[Optional[float], "Latitude for nearby search."] = None,
    longitude: Annotated[Optional[float], "Longitude for nearby search."] = None,
    radius_km: Annotated[Optional[float], "Radius in km for nearby search."] = None,
    top_n: Annotated[Optional[int], "Max results. Default 5."] = 5,
) -> str:
    """
    Search hospitals by type, city, thana, name, or GPS proximity.
    All filters optional, combined with AND logic. Typos tolerated.
    """
    client = httpx.Client(timeout=10)
    try:
        hospitals = _get_all_hospitals(client)
        if not hospitals:
            return json.dumps({"error": "Could not reach hospital service."})

        valid_types = [e.value for e in HOSPITAL_TYPE]
        matched_types = []
        if hospital_types:
            matched_types = [
                m for t in hospital_types if (m := fuzzy_enum_match(t, valid_types))
            ]

        def passes(h):
            if matched_types:
                h_types = h.get("types") or []
                if not any(ht in h_types for ht in matched_types):
                    return False
            loc = h.get("locationResponse") or {}
            if city:
                if (
                    fuzz.partial_ratio(city.lower(), (loc.get("city") or "").lower())
                    < 75
                ):
                    return False
            if thana:
                if (
                    fuzz.partial_ratio(thana.lower(), (loc.get("thana") or "").lower())
                    < 75
                ):
                    return False
            if hospital_name:
                if (
                    fuzz.partial_ratio(
                        hospital_name.lower(), (h.get("name") or "").lower()
                    )
                    < 75
                ):
                    return False
            if latitude is not None and longitude is not None and radius_km is not None:
                lat2, lon2 = h.get("latitude"), h.get("longitude")
                if lat2 is None or lon2 is None:
                    return False
                if _haversine_km(latitude, longitude, lat2, lon2) > radius_km:
                    return False
            return True

        filtered = [h for h in hospitals if passes(h)][:top_n]
        return json.dumps(filtered)
    except Exception as e:
        return json.dumps({"error": str(e)})
    finally:
        client.close()


# ── get_hospital_by_id ────────────────────────────────────────────────────────


@tool("get_hospital_by_id", return_direct=False)
def get_hospital_by_id_tool(hospital_id: Annotated[int, "Numeric hospital ID."]) -> str:
    """Get full details of one hospital by its ID (name, location, phone, website, types)."""
    try:
        resp = httpx.get(f"{BASE}/hospital/v1/{hospital_id}", timeout=10)
        return (
            resp.text
            if 200 <= resp.status_code < 300
            else f"Error: hospital {hospital_id} not found."
        )
    except Exception as e:
        return f"Error: {e}"


# ── doctor_search ─────────────────────────────────────────────────────────────


@tool("doctor_search", return_direct=False)
def doctor_search_tool(
    specialties: Annotated[
        Optional[List[str]],
        "Medical specialties e.g. Cardiology, Neurology. Typos allowed.",
    ] = None,
    doctor_name: Annotated[Optional[str], "Doctor name. Typos allowed."] = None,
    city: Annotated[Optional[str], "City. Typos allowed."] = None,
    hospital_name: Annotated[
        Optional[str], "Hospital the doctor works at. Typos allowed."
    ] = None,
    top_n: Annotated[Optional[int], "Max results. Default 10."] = 10,
) -> str:
    """
    Search doctors by specialty, name, city, or hospital.
    All filters optional. Typos tolerated.
    """
    client = httpx.Client(timeout=10)
    try:
        doctors = _get_all_doctors(client)
        if not doctors:
            return json.dumps(
                {"error": "Could not reach hospital service for doctors."}
            )

        def passes(doc):
            if specialties:
                doc_specs = [s.lower() for s in (doc.get("specialties") or [])]
                if not any(
                    fuzz.partial_ratio(s.lower(), ds) >= 75
                    for s in specialties
                    for ds in doc_specs
                ):
                    return False
            if doctor_name:
                if (
                    fuzz.partial_ratio(
                        doctor_name.lower(), (doc.get("name") or "").lower()
                    )
                    < 75
                ):
                    return False
            if city:
                loc = doc.get("locationResponse") or {}
                if (
                    fuzz.partial_ratio(city.lower(), (loc.get("city") or "").lower())
                    < 75
                ):
                    return False
            if hospital_name:
                hosp_list = doc.get("doctorHospitals") or []
                if not any(
                    fuzz.partial_ratio(
                        hospital_name.lower(), (h.get("hospitalName") or "").lower()
                    )
                    >= 75
                    for h in hosp_list
                ):
                    return False
            return True

        filtered = [d for d in doctors if passes(d)][:top_n]
        return json.dumps(filtered)
    except Exception as e:
        return json.dumps({"error": str(e)})
    finally:
        client.close()


# ── get_doctor_by_id ──────────────────────────────────────────────────────────


@tool("get_doctor_by_id", return_direct=False)
def get_doctor_by_id_tool(doctor_id: Annotated[int, "Numeric doctor ID."]) -> str:
    """Get full details of one doctor by their ID (name, specialties, phone, email, hospitals, schedules)."""
    try:
        resp = httpx.get(f"{BASE}/api/doctors/{doctor_id}", timeout=10)
        return (
            resp.text
            if 200 <= resp.status_code < 300
            else f"Error: doctor {doctor_id} not found."
        )
    except Exception as e:
        return f"Error: {e}"
