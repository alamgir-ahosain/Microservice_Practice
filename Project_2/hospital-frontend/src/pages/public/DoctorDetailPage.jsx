// src/pages/public/DoctorDetailPage.jsx
import { useState, useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import { InfoCard, InfoRow, SkeletonGrid, ErrorBox, BackButton } from "../../components/common/UI";
import DoctorHero from "../../components/doctor/DoctorHero";
import DoctorHospitalList from "../../components/doctor/DoctorHospitalList";
import { publicDoctorService } from "../../services/publicApi";
import { useTheme } from "../../context/ThemeContext";

export default function DoctorDetailPage({ id, navigate }) {
  const { T } = useTheme();
  const [doctor,  setDoctor]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    publicDoctorService.getById(id).then(setDoctor).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, transition: "background 0.3s" }}>
      <Navbar navigate={navigate} active="doctors" />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "100px 2rem 4rem" }}>
        <BackButton label="Back to Doctors" onClick={() => navigate("doctors")} />
        {loading ? <SkeletonGrid /> : error ? <ErrorBox message={error} /> : doctor && (
          <>
            <DoctorHero doctor={doctor} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
              <InfoCard title="Contact" icon="📞">
                <InfoRow label="Phone" value={doctor.phoneNumber} />
                <InfoRow label="Email" value={doctor.email} />
              </InfoCard>
              <InfoCard title="Location" icon="📍">
                {doctor.locationResponse ? (
                  <>
                    <InfoRow label="Address"    value={doctor.locationResponse.address}      />
                    <InfoRow label="Thana"       value={doctor.locationResponse.thana}         />
                    <InfoRow label="P.O."        value={doctor.locationResponse.po}            />
                    <InfoRow label="City"        value={doctor.locationResponse.city}          />
                    <InfoRow label="Postal Code" value={doctor.locationResponse.postalCode}   />
                    <InfoRow label="Zone"        value={doctor.locationResponse.zoneId}        />
                    <InfoRow label="Type"        value={doctor.locationResponse.locationType}  />
                  </>
                ) : <span style={{ color: T.dimmed, fontSize: "0.84rem" }}>No location on record</span>}
              </InfoCard>
            </div>
            <DoctorHospitalList hospitals={doctor.doctorHospitals} navigate={({ name, id: hId }) => navigate(name, hId)} />
          </>
        )}
      </div>
    </div>
  );
}
