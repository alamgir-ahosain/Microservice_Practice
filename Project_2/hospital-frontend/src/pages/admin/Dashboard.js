// src/pages/admin/Dashboard.js
import { useEffect, useState } from "react";
import axios from "axios";

const BASE = "http://localhost:8083";
function api(token) {
  return axios.create({ baseURL: BASE, headers: { Authorization: `Bearer ${token}` } });
}

const HOSPITAL_TYPES  = ["PUBLIC","PRIVATE","GENERAL","SPECIALIZED","CHILDREN","MATERNITY","RESEARCH","REHABILITATION"];
const LOCATION_TYPES  = ["USER","DOCTOR","SUBURBAN","HOSPITAL","CLINIC","OTHER"];

function Modal({ title, onClose, children }) {
  return (
    <div style={m.overlay}>
      <div style={m.box}>
        <div style={m.header}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={m.closeBtn}>✕</button>
        </div>
        <div style={{ padding: "1.5rem", maxHeight: "75vh", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={m.overlay}>
      <div style={{ ...m.box, maxWidth: "400px" }}>
        <div style={m.header}>
          <h3 style={{ margin: 0 }}>⚠️ Confirm Delete</h3>
          <button onClick={onCancel} style={m.closeBtn}>✕</button>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <p style={{ color: "#4a5568", marginBottom: "1.5rem" }}>{message}</p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={onConfirm} style={{ ...f.btn, background: "#e53e3e" }}>🗑️ Yes, Delete</button>
            <button onClick={onCancel}  style={{ ...f.btn, background: "#718096" }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorForm({ initial = {}, hospitals = [], onSave, onCancel, loading }) {
  const loc = initial.locationResponse || {};
  const [form, setForm] = useState({
    name:           initial.name        || "",
    email:          initial.email       || "",
    phoneNumber:    initial.phoneNumber || "",
    specialtiesRaw: (initial.specialties || []).join(", "),
    address:      loc.address      || "",
    thana:        loc.thana        || "",
    po:           loc.po           || "",
    city:         loc.city         || "",
    postalCode:   loc.postalCode   || "",
    zoneId:       loc.zoneId       || "",
    locationType: loc.locationType || "",
    selectedHospitalIds: (initial.doctorHospitals || []).map((dh) => dh.hospitalId),
  });

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleHospital = (id) =>
    setForm((p) => ({
      ...p,
      selectedHospitalIds: p.selectedHospitalIds.includes(id)
        ? p.selectedHospitalIds.filter((h) => h !== id)
        : [...p.selectedHospitalIds, id],
    }));

  const handleSubmit = () => {
    const hasLocation = form.city || form.address || form.zoneId;
    onSave({
      name:        form.name,
      email:       form.email,
      phoneNumber: form.phoneNumber,
      specialties: form.specialtiesRaw
        ? form.specialtiesRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      location: hasLocation ? {
        address:      form.address,
        thana:        form.thana,
        po:           form.po,
        city:         form.city,
        postalCode:   form.postalCode ? parseInt(form.postalCode) : null,
        zoneId:       form.zoneId     ? parseInt(form.zoneId)     : null,
        locationType: form.locationType || null,
      } : null,
      doctorHospitals: form.selectedHospitalIds.map((id) => ({ hospitalId: id })),
    });
  };

  return (
    <div>
      <p style={f.sectionLabel}>👨‍⚕️ Basic Information</p>
      {[
        { name: "name",           label: "Full Name",                     placeholder: "Dr. John Doe" },
        { name: "email",          label: "Email",                         placeholder: "doctor@example.com" },
        { name: "phoneNumber",    label: "Phone Number",                  placeholder: "01700000000" },
        { name: "specialtiesRaw", label: "Specialties (comma-separated)", placeholder: "Cardiology, Surgery" },
      ].map(({ name, label, placeholder }) => (
        <div key={name} style={{ marginBottom: "1rem" }}>
          <label style={f.label}>{label}</label>
          <input name={name} value={form[name]} onChange={set} style={f.input} placeholder={placeholder} />
        </div>
      ))}

      <p style={f.sectionLabel}>📍 Location (optional)</p>
      {[
        { name: "address", label: "Address" },
        { name: "thana",   label: "Thana" },
        { name: "po",      label: "Post Office (PO)" },
        { name: "city",    label: "City" },
        { name: "postalCode", label: "Postal Code" },
        { name: "zoneId",     label: "Zone ID" },
      ].map(({ name, label }) => (
        <div key={name} style={{ marginBottom: "0.85rem" }}>
          <label style={f.label}>{label}</label>
          <input name={name} value={form[name]} onChange={set} style={f.input} placeholder={label} />
        </div>
      ))}
      <div style={{ marginBottom: "1rem" }}>
        <label style={f.label}>Location Type</label>
        <select name="locationType" value={form.locationType} onChange={set} style={f.input}>
          <option value="">-- Select --</option>
          {LOCATION_TYPES.map((lt) => <option key={lt} value={lt}>{lt}</option>)}
        </select>
      </div>

      <p style={f.sectionLabel}>🏥 Assign to Hospitals (optional)</p>
      {hospitals.length === 0
        ? <p style={{ color: "#718096", fontSize: "0.85rem", marginBottom: "1rem" }}>No hospitals registered yet.</p>
        : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {hospitals.map((h) => {
              const selected = form.selectedHospitalIds.includes(h.id);
              return (
                <button key={h.id} onClick={() => toggleHospital(h.id)} style={{
                  padding: "0.35rem 0.9rem", borderRadius: "20px", border: "1.5px solid",
                  cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
                  ...(selected
                    ? { background: "#2b6cb0", color: "#fff", borderColor: "#2b6cb0" }
                    : { background: "#fff", color: "#4a5568", borderColor: "#cbd5e0" }),
                }}>{h.name}</button>
              );
            })}
          </div>
        )
      }

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <button onClick={handleSubmit} disabled={loading} style={{ ...f.btn, background: "#38a169" }}>
          {loading ? "Saving..." : "💾 Save Doctor"}
        </button>
        <button onClick={onCancel} style={{ ...f.btn, background: "#718096" }}>Cancel</button>
      </div>
    </div>
  );
}

function HospitalForm({ initial = {}, onSave, onCancel, loading }) {
  const loc = initial.locationResponse || initial.location || {};
  const [form, setForm] = useState({
    name: initial.name || "", phoneNumber: initial.phoneNumber || "",
    website: initial.website || "", latitude: initial.latitude || "",
    longitude: initial.longitude || "", types: initial.types || [],
    address: loc.address || "", thana: loc.thana || "", po: loc.po || "",
    city: loc.city || "", postalCode: loc.postalCode || "",
    zoneId: loc.zoneId || "", locationType: loc.locationType || "",
  });
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleType = (type) =>
    setForm((p) => ({ ...p, types: p.types.includes(type) ? p.types.filter((t) => t !== type) : [...p.types, type] }));
  const handleSubmit = () => {
    onSave({
      name: form.name, phoneNumber: form.phoneNumber, website: form.website,
      latitude:  form.latitude  ? parseFloat(form.latitude)  : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      types: form.types,
      location: {
        address: form.address, thana: form.thana, po: form.po, city: form.city,
        postalCode: form.postalCode ? parseInt(form.postalCode) : null,
        zoneId:     form.zoneId    ? parseInt(form.zoneId)     : null,
        locationType: form.locationType || null,
      },
    });
  };
  return (
    <div>
      <p style={f.sectionLabel}>🏥 Basic Information</p>
      {[{name:"name",label:"Hospital Name"},{name:"phoneNumber",label:"Phone"},{name:"website",label:"Website"}].map(({ name, label }) => (
        <div key={name} style={{ marginBottom: "1rem" }}>
          <label style={f.label}>{label}</label>
          <input name={name} value={form[name]} onChange={set} style={f.input} placeholder={label} />
        </div>
      ))}
      <p style={f.sectionLabel}>📍 Coordinates</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        {[{name:"latitude",ph:"-90 to 90"},{name:"longitude",ph:"-180 to 180"}].map(({name,ph})=>(
          <div key={name}>
            <label style={f.label}>{name.charAt(0).toUpperCase()+name.slice(1)}</label>
            <input name={name} value={form[name]} onChange={set} style={f.input} placeholder={ph} type="number" />
          </div>
        ))}
      </div>
      <p style={f.sectionLabel}>🏷️ Hospital Types</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {HOSPITAL_TYPES.map((type) => (
          <button key={type} onClick={() => toggleType(type)} style={{
            padding: "0.35rem 0.85rem", borderRadius: "20px", border: "1.5px solid",
            cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
            ...(form.types.includes(type)
              ? { background: "#2b6cb0", color: "#fff", borderColor: "#2b6cb0" }
              : { background: "#fff", color: "#4a5568", borderColor: "#cbd5e0" }),
          }}>{type}</button>
        ))}
      </div>
      <p style={f.sectionLabel}>📦 Location Details</p>
      {[
        {name:"address",label:"Address"},{name:"thana",label:"Thana"},
        {name:"po",label:"Post Office (PO)"},{name:"city",label:"City"},
        {name:"postalCode",label:"Postal Code"},{name:"zoneId",label:"Zone ID"},
      ].map(({ name, label }) => (
        <div key={name} style={{ marginBottom: "1rem" }}>
          <label style={f.label}>{label}</label>
          <input name={name} value={form[name]} onChange={set} style={f.input} placeholder={label} />
        </div>
      ))}
      <div style={{ marginBottom: "1rem" }}>
        <label style={f.label}>Location Type</label>
        <select name="locationType" value={form.locationType} onChange={set} style={f.input}>
          <option value="">-- Select --</option>
          {LOCATION_TYPES.map((lt) => <option key={lt} value={lt}>{lt}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
        <button onClick={handleSubmit} disabled={loading} style={{ ...f.btn, background: "#38a169" }}>
          {loading ? "Saving..." : "💾 Save Hospital"}
        </button>
        <button onClick={onCancel} style={{ ...f.btn, background: "#718096" }}>Cancel</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const token    = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin  = userData.role === "ADMIN";

  const [activeNav,    setActiveNav]    = useState("view");
  const [doctors,      setDoctors]      = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [hospitals,    setHospitals]    = useState([]);
  const [activeTab,    setActiveTab]    = useState("patients");
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const [selectedDoctor,   setSelectedDoctor]   = useState(null);
  const [showUpdateDoctor, setShowUpdateDoctor] = useState(false);
  const [deleteDoctor,     setDeleteDoctor]     = useState(null);
  const [selectedHospital,   setSelectedHospital]   = useState(null);
  const [showUpdateHospital, setShowUpdateHospital] = useState(false);
  const [deleteHospital,     setDeleteHospital]     = useState(null);

  useEffect(() => {
    if (!token) { window.location.href = "/login"; return; }
    console.log("🔑 Token found:", token.substring(0, 40) + "...");
    console.log("👤 User:", userData);
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const http = api(token);
      const [pRes, dRes, aRes] = await Promise.all([
        http.get("/api/patients"),
        http.get("/api/doctors"),
        http.get("/api/appointments"),
      ]);
      setPatients(pRes.data);
      setDoctors(dRes.data);
      setAppointments(aRes.data);
      try { const hRes = await http.get("/hospital/v1"); setHospitals(hRes.data); } catch (_) {}
    } catch (e) {
      showMsg("Failed to load data.", true);
    } finally { setLoading(false); }
  };

  const showMsg = (msg, isError = false) => {
    isError ? setError(msg) : setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  };

  // ── DOCTOR HANDLERS ──────────────────────────────────────────────────────

  const handleAddDoctor = async (payload) => {
    setSaving(true);
    console.group("=== ADD DOCTOR ===");
    console.log("URL: POST http://localhost:8083/api/doctors");
    console.log("Token (first 40):", token ? token.substring(0, 40) + "..." : "❌ MISSING TOKEN");
    console.log("Role in localStorage:", userData.role);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.groupEnd();
    try {
      const res = await api(token).post("/api/doctors", payload);
      console.log("✅ Doctor created:", res.status, res.data);
      showMsg("✅ Doctor added!"); setActiveNav("view"); fetchAll();
    } catch (e) {
      console.group("❌ ADD DOCTOR FAILED");
      console.error("HTTP Status:", e.response?.status);
      console.error("Response body:", e.response?.data);
      console.error("Request URL:", e.config?.url);
      console.error("Request headers sent:", e.config?.headers);
      console.groupEnd();
      showMsg("❌ " + (e.response?.data?.message || e.response?.data || e.message), true);
    }
    finally { setSaving(false); }
  };

  const handleUpdateDoctor = async (payload) => {
    setSaving(true);
    console.log("=== UPDATE DOCTOR id:", selectedDoctor.id, "===", payload);
    try {
      await api(token).put(`/api/doctors/${selectedDoctor.id}`, payload);
      console.log("✅ Doctor updated");
      showMsg("✅ Doctor updated!"); setShowUpdateDoctor(false); setSelectedDoctor(null); fetchAll();
    } catch (e) {
      console.error("❌ UPDATE DOCTOR status:", e.response?.status, e.response?.data);
      showMsg("❌ " + (e.response?.data?.message || e.message), true);
    }
    finally { setSaving(false); }
  };

  const handleDeleteDoctor = async () => {
    setSaving(true);
    console.log("=== DELETE DOCTOR id:", deleteDoctor.id, "===");
    try {
      await api(token).delete(`/api/doctors/${deleteDoctor.id}`);
      console.log("✅ Doctor deleted");
      showMsg("✅ Doctor deleted."); setDeleteDoctor(null); fetchAll();
    } catch (e) {
      console.error("❌ DELETE DOCTOR status:", e.response?.status, e.response?.data);
      showMsg("❌ " + (e.response?.data?.message || e.message), true);
    }
    finally { setSaving(false); }
  };

  // ── HOSPITAL HANDLERS ────────────────────────────────────────────────────

  const handleAddHospital = async (payload) => {
    setSaving(true);
    console.log("=== ADD HOSPITAL ===", payload);
    try {
      await api(token).post("/hospital/v1/register", payload);
      console.log("✅ Hospital registered");
      showMsg("✅ Hospital registered!"); setActiveNav("view"); fetchAll();
    } catch (e) {
      console.error("❌ ADD HOSPITAL status:", e.response?.status, e.response?.data);
      showMsg("❌ " + (e.response?.data?.message || e.message), true);
    }
    finally { setSaving(false); }
  };

  const handleUpdateHospital = async (payload) => {
    setSaving(true);
    try {
      await api(token).put(`/hospital/v1/${selectedHospital.id}`, payload);
      showMsg("✅ Hospital updated!"); setShowUpdateHospital(false); setSelectedHospital(null); fetchAll();
    } catch (e) {
      console.error("❌ UPDATE HOSPITAL status:", e.response?.status, e.response?.data);
      showMsg("❌ " + (e.response?.data?.message || e.message), true);
    }
    finally { setSaving(false); }
  };

  const handleDeleteHospital = async () => {
    setSaving(true);
    try {
      await api(token).delete(`/hospital/v1/${deleteHospital.id}`);
      showMsg("✅ Hospital deleted."); setDeleteHospital(null); fetchAll();
    } catch (e) {
      console.error("❌ DELETE HOSPITAL status:", e.response?.status, e.response?.data);
      showMsg("❌ " + (e.response?.data?.message || e.message), true);
    }
    finally { setSaving(false); }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = "/login"; };

  const navBtn = (key, label) => (
    <button onClick={() => { setActiveNav(key); fetchAll(); }}
      style={{ ...s.navBtn, ...(activeNav === key ? s.navBtnActive : {}) }}>{label}</button>
  );

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navTitle}>🏥 Hospital Management</span>
        <div style={s.navCenter}>
          {navBtn("view", "📋 Dashboard")}
          {isAdmin && (<>
            <span style={s.divider} />
            <span style={s.groupLabel}>Doctors</span>
            {navBtn("addDoctor",    "➕ Add Doctor")}
            {navBtn("updateDoctor", "✏️ Manage Doctors")}
            <span style={s.divider} />
            <span style={s.groupLabel}>Hospitals</span>
            {navBtn("addHospital",    "➕ Add Hospital")}
            {navBtn("updateHospital", "✏️ Manage Hospitals")}
          </>)}
        </div>
        <div style={s.navRight}>
          <span style={s.navUser}>👤 {userData.name} ({userData.role})</span>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem" }}>
        {error   && <div style={s.errorMsg}>{error}</div>}
        {success && <div style={s.successMsg}>{success}</div>}
      </div>

      {activeNav === "addDoctor" && (
        <div style={s.content}>
          <div style={{ ...s.formCard, maxWidth: "640px" }}>
            <h2 style={s.formTitle}>➕ Add New Doctor</h2>
            <DoctorForm hospitals={hospitals} onSave={handleAddDoctor} onCancel={() => setActiveNav("view")} loading={saving} />
          </div>
        </div>
      )}

      {activeNav === "updateDoctor" && (
        <div style={s.content}>
          <h2 style={{ color: "#2d3748", marginBottom: "0.25rem" }}>✏️ Manage Doctors</h2>
          <p style={{ color: "#718096", marginBottom: "1.5rem" }}>Edit or remove doctors.</p>
          {loading ? <p>Loading...</p> : doctors.length === 0
            ? <p style={{ color: "#718096" }}>No doctors found.</p>
            : (
            <div style={{ overflowX: "auto" }}>
              <table style={t.table}>
                <thead><tr>{["ID","Name","Email","Phone","Specialties","Hospitals","Actions"].map((h) => <th key={h} style={t.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {doctors.map((doc, i) => (
                    <tr key={doc.id} style={i%2===0?{}:{background:"#f7fafc"}}
                      onMouseEnter={(e)=>(e.currentTarget.style.background="#ebf8ff")}
                      onMouseLeave={(e)=>(e.currentTarget.style.background=i%2===0?"#fff":"#f7fafc")}>
                      <td style={t.td}>{doc.id}</td>
                      <td style={t.td}>{doc.name}</td>
                      <td style={t.td}>{doc.email||"-"}</td>
                      <td style={t.td}>{doc.phoneNumber||"-"}</td>
                      <td style={t.td}>{(doc.specialties||[]).map((sp)=><span key={sp} style={s.badge}>{sp}</span>)}</td>
                      <td style={t.td}>{(doc.doctorHospitals||[]).map((dh)=><span key={dh.hospitalId} style={s.typeBadge}>{dh.hospitalName}</span>)}</td>
                      <td style={t.td}>
                        <div style={{ display:"flex", gap:"0.5rem" }}>
                          <button onClick={() => { setSelectedDoctor(doc); setShowUpdateDoctor(true); }} style={s.editBtn}>✏️ Edit</button>
                          <button onClick={() => setDeleteDoctor(doc)} style={s.delBtn}>🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeNav === "addHospital" && (
        <div style={s.content}>
          <div style={{ ...s.formCard, maxWidth: "640px" }}>
            <h2 style={s.formTitle}>🏥 Register New Hospital</h2>
            <HospitalForm onSave={handleAddHospital} onCancel={() => setActiveNav("view")} loading={saving} />
          </div>
        </div>
      )}

      {activeNav === "updateHospital" && (
        <div style={s.content}>
          <h2 style={{ color: "#2d3748", marginBottom: "0.25rem" }}>🏥 Manage Hospitals</h2>
          <p style={{ color: "#718096", marginBottom: "1.5rem" }}>Edit or remove hospitals.</p>
          {loading ? <p>Loading...</p> : hospitals.length === 0
            ? <p style={{ color: "#718096" }}>No hospitals found.</p>
            : (
            <div style={{ overflowX: "auto" }}>
              <table style={t.table}>
                <thead><tr>{["ID","Name","Phone","City","Types","Actions"].map((h) => <th key={h} style={t.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {hospitals.map((hosp, i) => (
                    <tr key={hosp.id} style={i%2===0?{}:{background:"#f7fafc"}}
                      onMouseEnter={(e)=>(e.currentTarget.style.background="#ebf8ff")}
                      onMouseLeave={(e)=>(e.currentTarget.style.background=i%2===0?"#fff":"#f7fafc")}>
                      <td style={t.td}>{hosp.id}</td>
                      <td style={t.td}>{hosp.name}</td>
                      <td style={t.td}>{hosp.phoneNumber||"-"}</td>
                      <td style={t.td}>{hosp.locationResponse?.city||hosp.location?.city||"-"}</td>
                      <td style={t.td}>{(hosp.types||[]).map((type)=><span key={type} style={s.typeBadge}>{type}</span>)}</td>
                      <td style={t.td}>
                        <div style={{ display:"flex", gap:"0.5rem" }}>
                          <button onClick={() => { setSelectedHospital(hosp); setShowUpdateHospital(true); }} style={s.editBtn}>✏️ Edit</button>
                          <button onClick={() => setDeleteHospital(hosp)} style={s.delBtn}>🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeNav === "view" && (
        <div style={s.content}>
          <div style={s.tabs}>
            {["patients","doctors","appointments","hospitals"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {loading && <p style={{ color: "#718096" }}>Loading...</p>}
          {!loading && activeTab === "patients" && (
            <SimpleTable title="Patients" data={patients} columns={["id","name","email","phone","bloodGroup","age"]} />
          )}
          {!loading && activeTab === "doctors" && (
            <SimpleTable title="Doctors"
              data={doctors.map((d) => ({
                id: d.id, name: d.name, email: d.email, phone: d.phoneNumber,
                specialties: (d.specialties||[]).join(", "),
                hospitals: (d.doctorHospitals||[]).map((dh)=>dh.hospitalName).join(", ") || "-",
              }))}
              columns={["id","name","email","phone","specialties","hospitals"]} />
          )}
          {!loading && activeTab === "appointments" && (
            <SimpleTable title="Appointments"
              data={appointments.map((a) => ({ id:a.id, patient:a.patient?.name, doctor:a.doctor?.name, time:a.appointmentTime, status:a.status }))}
              columns={["id","patient","doctor","time","status"]} />
          )}
          {!loading && activeTab === "hospitals" && (
            <SimpleTable title="Hospitals"
              data={hospitals.map((h) => ({ id:h.id, name:h.name, phone:h.phoneNumber, city:h.locationResponse?.city||"-", types:(h.types||[]).join(", ") }))}
              columns={["id","name","phone","city","types"]} />
          )}
        </div>
      )}

      {showUpdateDoctor && selectedDoctor && (
        <Modal title={`✏️ Edit Doctor: ${selectedDoctor.name}`}
          onClose={() => { setShowUpdateDoctor(false); setSelectedDoctor(null); }}>
          <DoctorForm initial={selectedDoctor} hospitals={hospitals} onSave={handleUpdateDoctor}
            onCancel={() => { setShowUpdateDoctor(false); setSelectedDoctor(null); }} loading={saving} />
        </Modal>
      )}
      {deleteDoctor && (
        <ConfirmModal message={`Delete Dr. "${deleteDoctor.name}"? This cannot be undone.`}
          onConfirm={handleDeleteDoctor} onCancel={() => setDeleteDoctor(null)} />
      )}
      {showUpdateHospital && selectedHospital && (
        <Modal title={`🏥 Edit Hospital: ${selectedHospital.name}`}
          onClose={() => { setShowUpdateHospital(false); setSelectedHospital(null); }}>
          <HospitalForm initial={selectedHospital} onSave={handleUpdateHospital}
            onCancel={() => { setShowUpdateHospital(false); setSelectedHospital(null); }} loading={saving} />
        </Modal>
      )}
      {deleteHospital && (
        <ConfirmModal message={`Delete hospital "${deleteHospital.name}"? This cannot be undone.`}
          onConfirm={handleDeleteHospital} onCancel={() => setDeleteHospital(null)} />
      )}
    </div>
  );
}

function SimpleTable({ title, data, columns }) {
  if (!data || !data.length) return <p style={{ color: "#718096" }}>No {title.toLowerCase()} found.</p>;
  return (
    <div>
      <h3 style={{ color: "#2d3748", marginBottom: "1rem" }}>{title} ({data.length})</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={t.table}>
          <thead><tr>{columns.map((c) => <th key={c} style={t.th}>{c}</th>)}</tr></thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={i%2===0?{}:{background:"#f7fafc"}}>
                {columns.map((c) => <td key={c} style={t.td}>{row[c]??"-"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f0f4f8" },
  nav: { background: "#2b6cb0", color: "#fff", padding: "0.75rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" },
  navTitle: { fontSize: "1.1rem", fontWeight: 700, whiteSpace: "nowrap" },
  navCenter: { display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" },
  navBtn: { padding: "0.4rem 1rem", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "6px", cursor: "pointer", fontWeight: 500, fontSize: "0.82rem" },
  navBtnActive: { background: "#fff", color: "#2b6cb0" },
  navRight: { display: "flex", alignItems: "center", gap: "1rem", whiteSpace: "nowrap" },
  navUser: { fontSize: "0.85rem" },
  logoutBtn: { padding: "0.4rem 1rem", background: "#e53e3e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
  divider: { width: "1px", height: "24px", background: "rgba(255,255,255,0.3)", margin: "0 0.25rem", display: "inline-block" },
  groupLabel: { fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" },
  content: { padding: "2rem", maxWidth: "1100px", margin: "0 auto" },
  formCard: { background: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  formTitle: { color: "#2d3748", marginBottom: "1.5rem" },
  tabs: { display: "flex", gap: "0.5rem", marginBottom: "1.5rem" },
  tab: { padding: "0.5rem 1.2rem", border: "1px solid #cbd5e0", borderRadius: "6px", background: "#fff", cursor: "pointer", fontWeight: 500 },
  tabActive: { background: "#2b6cb0", color: "#fff", border: "1px solid #2b6cb0" },
  editBtn: { padding: "0.3rem 0.8rem", background: "#3182ce", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "0.82rem" },
  delBtn:  { padding: "0.3rem 0.8rem", background: "#e53e3e", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "0.82rem" },
  badge:     { display: "inline-block", padding: "0.1rem 0.5rem", background: "#e9d8fd", color: "#553c9a", borderRadius: "12px", fontSize: "0.75rem", marginRight: "0.25rem", fontWeight: 600 },
  typeBadge: { display: "inline-block", padding: "0.1rem 0.5rem", background: "#ebf4ff", color: "#2b6cb0", borderRadius: "12px", fontSize: "0.75rem", marginRight: "0.25rem", fontWeight: 600 },
  errorMsg:   { background: "#fff5f5", color: "#c53030", padding: "0.75rem 1rem", borderRadius: "6px", margin: "1rem 0" },
  successMsg: { background: "#f0fff4", color: "#276749", padding: "0.75rem 1rem", borderRadius: "6px", margin: "1rem 0" },
};
const t = {
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.08)" },
  th: { padding: "0.75rem 1rem", background: "#ebf4ff", color: "#2c5282", textAlign: "left", fontWeight: 600, borderBottom: "2px solid #bee3f8" },
  td: { padding: "0.65rem 1rem", color: "#4a5568", borderBottom: "1px solid #e2e8f0", fontSize: "0.9rem" },
};
const m = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  box: { background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "580px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0" },
  closeBtn: { background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#718096" },
};
const f = {
  label: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#4a5568", marginBottom: "0.3rem" },
  sectionLabel: { fontSize: "0.78rem", fontWeight: 700, color: "#2b6cb0", textTransform: "uppercase", letterSpacing: "0.07em", margin: "1.25rem 0 0.75rem", borderBottom: "1px solid #bee3f8", paddingBottom: "0.4rem" },
  input: { width: "100%", padding: "0.6rem 0.8rem", border: "1px solid #cbd5e0", borderRadius: "6px", fontSize: "0.95rem", boxSizing: "border-box" },
  btn: { padding: "0.6rem 1.5rem", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 },
};
