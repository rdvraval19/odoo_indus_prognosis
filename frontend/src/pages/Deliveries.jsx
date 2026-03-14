import { useEffect, useState } from "react";
import api from "../api/api";

function Deliveries() {

  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    api.get("/deliveries")
      .then(res => setDeliveries(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Deliveries</h2>
    </div>
  );
}

export default Deliveries;