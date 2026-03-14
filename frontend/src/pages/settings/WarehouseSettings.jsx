import { useEffect, useState } from "react";
import api from "../../api/axios";

// empty object used to reset the form
const EMPTY = { name: "", short_code: "", address: "" };

export default function WarehouseSettings() {
  // list   = the array of warehouses fetched from the API
  // form   = controlled inputs: what's currently typed in the form
  // editId = null means CREATE mode, a number means EDIT mode
  const [list,   setList]   = useState([]);
  const [form,   setForm]   = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  // Load warehouses when the component first mounts
  const load = () => {
    api.get("/warehouses").then(r => setList(r.data));
  };
  useEffect(() => { load(); }, []); // [] = run only once on mount

  // Called when user clicks Add or Update button
  const save = async () => {
    if (editId) {
            // EDIT MODE: send a PATCH to update the existing warehouse
      await api.patch(`/warehouses/${editId}`, form);
    } else {
      // CREATE MODE: send a POST to create a new warehouse
      await api.post("/warehouses", form);
    }
    // After saving: reset form, exit edit mode, refresh the list
    setForm(EMPTY);
    setEditId(null);
    load();
  };

  // Called when user clicks Delete on a row
  const remove = async (id) => {
    if (!confirm("Delete this warehouse?")) return;
    await api.delete(`/warehouses/${id}`);
    load(); // refresh list
  };

  // Called when user clicks Edit on a row
  // Pre-fill the form with that warehouse's data and set editId
  const startEdit = (w) => {
    setEditId(w.id);
    setForm({ name: w.name, short_code: w.short_code, address: w.address });
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-medium mb-1">Warehouses</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage your warehouse locations.
      </p>
     {/* ── FORM ───────────────────────────────────── */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl
                      p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Name</label>
          <input
            placeholder="e.g. Main Warehouse"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-52"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Short Code</label>
          <input
            placeholder="e.g. MW"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28"
            value={form.short_code}
            onChange={e => setForm({ ...form, short_code: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Address</label>
          <input
            placeholder="e.g. 12 Industrial Road"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
          />
            </div>
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={!form.name || !form.short_code}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm
                       font-medium disabled:opacity-40"
          >
            {editId ? "Update" : "Add Warehouse"}
          </button>
          {editId && (
            <button
              onClick={() => { setForm(EMPTY); setEditId(null); }}
              className="border border-gray-200 px-4 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── TABLE ──────────────────────────────────── */}
      {list.length === 0 ? (
        <p className="text-sm text-gray-400">
          No warehouses yet. Add one above.
        </p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="pb-3 text-xs text-gray-500 font-medium">Name</th>
              <th className="pb-3 text-xs text-gray-500 font-medium">Code</th>
              <th className="pb-3 text-xs text-gray-500 font-medium">Address</th>
              <th className="pb-3 text-xs text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
           <tbody>
            {list.map(w => (
              <tr
                key={w.id}
                className={`border-b border-gray-50 ${
                  editId === w.id ? "bg-blue-50" : ""
                }`}
              >
                <td className="py-3 font-medium">{w.name}</td>
                <td className="py-3 text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {w.short_code}
                  </span>
                </td>
                <td className="py-3 text-gray-500">{w.address}</td>
                <td className="py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(w)}
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(w.id)}
                      className="text-red-500 text-xs hover:underline"
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
}