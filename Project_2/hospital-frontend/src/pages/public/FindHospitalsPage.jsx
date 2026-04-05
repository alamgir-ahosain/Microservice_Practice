// src/pages/public/FindHospitalsPage.jsx
import { useState, useEffect, useMemo } from "react";
import Navbar from "../../components/common/Navbar";
import { FilterBar, SkeletonGrid, ErrorBox, PageHeader } from "../../components/common/UI";
import HospitalCard from "../../components/hospital/HospitalCard";
import { publicHospitalService } from "../../services/publicApi";
import { useTheme } from "../../context/ThemeContext";

export default function FindHospitalsPage({ navigate }) {
  const { T } = useTheme();
  const [hospitals,   setHospitals]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [filterCity,  setFilterCity]  = useState("");
  const [filterType,  setFilterType]  = useState("");

  useEffect(() => {
    publicHospitalService.getAll().then(setHospitals).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const cities   = useMemo(() => [...new Set(hospitals.map(h => h.locationResponse?.city).filter(Boolean))].sort(), [hospitals]);
  const types    = useMemo(() => [...new Set(hospitals.flatMap(h => h.types || []))].sort(), [hospitals]);
  const filtered = useMemo(() => hospitals.filter(h =>
    (!filterCity || h.locationResponse?.city === filterCity) &&
    (!filterType  || h.types?.includes(filterType)) &&
    (!search      || h.name.toLowerCase().includes(search.toLowerCase()))
  ), [hospitals, filterCity, filterType, search]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, transition: "background 0.3s" }}>
      <Navbar navigate={navigate} active="hospitals" />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 2rem 4rem" }}>
        <PageHeader badge="🏥 HOSPITALS DIRECTORY" badgeColor="blue" title="Find a Hospital" subtitle="Browse verified hospitals. Filter by city, name, or type." />
        {loading ? <SkeletonGrid /> : error ? <ErrorBox message={error} /> : (
          <>
            <FilterBar
              search={search} setSearch={setSearch} searchPlaceholder="Search by name..."
              selects={[
                { label: "All Cities", value: filterCity, setter: setFilterCity, options: cities },
                { label: "All Types",  value: filterType, setter: setFilterType, options: types  },
              ]}
              onClear={() => { setSearch(""); setFilterCity(""); setFilterType(""); }}
              count={filtered.length} noun="hospital"
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.25rem" }}>
              {filtered.map(h => <HospitalCard key={h.id} hospital={h} onClick={() => navigate("hospital-detail", h.id)} />)}
              {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", color: T.dimmed, padding: "4rem" }}>No hospitals match your filters.</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
