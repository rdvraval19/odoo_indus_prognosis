// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function LocationSettings() {
//   const [locations, setLocations] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
//   const [form, setForm] = useState({ name: "", short_code: "", warehouse_id: "" });
//   const [editId, setEditId] = useState(null);

//   const fetchAll = async () => {
//     const [lRes, wRes] = await Promise.all([
//       axios.get("/locations"),
//       axios.get("/warehouses"),
//     ]);
//     setLocations(lRes.data);
//     setWarehouses(wRes.data);
//   };

//   useEffect(() => { fetchAll(); }, []);

//   const handleSubmit = async () => {
//     if (editId) {
//       await axios.patch(`/locations/${editId}`, form);
//     } else {
//       await axios.post("/locations", form);
//     }
//     setForm({ name: "", short_code: "", warehouse_id: "" });
//     setEditId(null);
//     fetchAll();
//   };

//   const handleDelete = async (id) => {
//     await axios.delete(`/locations/${id}`);
//     fetchAll();
//   };

//   // Group locations by warehouse
//   const grouped = warehouses.map(w => ({
//     ...w,
//     locations: locations.filter(l => l.warehouse_id === w.id)
//   }));

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Locations</h1>

//       {/* Form */}
//       <div className="flex gap-3 mb-6">
//         <input className="border p-2 rounded w-48" placeholder="Location Name"
//           value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//         <input className="border p-2 rounded w-32" placeholder="Short Code"
//           value={form.short_code} onChange={e => setForm({...form, short_code: e.target.value})} />
//         <select className="border p-2 rounded w-48"
//           value={form.warehouse_id} onChange={e => setForm({...form, warehouse_id: e.target.value})}>
//           <option value="">Select Warehouse</option>
//           {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
//         </select>
//         <button onClick={handleSubmit}
//           className="bg-blue-600 text-white px-4 py-2 rounded">
//           {editId ? "Update" : "Add"}
//         </button>
//       </div>

//       {/* Grouped by Warehouse */}
//       {grouped.map(w => (
//         <div key={w.id} className="mb-6">
//           <h2 className="font-semibold text-gray-700 mb-2">📦 {w.name}</h2>
//           <table className="w-full border text-sm ml-4">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="p-2 text-left">Name</th>
//                 <th className="p-2 text-left">Code</th>
//                 <th className="p-2 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {w.locations.map(l => (
//                 <tr key={l.id} className="border-t">
//                   <td className="p-2">{l.name}</td>
//                   <td className="p-2">{l.short_code}</td>
//                   <td className="p-2 flex gap-2">
//                     <button onClick={() => { setEditId(l.id); setForm(l); }}
//                       className="text-blue-600">Edit</button>
//                     <button onClick={() => handleDelete(l.id)}
//                       className="text-red-600">Delete</button>
//                   </td>
//                 </tr>
//               ))}
//               {w.locations.length === 0 && (
//                 <tr><td colSpan={3} className="p-2 text-gray-400">No locations yet</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       ))}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

// ─────────────────────────────────────────────
// Empty form state — used to reset after save
// ─────────────────────────────────────────────
const EMPTY = {
  name: "",
  short_code: "",
  warehouse_id: "",
};

