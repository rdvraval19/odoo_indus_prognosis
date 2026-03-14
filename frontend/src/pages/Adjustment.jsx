import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Adjustment() {
  const [products,   setProducts]   = useState([]);
  const [productId,  setProductId]  = useState("");
  const [countedQty, setCountedQty] = useState("");
  const [msg,        setMsg]        = useState(null);
  const [busy,       setBusy]       = useState(false);

  useEffect(() => {
    api.get("/products").then(r => setProducts(r.data));
  }, []);

  // Find the full selected product object
  const selected = products.find(p => String(p.id) === productId);

  // Compute the delta = what you counted - what system thinks is there
  // This is null until both a product is selected AND qty is entered
  const delta =
    selected && countedQty !== ""
      ? Number(countedQty) - selected.stock
      : null;

  // Reset form when product changes
  const handleProductChange = (id) => {
    setProductId(id);
    setCountedQty("");
    setMsg(null);
  };

  const submit = async () => {
    if (delta === null || delta === 0 || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      await api.post("/adjustments", {
        product_id: Number(productId),
        qty_delta:  delta,  // send the computed delta, not the counted qty
      });
      const sign = delta > 0 ? "+" : "";
      setMsg({
        type: "success",
        text: `Adjustment of ${sign}${delta} recorded for ${selected.name}.`
      });
      // Reset form
      setProductId("");
      setCountedQty("");
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.detail || "Adjustment failed."
      });
    } finally {
      setBusy(false);
    }
  };

  // Delta badge colour: green = surplus, red = deficit, gray = zero
  const deltaBg =
    delta > 0 ? "bg-green-50 border-green-200 text-green-700"
  : delta < 0 ? "bg-red-50 border-red-200 text-red-700"
  :             "bg-gray-50 border-gray-200 text-gray-500";

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-medium mb-1">Stock Adjustment</h1>
      <p className="text-sm text-gray-500 mb-6">
        Correct system stock to match a physical count.
      </p>

      {msg && (
        <div className={`mb-5 px-4 py-3 rounded-lg text-sm ${
          msg.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {msg.text}
        </div>
      )}

      <div className="flex flex-col gap-5">

        {/* Product selector */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Product</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2
                       text-sm w-full bg-white"
            value={productId}
            onChange={e => handleProductChange(e.target.value)}
          >
            <option value="">Select a product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — SKU: {p.sku}
              </option>
            ))}
          </select>
        </div>

        {/* System stock info card — only shows after product is selected */}
        {selected && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg
                          px-4 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">System stock</span>
              <span className="font-medium">
                {selected.stock} {selected.uom}
              </span>
            </div>
            {selected.stock <= (selected.low_stock_threshold || 10) && (
              <p className="text-xs text-red-500 mt-1">
                Below low-stock threshold
              </p>
            )}
          </div>
        )}

        {/* Physically counted qty */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Physically counted quantity
          </label>
          <input
            type="number"
            min="0"
            placeholder="What you actually counted"
            className="border border-gray-200 rounded-lg px-3 py-2
                       text-sm w-full"
            value={countedQty}
            onChange={e => setCountedQty(e.target.value)}
            disabled={!selected}  // can't type until product is selected
          />
          {!selected && (
            <p className="text-xs text-gray-400 mt-1">
              Select a product first
            </p>
          )}
        </div>

        {/* Delta preview — shows once both fields are filled */}
        {delta !== null && (
          <div className={`px-4 py-3 rounded-lg border text-sm ${deltaBg}`}>
            <div className="flex justify-between items-center">
              <span>Adjustment delta</span>
              <span className="font-medium text-base">
                {delta > 0 ? "+" : ""}{delta}
              </span>
            </div>
            <p className="text-xs mt-1 opacity-75">
              Stock will change from{" "}
              <strong>{selected.stock}</strong> →{" "}
              <strong>{selected.stock + delta}</strong> {selected.uom}
            </p>
            {delta === 0 && (
              <p className="text-xs mt-1 text-gray-500">
                No change — system matches physical count.
              </p>
            )}
          </div>
        )}

        <button
          onClick={submit}
          disabled={delta === null || delta === 0 || busy}
          className="bg-blue-600 text-white py-2.5 rounded-lg text-sm
                     font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? "Submitting..." : "Submit Adjustment"}
        </button>
      </div>
    </div>
  );
}