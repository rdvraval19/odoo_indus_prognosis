import { useEffect, useState } from "react";
import api from "../api/axios";

// ─────────────────────────────────────────────
// Status badge — colour coded
// ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    draft:     "bg-gray-100 text-gray-600",
    waiting:   "bg-yellow-100 text-yellow-700",
    ready:     "bg-blue-100 text-blue-700",
    done:      "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
  };
  const key = status?.toLowerCase();
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                      ${styles[key] || "bg-gray-100 text-gray-600"}`}>
      {status || "—"}
    </span>
  );
};

// ─────────────────────────────────────────────
// PRINT RECEIPT
// Opens a new browser window with clean print layout
// and auto-triggers the print dialog
// ─────────────────────────────────────────────
const printReceipt = (receipt) => {
  const lines = (receipt.lines || [])
    .map(
      (l, i) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">
            ${l.product_name || l.product_id || "Product " + (i + 1)}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;
                     text-align:right;">${l.qty}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;
                     text-align:right;">
            ${l.unit_price ? "₹" + l.unit_price : "—"}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;
                     text-align:right;">
            ${l.unit_price ? "₹" + (l.qty * l.unit_price).toFixed(2) : "—"}
          </td>
        </tr>`
    )
    .join("");

  const printWindow = window.open("", "_blank", "width=800,height=600");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt — ${receipt.reference}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #1e293b;
          padding: 40px;
          font-size: 14px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #e2e8f0;
        }
        .company-name {
          font-size: 22px;
          font-weight: 700;
          color: #1e40af;
        }
        .receipt-title {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }
        .receipt-ref {
          font-size: 20px;
          font-weight: 700;
          text-align: right;
        }
        .receipt-date {
          font-size: 12px;
          color: #64748b;
          text-align: right;
          margin-top: 4px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 28px;
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
        }
        .info-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
        }
        .status-done {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          background: #dcfce7;
          color: #16a34a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        thead tr {
          background: #1e40af;
          color: white;
        }
        thead th {
          padding: 10px 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        thead th:last-child,
        thead th:nth-child(2),
        thead th:nth-child(3) { text-align: right; }
        tbody tr:last-child td { border-bottom: none; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #94a3b8;
        }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="company-name">CoreInventory</div>
          <div class="receipt-title">Goods Receipt Note</div>
        </div>
        <div>
          <div class="receipt-ref">${receipt.reference}</div>
          <div class="receipt-date">
            Date: ${
              receipt.date
                ? new Date(receipt.date).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "long", year: "numeric",
                  })
                : new Date().toLocaleDateString("en-IN", {
                    day: "2-digit", month: "long", year: "numeric",
                  })
            }
          </div>
        </div>
      </div>

      <div class="info-grid">
        <div>
          <div class="info-label">Supplier / Contact</div>
          <div class="info-value">
            ${receipt.contact || receipt.supplier || "—"}
          </div>
        </div>
        <div>
          <div class="info-label">Status</div>
          <div>
            <span class="status-done">${receipt.status || "Done"}</span>
          </div>
        </div>
        <div>
          <div class="info-label">Reference</div>
          <div class="info-value">${receipt.reference}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:right">Qty</th>
            <th style="text-align:right">Unit Price</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${
            lines ||
            `<tr>
              <td colspan="4"
                  style="padding:16px;text-align:center;color:#94a3b8;">
                No product lines
              </td>
            </tr>`
          }
        </tbody>
      </table>

      <div class="footer">
        <span>Generated by CoreInventory System</span>
        <span>Printed on ${new Date().toLocaleString("en-IN")}</span>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function Receipts() {
  const [receipts,   setReceipts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState(null);
  const [validating, setValidating] = useState(false);
  const [toast,      setToast]      = useState(null);

  // ─────────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/receipts");
      setReceipts(res.data);
    } catch (err) {
      setError("Failed to load receipts. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ─────────────────────────────────────────────
  // VALIDATE
  // ─────────────────────────────────────────────
  const validate = async (id) => {
    setValidating(true);
    setToast(null);
    try {
      await api.post(`/receipts/${id}/validate`);
      showToast("success", "Receipt validated. Stock has been updated.");
      setSelected(null);
      load();
    } catch (err) {
      const detail = err.response?.data?.detail || "Validation failed.";
      showToast("error", detail);
    } finally {
      setValidating(false);
    }
  };

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // ─────────────────────────────────────────────
  // FILTER
  // ─────────────────────────────────────────────
  const filtered = receipts.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.reference?.toLowerCase().includes(q) ||
      r.contact?.toLowerCase().includes(q) ||
      r.supplier?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q)
    );
  });

  // ─────────────────────────────────────────────
  // DETAIL VIEW
  // ─────────────────────────────────────────────
  if (selected) {
    return (
      <div className="p-6 max-w-2xl">
        <button
          onClick={() => setSelected(null)}
          className="text-gray-400 hover:text-gray-600 text-sm mb-5 block"
        >
          ← Back to Receipts
        </button>

        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-medium mb-1">{selected.reference}</h1>
            <p className="text-sm text-gray-500">
              {selected.contact || selected.supplier || "No supplier"}
            </p>
          </div>
          <button
            onClick={() => printReceipt(selected)}
            className="flex items-center gap-2 border border-gray-200
                       bg-white px-4 py-2 rounded-lg text-sm font-medium
                       hover:bg-gray-50 transition"
          >
            🖨️ Print Receipt
          </button>
        </div>

        {toast && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {toast.text}
          </div>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Status",    value: <StatusBadge status={selected.status} /> },
            { label: "Reference", value: selected.reference },
            { label: "Date",      value: selected.date
                ? new Date(selected.date).toLocaleDateString("en-IN")
                : "—"
            },
          ].map(({ label, value }) => (
            <div key={label}
                 className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <div className="text-sm font-medium">{value}</div>
            </div>
          ))}
        </div>

        {/* Lines table */}
        <h2 className="text-sm font-medium text-gray-600 mb-2">
          Product Lines
        </h2>
        <div className="bg-white border border-gray-100 rounded-xl
                        overflow-hidden mb-5 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs text-gray-400 font-medium">
                  Product
                </th>
                <th className="px-4 py-2.5 text-xs text-gray-400 font-medium text-right">
                  Qty
                </th>
                <th className="px-4 py-2.5 text-xs text-gray-400 font-medium text-right">
                  Unit Price
                </th>
              </tr>
            </thead>
            <tbody>
              {(selected.lines || []).length === 0 ? (
                <tr>
                  <td colSpan={3}
                      className="px-4 py-6 text-center text-gray-400 text-xs">
                    No product lines
                  </td>
                </tr>
              ) : (
                selected.lines.map((line, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {line.product_name || line.product_id}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {line.qty}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {line.unit_price ? `₹${line.unit_price}` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {selected.status?.toLowerCase() !== "done" &&
           selected.status?.toLowerCase() !== "cancelled" && (
            <button
              onClick={() => validate(selected.id)}
              disabled={validating}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg
                         text-sm font-medium hover:bg-blue-700
                         disabled:opacity-50 transition"
            >
              {validating ? "Validating..." : "Validate Receipt"}
            </button>
          )}
          <button
            onClick={() => printReceipt(selected)}
            className="border border-gray-200 px-6 py-2.5 rounded-lg
                       text-sm font-medium hover:bg-gray-50 transition"
          >
            🖨️ Print
          </button>
        </div>

        {selected.status?.toLowerCase() === "done" && (
          <div className="mt-4 bg-green-50 border border-green-200
                          rounded-lg px-4 py-3 text-sm text-green-700">
            This receipt has been validated. Stock has been added.
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // LIST VIEW
  // ─────────────────────────────────────────────
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-slate-800 mb-1">Receipts</h1>
        <p className="text-sm text-gray-500">
          Manage incoming stock receipts from suppliers.
        </p>
      </div>

      {toast && (
        <div className={`mb-5 px-4 py-3 rounded-lg text-sm ${
          toast.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.text}
        </div>
      )}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg text-sm bg-red-50
                        text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by reference or contact..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                     w-72 focus:outline-none focus:border-blue-400 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          Loading receipts...
        </p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed
                        border-gray-200 rounded-2xl">
          <p className="text-gray-400 text-sm">
            {receipts.length === 0
              ? "No receipts yet."
              : "No receipts match your search."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl
                        shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs text-gray-400 font-medium">
                  Reference
                </th>
                <th className="px-5 py-3 text-xs text-gray-400 font-medium">
                  Contact / Supplier
                </th>
                <th className="px-5 py-3 text-xs text-gray-400 font-medium">
                  Date
                </th>
                <th className="px-5 py-3 text-xs text-gray-400 font-medium">
                  Status
                </th>
                <th className="px-5 py-3 text-xs text-gray-400 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50
                             transition cursor-pointer"
                  onClick={() => setSelected(r)}
                >
                  <td className="px-5 py-3.5 font-medium text-blue-600">
                    {r.reference}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {r.contact || r.supplier || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">
                    {r.date
                      ? new Date(r.date).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2"
                         onClick={(e) => e.stopPropagation()}>
                      {r.status?.toLowerCase() !== "done" &&
                       r.status?.toLowerCase() !== "cancelled" && (
                        <button
                          onClick={() => validate(r.id)}
                          disabled={validating}
                          className="text-xs bg-blue-50 text-blue-700
                                     border border-blue-200 px-3 py-1
                                     rounded-lg hover:bg-blue-100 transition"
                        >
                          Validate
                        </button>
                      )}
                      <button
                        onClick={() => printReceipt(r)}
                        className="text-xs bg-gray-50 text-gray-600
                                   border border-gray-200 px-3 py-1
                                   rounded-lg hover:bg-gray-100 transition"
                      >
                        🖨️ Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}