export default function LocationSettings() {
  // locations   = full list of locations from API
  // warehouses  = full list of warehouses from API (for dropdown + grouping)
  // form        = what is currently typed in the form inputs
  // editId      = null → CREATE mode | number → EDIT mode for that location
  // loading     = true while fetching data (shows loading text)
  // error       = stores any API error message
  const [locations,  setLocations]  = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  // ─────────────────────────────────────────────
  // LOAD DATA
  // Fetch both lists at the same time using Promise.all
  // This is faster than two sequential await calls
  // ─────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [locRes, whRes] = await Promise.all([
        api.get("/locations"),
        api.get("/warehouses"),
      ]);
      setLocations(locRes.data);
      setWarehouses(whRes.data);
    } catch (err) {
      setError("Failed to load data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Run load() once when the component first renders
  useEffect(() => {
    load();
  }, []);

  // ─────────────────────────────────────────────
  // SAVE (CREATE or UPDATE)
  // ─────────────────────────────────────────────
  const save = async () => {
    setError(null);
    setSuccessMsg("");

    // Basic validation before hitting the API
    if (!form.name.trim()) {
      setError("Location name is required.");
      return;
    }
    if (!form.short_code.trim()) {
      setError("Short code is required.");
      return;
    }
    if (!form.warehouse_id) {
      setError("Please select a warehouse.");
      return;
    }

    // Build the payload — convert warehouse_id to a number
    // because HTML <select> always gives back a string
    const payload = {
      name:         form.name.trim(),
      short_code:   form.short_code.trim().toUpperCase(),
      warehouse_id: Number(form.warehouse_id),
    };

    try {
      if (editId) {
        // EDIT MODE — send PATCH to update existing location
        await api.patch(`/locations/${editId}`, payload);
        setSuccessMsg("Location updated successfully.");
      } else {
        // CREATE MODE — send POST to create new location
        await api.post("/locations", payload);
        setSuccessMsg("Location added successfully.");
      }

      // Reset form and exit edit mode
      setForm(EMPTY);
      setEditId(null);

      // Reload the list so the table reflects the change
      load();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to save location.";
      setError(msg);
    }
  };

  // ─────────────────────────────────────────────
  // DELETE a location
  // ─────────────────────────────────────────────
  const remove = async (id, name) => {
    const confirmed = window.confirm(`Delete location "${name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.delete(`/locations/${id}`);
      setSuccessMsg(`"${name}" deleted.`);
      // If we were editing this location, cancel edit mode
      if (editId === id) {
        setForm(EMPTY);
        setEditId(null);
      }
      load();
    } catch (err) {
      setError("Failed to delete. This location may be in use.");
    }
  };

  // ─────────────────────────────────────────────
  // START EDITING a location
  // Pre-fills the form with that location's data
  // ─────────────────────────────────────────────
  const startEdit = (loc) => {
    setEditId(loc.id);
    setSuccessMsg("");
    setError(null);
    setForm({
      name:         loc.name,
      short_code:   loc.short_code,
      // Convert warehouse_id to string because <select> value is always a string
      warehouse_id: String(loc.warehouse_id),
    });
    // Scroll to top so user can see the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─────────────────────────────────────────────
  // CANCEL editing
  // ─────────────────────────────────────────────
  const cancelEdit = () => {
    setForm(EMPTY);
    setEditId(null);
    setError(null);
    setSuccessMsg("");
  };

  // ─────────────────────────────────────────────
  // HELPER — get warehouse name by ID
  // ─────────────────────────────────────────────
  const getWarehouseName = (id) => {
    const wh = warehouses.find((w) => String(w.id) === String(id));
    return wh ? wh.name : "Unknown";
  };

  // Form is valid when all 3 fields are filled
  const canSave =
    form.name.trim() &&
    form.short_code.trim() &&
    form.warehouse_id;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="p-6 max-w-4xl">

      {/* ── PAGE HEADER ───────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/settings")}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ← Settings
        </button>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-medium">Locations</h1>
      </div>

      {/* ── SUCCESS MESSAGE ────────────────────── */}
      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm
                        bg-green-50 text-green-700 border border-green-200">
          {successMsg}
        </div>
      )}

      {/* ── ERROR MESSAGE ──────────────────────── */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm
                        bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* ── ADD / EDIT FORM ───────────────────── */}
      <div className={`rounded-xl p-4 mb-6 border ${
        editId
          ? "bg-blue-50 border-blue-200"   // blue tint when editing
          : "bg-gray-50 border-gray-100"   // neutral when creating
      }`}>
        {/* Form title */}
        <p className="text-xs font-medium text-gray-500 mb-3">
          {editId ? "✏️  Editing location" : "Add new location"}
        </p>

        <div className="flex flex-wrap gap-3 items-end">

          {/* Location Name input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">
              Location Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rack A"
              className="border border-gray-200 rounded-lg px-3 py-2
                         text-sm w-48 bg-white focus:outline-none
                         focus:border-blue-400"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Short Code input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">
              Short Code <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. RA"
              maxLength={6}
              className="border border-gray-200 rounded-lg px-3 py-2
                         text-sm w-28 bg-white focus:outline-none
                         focus:border-blue-400 uppercase"
              value={form.short_code}
              onChange={(e) =>
                setForm({ ...form, short_code: e.target.value.toUpperCase() })
              }
            />
          </div>

          {/* Warehouse dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">
              Warehouse <span className="text-red-400">*</span>
            </label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2
                         text-sm w-56 bg-white focus:outline-none
                         focus:border-blue-400"
              value={form.warehouse_id}
              onChange={(e) =>
                setForm({ ...form, warehouse_id: e.target.value })
              }
            >
              <option value="">Select warehouse...</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.short_code})
                </option>
              ))}
            </select>
          </div>

          {/* Save / Cancel buttons */}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={!canSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg
                         text-sm font-medium hover:bg-blue-700
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition"
            >
              {editId ? "Update Location" : "Add Location"}
            </button>

            {/* Cancel only visible in edit mode */}
            {editId && (
              <button
                onClick={cancelEdit}
                className="border border-gray-200 bg-white px-4 py-2
                           rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── TABLE ─────────────────────────────── */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading locations...</p>
      ) : warehouses.length === 0 ? (
        // No warehouses exist at all
        <div className="text-center py-10 border border-dashed
                        border-gray-200 rounded-xl">
          <p className="text-sm text-gray-400 mb-2">No warehouses yet.</p>
          <button
            onClick={() => navigate("/settings/warehouses")}
            className="text-sm text-blue-600 hover:underline"
          >
            Go to Warehouses and add one first →
          </button>
        </div>
      ) : (
        // Loop over each warehouse and show its locations underneath
        warehouses.map((wh) => {
          // Filter only the locations that belong to this warehouse
          // String() cast is CRITICAL — API returns numbers, select returns strings
          const whLocations = locations.filter(
            (l) => String(l.warehouse_id) === String(wh.id)
          );

          return (
            <div key={wh.id} className="mb-8">

              {/* Warehouse section heading */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {wh.name}
                </span>
                <span className="text-xs bg-gray-100 text-gray-500
                                 px-2 py-0.5 rounded font-mono">
                  {wh.short_code}
                </span>
                <span className="text-xs text-gray-400">
                  — {whLocations.length}{" "}
                  {whLocations.length === 1 ? "location" : "locations"}
                </span>
              </div>

              {/* No locations under this warehouse */}
              {whLocations.length === 0 ? (
                <p className="text-xs text-gray-400 ml-2 mb-1">
                  No locations yet for this warehouse.
                </p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="pb-2 pt-1 pl-2 text-xs text-gray-400
                                     font-medium w-1/3">
                        Name
                      </th>
                      <th className="pb-2 pt-1 text-xs text-gray-400
                                     font-medium w-1/4">
                        Code
                      </th>
                      <th className="pb-2 pt-1 text-xs text-gray-400
                                     font-medium w-1/3">
                        Warehouse
                      </th>
                      <th className="pb-2 pt-1 text-xs text-gray-400
                                     font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {whLocations.map((loc) => (
                      <tr
                        key={loc.id}
                        className={`border-b border-gray-50 ${
                          editId === loc.id
                            ? "bg-blue-50"  // highlight row being edited
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Name */}
                        <td className="py-2.5 pl-2 font-medium">
                          {loc.name}
                        </td>

                        {/* Short code badge */}
                        <td className="py-2.5">
                          <span className="bg-gray-100 text-gray-600
                                           px-2 py-0.5 rounded text-xs
                                           font-mono">
                            {loc.short_code}
                          </span>
                        </td>

                        {/* Warehouse name */}
                        <td className="py-2.5 text-gray-500 text-xs">
                          {getWarehouseName(loc.warehouse_id)}
                        </td>

                        {/* Edit / Delete buttons */}
                        <td className="py-2.5">
                          <div className="flex gap-3">
                            <button
                              onClick={() => startEdit(loc)}
                              className="text-blue-600 text-xs
                                         hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => remove(loc.id, loc.name)}
                              className="text-red-500 text-xs
                                         hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}