// src/pages/public/HospitalDetailPage.jsx
import { useState, useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import { InfoCard, InfoRow, SkeletonGrid, ErrorBox, BackButton } from "../../components/common/UI";
import HospitalHero from "../../components/hospital/HospitalHero";
import HospitalMap from "../../components/hospital/HospitalMap";
import HospitalDoctorList from "../../components/hospital/HospitalDoctorList";
import { publicHospitalService, publicDoctorService } from "../../services/publicApi";
import { useTheme } from "../../context/ThemeContext";

export default function HospitalDetailPage({ id, navigate }) {
  const { T } = useTheme();
  const [hospital,       setHospital]       = useState(null);
  const [relatedDoctors, setRelatedDoctors] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  useEffect(() => {
    Promise.all([publicHospitalService.getById(id), publicDoctorService.getAll()])
      .then(([h, allDoctors]) => {
        setHospital(h);
        setRelatedDoctors(allDoctors.filter(d => d.doctorHospitals?.some(dh => dh.hospitalId === Number(id))));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, transition: "background 0.3s" }}>
      <Navbar navigate={navigate} active="hospitals" />
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "100px 2rem 4rem" }}>
        <BackButton label="Back to Hospitals" onClick={() => navigate("hospitals")} />
        {loading ? <SkeletonGrid /> : error ? <ErrorBox message={error} /> : hospital && (
          <>
            <HospitalHero hospital={hospital} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
              <InfoCard title="Location Details" icon="📍">
                {hospital.locationResponse ? (
                  <>
                    <InfoRow label="Address"    value={hospital.locationResponse.address}      />
                    <InfoRow label="Thana"       value={hospital.locationResponse.thana}         />
                    <InfoRow label="P.O."        value={hospital.locationResponse.po}            />
                    <InfoRow label="City"        value={hospital.locationResponse.city}          />
                    <InfoRow label="Postal Code" value={hospital.locationResponse.postalCode}   />
                    <InfoRow label="Zone"        value={hospital.locationResponse.zoneId}        />
                    <InfoRow label="Type"        value={hospital.locationResponse.locationType}  />
                  </>
                ) : <span style={{ color: T.dimmed, fontSize: "0.84rem" }}>No location on record</span>}
              </InfoCard>
              <InfoCard title="GPS Coordinates" icon="🌐">
                {hospital.latitude && hospital.longitude ? (
                  <>
                    <InfoRow label="Latitude"  value={hospital.latitude}  />
                    <InfoRow label="Longitude" value={hospital.longitude} />
                    <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <a href={`https://www.google.com/maps?q=${hospital.latitude},${hospital.longitude}`} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(0,145,255,0.1)", border: "1px solid rgba(0,145,255,0.25)", color: T.blue, borderRadius: "8px", padding: "8px 14px", fontSize: "0.8rem", textDecoration: "none", fontWeight: 600 }}>
                        📍 Open in Google Maps →
                      </a>
                      <a href={`https://www.openstreetmap.org/?mlat=${hospital.latitude}&mlon=${hospital.longitude}&zoom=16`} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: T.isDark ? "rgba(0,212,170,0.08)" : "rgba(0,168,135,0.08)", border: `1px solid ${T.teal}33`, color: T.teal, borderRadius: "8px", padding: "8px 14px", fontSize: "0.8rem", textDecoration: "none", fontWeight: 600 }}>
                        🗺️ Open in OpenStreetMap →
                      </a>
                    </div>
                  </>
                ) : <span style={{ color: T.dimmed, fontSize: "0.84rem" }}>No GPS data available</span>}
              </InfoCard>
            </div>

            {hospital.latitude && hospital.longitude && (
              <HospitalMap
                latitude={hospital.latitude}
                longitude={hospital.longitude}
                name={hospital.name}
                address={hospital.locationResponse ? [hospital.locationResponse.address, hospital.locationResponse.city].filter(Boolean).join(", ") : null}
              />
            )}

            <HospitalDoctorList doctors={relatedDoctors} navigate={({ name, id: dId }) => navigate(name, dId)} />
          </>
        )}
      </div>
    </div>
  );
}
