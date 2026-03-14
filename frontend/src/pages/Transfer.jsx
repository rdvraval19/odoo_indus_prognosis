import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// ─────────────────────────────────────────────
// Empty form state — used to reset after submit
// ─────────────────────────────────────────────
const EMPTY = {
  product_id:    "",
  from_location: "",
  to_location:   "",
  qty:           "",
};

export default function Transfer() {
  // products   = list of all products from API
  // locations  = list of all locations from API
  // form       = controlled form inputs
  // msg        = success or error message to show user
  // busy       = true while API call is in progress (prevents double submit)
  // loading    = true while fetching products and locations on mount
  const [products,  setProducts]  = useState([]);
  const [locations, setLocations] = useState([]);
  const [form,      setForm]      = useState(EMPTY);
  const [msg,       setMsg]       = useState(null); // { type: "success"|"error", text: "..." }
  const [busy,      setBusy]      = useState(false);
  const [loading,   setLoading]   = useState(true);

  const navigate = useNavigate();

  // ─────────────────────────────────────────────
  // LOAD products and locations when page mounts
  // Both calls run at the same time with Promise.all
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, locRes] = await Promise.all([
          api.get("/products"),
          api.get("/locations"),
        ]);
        setProducts(prodRes.data);
        setLocations(locRes.data);
      } catch (err) {
        setMsg({
          type: "error",
          text: "Failed to load products or locations. Is the backend running?",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ─────────────────────────────────────────────
  // DERIVED VALUES
  // ─────────────────────────────────────────────

  // Find the full product object that is currently selected
  // so we can display its current stock below the dropdown
  const selectedProduct = products.find(
    (p) => String(p.id) === form.product_id
  );

  // The "To" dropdown filters out whichever location is
  // selected as "From" — you cannot transfer to the same place
  const toLocationOptions = locations.filter(
    (l) => String(l.id) !== form.from_location
  );

  // Form is only valid when ALL 4 fields are filled
  // and from_location !== to_location
  // and qty is a positive number
  const isValid =
    form.product_id &&
    form.from_location &&
    form.to_location &&
    form.from_location !== form.to_location &&
    Number(form.qty) > 0;

  // Show a warning if entered qty exceeds current stock
  const qtyExceedsStock =
    selectedProduct &&
    form.qty !== "" &&
    Number(form.qty) > selectedProduct.stock;

  // ─────────────────────────────────────────────
  // SUBMIT the transfer
  // ─────────────────────────────────────────────
  const submit = async () => {
    if (!isValid || busy) return;

    setBusy(true);
    setMsg(null);

    try {
      await api.post("/transfers", {
        product_id:    Number(form.product_id),
        from_location: Number(form.from_location),
        to_location:   Number(form.to_location),
        qty:           Number(form.qty),
      });

      // Show success message with details
      const fromName = locations.find(
        (l) => String(l.id) === form.from_location
      )?.name || "source";
      const toName = locations.find(
        (l) => String(l.id) === form.to_location
      )?.name || "destination";

      setMsg({
        type: "success",
        text: `Transfer of ${form.qty} ${selectedProduct?.uom || "units"} of "${selectedProduct?.name}" from ${fromName} to ${toName} recorded successfully.`,
      });

      // Reset the form after success
      setForm(EMPTY);
    } catch (err) {
      // Show the exact error message from the backend
      const detail =
        err.response?.data?.detail || "Transfer failed. Please try again.";
      setMsg({ type: "error", text: detail });
    } finally {
      setBusy(false);
    }
  };

  // ─────────────────────────────────────────────
  // RESET the form and message
  // ─────────────────────────────────────────────
  const reset = () => {
    setForm(EMPTY);
    setMsg(null);
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="p-6 max-w-xl">

      {/* ── PAGE HEADER ───────────────────────── */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-600 text-sm mb-3 block"
        >
          ← Back
        </button>
        <h1 className="text-xl font-medium mb-1">Internal Transfer</h1>
        <p className="text-sm text-gray-500">
          Move stock from one location to another. The total quantity of the
          product does not change — only the location changes.
        </p>
      </div>

      {/* ── HOW IT WORKS INFO BOX ─────────────── */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl
                      px-4 py-3 mb-6 text-xs text-blue-700 leading-relaxed">
        <strong className="font-medium">How it works:</strong> Select a product,
        choose where it is coming from and where it is going, enter the quantity.
        The system records a ledger entry for both the source (−qty) and the
        destination (+qty).
      </div>

      {/* ── SUCCESS / ERROR MESSAGE ───────────── */}
      {msg && (
        <div
          className={`mb-5 px-4 py-3 rounded-lg text-sm leading-relaxed ${
            msg.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {msg.text}
          {/* Show a "Do another transfer" button after success */}
          {msg.type === "success" && (
            <button
              onClick={reset}
              className="block mt-2 text-xs underline text-green-600
                         hover:text-green-800"
            >
              Do another transfer →
            </button>
          )}
        </div>
      )}

      {/* ── LOADING STATE ─────────────────────── */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading products and locations...</p>
      ) : (

        /* ── FORM ──────────────────────────────── */
        <div className="flex flex-col gap-5">

          {/* ── PRODUCT SELECTOR ──────────────── */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Product <span className="text-red-400">*</span>
            </label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2
                         text-sm w-full bg-white focus:outline-none
                         focus:border-blue-400"
              value={form.product_id}
              onChange={(e) => {
                setForm({ ...form, product_id: e.target.value, qty: "" });
                setMsg(null);
              }}
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — SKU: {p.sku}
                </option>
              ))}
            </select>

            {/* Show current stock when product is selected */}
            {selectedProduct && (
              <div className="mt-2 px-3 py-2 bg-gray-50 border border-gray-100
                              rounded-lg text-xs text-gray-600 flex justify-between">
                <span>Current total stock</span>
                <span className="font-medium">
                  {selectedProduct.stock} {selectedProduct.uom}
                </span>
              </div>
            )}
          </div>

          {/* ── FROM / TO LOCATION SIDE BY SIDE ── */}
          <div className="grid grid-cols-2 gap-4">

            {/* FROM location */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                From location <span className="text-red-400">*</span>
              </label>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2
                           text-sm w-full bg-white focus:outline-none
                           focus:border-blue-400"
                value={form.from_location}
                onChange={(e) => {
                  // If the new from_location matches the current to_location,
                  // clear to_location to avoid same-location transfer
                  const newFrom = e.target.value;
                  setForm({
                    ...form,
                    from_location: newFrom,
                    to_location:
                      form.to_location === newFrom ? "" : form.to_location,
                  });
                  setMsg(null);
                }}
              >
                <option value="">Select...</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* TO location */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                To location <span className="text-red-400">*</span>
              </label>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2
                           text-sm w-full bg-white focus:outline-none
                           focus:border-blue-400"
                value={form.to_location}
                onChange={(e) => {
                  setForm({ ...form, to_location: e.target.value });
                  setMsg(null);
                }}
                // Disabled until a from_location is chosen
                disabled={!form.from_location}
              >
                <option value="">Select...</option>
                {/* Exclude the FROM location from options */}
                {toLocationOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {!form.from_location && (
                <p className="text-xs text-gray-400 mt-1">
                  Select "From" location first
                </p>
              )}
            </div>
          </div>

          {/* Same location warning — shown if somehow both are equal */}
          {form.from_location &&
            form.to_location &&
            form.from_location === form.to_location && (
              <p className="text-sm text-red-500 -mt-2">
                From and To locations cannot be the same.
              </p>
            )}

          {/* ── QUANTITY INPUT ────────────────── */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Quantity <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder={
                selectedProduct
                  ? `Max: ${selectedProduct.stock} ${selectedProduct.uom}`
                  : "Enter quantity"
              }
              className={`border rounded-lg px-3 py-2 text-sm w-full
                          focus:outline-none focus:border-blue-400 ${
                qtyExceedsStock
                  ? "border-red-300 bg-red-50"  // red border if over stock
                  : "border-gray-200 bg-white"
              }`}
              value={form.qty}
              onChange={(e) => {
                setForm({ ...form, qty: e.target.value });
                setMsg(null);
              }}
            />

            {/* Exceed stock warning */}
            {qtyExceedsStock && (
              <p className="text-xs text-red-500 mt-1">
                Quantity exceeds available stock ({selectedProduct.stock}{" "}
                {selectedProduct.uom}). The backend will reject this.
              </p>
            )}
          </div>

          {/* ── SUMMARY PREVIEW ──────────────── */}
          {/* Only shows when all 4 fields are filled */}
          {isValid && selectedProduct && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl
                            px-4 py-3 text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">Transfer summary</p>
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between">
                  <span>Product</span>
                  <span className="font-medium text-gray-800">
                    {selectedProduct.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>From</span>
                  <span className="font-medium text-gray-800">
                    {locations.find((l) => String(l.id) === form.from_location)
                      ?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>To</span>
                  <span className="font-medium text-gray-800">
                    {locations.find((l) => String(l.id) === form.to_location)
                      ?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity</span>
                  <span className="font-medium text-gray-800">
                    {form.qty} {selectedProduct.uom}
                  </span>
                </div>
                <div className="border-t border-gray-200 mt-1 pt-1 flex justify-between">
                  <span>Stock after transfer</span>
                  <span className="font-medium text-gray-800">
                    {selectedProduct.stock} {selectedProduct.uom} (unchanged total)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── ACTION BUTTONS ────────────────── */}
          <div className="flex gap-3">
            <button
              onClick={submit}
              disabled={!isValid || busy || qtyExceedsStock}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg
                         text-sm font-medium hover:bg-blue-700
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition"
            >
              {busy ? "Submitting..." : "Submit Transfer"}
            </button>

            {/* Reset button — only shows when form has data */}
            {(form.product_id || form.from_location || form.qty) && (
              <button
                onClick={reset}
                className="border border-gray-200 px-4 py-2.5 rounded-lg
                           text-sm hover:bg-gray-50 transition"
              >
                Reset
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}