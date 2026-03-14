import { useEffect, useState } from "react";
import api from "../api/api";

export default function Receipts() {

  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    api.get("/receipts")
      .then(res => setReceipts(res.data))
      .catch(err => console.error(err));
  }, []);

  const validateReceipt = (id) => {
    api.post(`/receipts/${id}/validate`)
      .then(() => {
        alert("Receipt validated");
        window.location.reload();
      });
  };

  return (
    <div>

      <h2>Receipts</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {receipts.map(r => (
            <tr key={r.id}>
              <td>{r.reference}</td>
              <td>{r.contact}</td>
              <td>{r.status}</td>
              <td>
                <button onClick={() => validateReceipt(r.id)}>
                  Validate
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}