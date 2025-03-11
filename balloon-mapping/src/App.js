import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import MapPage from "./pages/MapPage";

function App() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    fetch("https://windborne-application-dg38.onrender.com/data")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch wind data");
        }
        return response.json();
      })
      .then((fetchedData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();

    const getRandomInterval = () => Math.floor(Math.random() * (13 - 8 + 1) + 8) * 60000; // Random interval between 8-13 minutes

    const interval = setInterval(() => {
      fetchData();
    }, getRandomInterval());

    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route 
          path="/" 
          element={
            <div style={{ textAlign: "center" }}>
              <h2>Choose an hour from the dropdown.</h2>
              <p style={{ marginTop: "10px", fontSize: "16px", color: "#555" }}>
                This project was built as a part of applications to <a href="https://windbornesystems.com/">WindBorne Systems'</a> intern roles for Summer 2025.
                It <a href="https://a.windbornesystems.com/treasure/00.json">queries</a> the positions of WindBorne's global sounding balloons at 0 hours ago, 1 hour ago, 2 hours, ago, etc. all the way until 23 hours ago.
                It then calls Open-Meteo's <a href="https://open-meteo.com/">open-source weather API</a> for 
                wind speed and direction data at the positions of the balloons. <br />
                The balloon positions are then plotted on the world map as arrows that represent wind speed and direction.
                You can click on the arrows for exact data on that particular balloon. Pages that say that "Balloon data is missing or corrupted"
                are due to errors within WindBorne's API and dealing with this robustly is part of the assessment.
              </p>
              <p style={{ marginTop: "10px", fontSize: "8px", color: "#777777" }}>
                Note: WindBorne has 1000 balloons in its balloon constellation, but only the first 15 returned by their API are displayed due to 
                Open-Meteo's free API call limit of 10,000 calls per day. For this reason, the maps are also only updated every hour, even though
                WindBorne's constellation API is updated more frequently than that. If more API calls were available, displaying more balloons
                and updating the maps more often would be easily implementable.
              </p>
            </div>
          } 
        />
        <Route path="/hour/:hour" element={<PageWrapper data={data} />} />
      </Routes>
    </Router>
  );
  
}

function NavBar() {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedHour = location.pathname.startsWith("/hour/") ? location.pathname.split("/hour/")[1] : null;
  const dropdownLabel = selectedHour !== null ? `${selectedHour} Hours Ago` : "Select Hour";

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.navBrand}>Home</Link>
      <div style={styles.dropdown}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)} style={styles.dropdownButton}>
          {dropdownLabel} ▼
        </button>
        {dropdownOpen && (
          <ul style={styles.dropdownMenu}>
            {[...Array(24).keys()].map((hour) => (
              <li key={hour}>
                <Link
                  to={`/hour/${hour}`}
                  style={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  {hour} Hours Ago
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}

function PageWrapper({ data }) {
  return <MapPage data={data} />;
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    padding: "10px 20px",
  },
  navBrand: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "20px",
    fontWeight: "bold",
  },
  dropdown: {
    position: "relative",
    display: "inline-block",
  },
  dropdownButton: {
    backgroundColor: "#444",
    color: "#fff",
    padding: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    borderRadius: "5px",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "#444",
    listStyle: "none",
    padding: 0,
    margin: 0,
    width: "180px",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
    maxHeight: "300px",
    overflowY: "auto",
    borderRadius: "5px",
    zIndex: 1000,
  },
  dropdownItem: {
    padding: "10px",
    color: "#fff",
    cursor: "pointer",
    textAlign: "center",
    display: "block",
    textDecoration: "none",
    transition: "background 0.3s",
  },
};

export default App;
