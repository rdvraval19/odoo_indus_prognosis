// src/pages/settings/Settings.jsx
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-medium mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage your warehouses and storage locations.
      </p>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate("/settings/warehouses")}
          className="border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-50 transition"
        >
          <div className="font-medium text-sm mb-1">Warehouses</div>
          <div className="text-xs text-gray-500">
            Add, edit and delete warehouses
          </div>
        </button>

        <button
          onClick={() => navigate("/settings/locations")}
          className="border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-50 transition"
        >
          <div className="font-medium text-sm mb-1">Locations</div>
          <div className="text-xs text-gray-500">
            Manage storage locations within each warehouse
          </div>
        </button>
      </div>
    </div>
  );
}