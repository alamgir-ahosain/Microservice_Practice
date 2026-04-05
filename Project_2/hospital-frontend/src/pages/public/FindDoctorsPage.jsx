// src/pages/public/FindDoctorsPage.jsx
import { useState, useEffect, useMemo } from "react";
import Navbar from "../../components/common/Navbar";
import { FilterBar, SkeletonGrid, ErrorBox, PageHeader } from "../../components/common/UI";
import DoctorCard from "../../components/doctor/DoctorCard";
import { publicDoctorService } from "../../services/publicApi";
import { useTheme } from "../../context/ThemeContext";

export default function FindDoctorsPage({ navigate }) {
  const { T } = useTheme();
  const [doctors,    setDoctors]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterSpec, setFilterSpec] = useState("");

  useEffect(() => {
    publicDoctorService.getAll().then(setDoctors).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const cities   = useMemo(() => [...new Set(doctors.map(d => d.locationResponse?.city).filter(Boolean))].sort(), [doctors]);
  const specs    = useMemo(() => [...new Set(doctors.flatMap(d => d.specialties || []))].sort(), [doctors]);
  const filtered = useMemo(() => doctors.filter(d =>
    (!filterCity || d.locationResponse?.city === filterCity) &&
    (!filterSpec  || d.specialties?.includes(filterSpec)) &&
    (!search      || d.name.toLowerCase().includes(search.toLowerCase()))
  ), [doctors, filterCity, filterSpec, search]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, transition: "background 0.3s" }}>
      <Navbar navigate={navigate} active="doctors" />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 2rem 4rem" }}>
        <PageHeader badge="🩺 DOCTORS DIRECTORY" title="Find Your Doctor" subtitle="Browse verified specialists. Filter by city or specialty." />
        {loading ? <SkeletonGrid /> : error ? <ErrorBox message={error} /> : (
          <>
            <FilterBar
              search={search} setSearch={setSearch} searchPlaceholder="Search by name..."
              selects={[
                { label: "All Cities",      value: filterCity, setter: setFilterCity, options: cities },
                { label: "All Specialties", value: filterSpec, setter: setFilterSpec, options: specs  },
              ]}
              onClear={() => { setSearch(""); setFilterCity(""); setFilterSpec(""); }}
              count={filtered.length} noun="doctor"
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.25rem" }}>
              {filtered.map(doc => <DoctorCard key={doc.id} doctor={doc} onClick={() => navigate("doctor-detail", doc.id)} />)}
              {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", color: T.dimmed, padding: "4rem" }}>No doctors match your filters.</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
