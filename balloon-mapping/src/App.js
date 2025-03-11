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
        <Route path="/" element={<h2 style={{ textAlign: "center" }}>Choose an hour from the dropdown.</h2>} />
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
