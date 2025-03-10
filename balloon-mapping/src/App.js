import React, { useState, useEffect } from "react";
import ArrowMap from "./ArrowMap"; // Import the ArrowMap component

function App() {
  const [data, setData] = useState([]); // State to hold fetched data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/data") // Fetch full backend data
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch wind data");
        }
        return response.json();
      })
      .then((fetchedData) => {
        setData(fetchedData["2"] || []); // Extract only data["0"]
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <h1 style={{ textAlign: "center" }}>Wind Arrows on World Map</h1>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>Error: {error}</p>}

      {!loading && !error && <ArrowMap data={data} />} {/* Pass extracted data */}
    </div>
  );
}

export default App;
