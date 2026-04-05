from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


# ── Enums ──────────────────────────────────────────────────────────────────────


class HOSPITAL_TYPE(str, Enum):
    PUBLIC = "PUBLIC"
    PRIVATE = "PRIVATE"
    GENERAL = "GENERAL"
    SPECIALIZED = "SPECIALIZED"
    CHILDREN = "CHILDREN"
    MATERNITY = "MATERNITY"
    RESEARCH = "RESEARCH"
    REHABILITATION = "REHABILITATION"


class COST_RANGE(str, Enum):
    VERY_LOW = "VERY_LOW"
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"


class TEST_TYPE(str, Enum):
    # Kept for reference / future use
    BLOOD = "BLOOD"
    HEART = "HEART"
    BRAIN = "BRAIN"
    LUNG = "LUNG"
    EYE = "EYE"
    BONE = "BONE"
    SKIN = "SKIN"
    GENERAL = "GENERAL"
    LIVER = "LIVER"
    KIDNEY = "KIDNEY"


class LOCATION_TYPE(str, Enum):
    URBAN = "URBAN"
    RURAL = "RURAL"
    SUBURBAN = "SUBURBAN"
    HOSPITAL = "HOSPITAL"
    USER = "USER"
    DOCTOR = "DOCTOR"


# ── Location ───────────────────────────────────────────────────────────────────


class LocationResponse(BaseModel):
    id: Optional[int] = None
    locationType: Optional[LOCATION_TYPE] = None
    address: Optional[str] = None
    thana: Optional[str] = None
    po: Optional[str] = None
    city: Optional[str] = None
    postalCode: Optional[int] = None
    zoneId: Optional[int] = None


# ── Hospital ───────────────────────────────────────────────────────────────────


class HospitalResponse(BaseModel):
    id: int
    name: str
    phoneNumber: Optional[str] = None
    website: Optional[str] = None
    types: List[HOSPITAL_TYPE] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    locationResponse: Optional[LocationResponse] = None


# ── Doctor ─────────────────────────────────────────────────────────────────────


class DoctorHospitalResponse(BaseModel):
    id: Optional[int] = None
    hospitalId: Optional[int] = None
    hospitalName: Optional[str] = None
    appointmentFee: Optional[float] = None
    weeklySchedules: Optional[List[str]] = None
    appointmentTimes: Optional[List[str]] = None


class DoctorResponse(BaseModel):
    id: int
    name: str
    specialties: List[str] = []
    phoneNumber: Optional[str] = None
    email: Optional[str] = None
    locationResponse: Optional[LocationResponse] = None
    doctorHospitals: List[DoctorHospitalResponse] = []
