import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { WiDaySunny } from "react-icons/wi";
import MapPage from "./pages/MapPage";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "https://windborne-application-dg38.onrender.com";

function App() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/data`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch wind data");
        }
        return response.json();
      })
      .then((fetchedData) => {
        setData(fetchedData); // Store full fetched data
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="status" role="status" aria-live="polite">
        <div className="status__spinner" />
        <p className="status__title">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status status--error" role="alert">
        <span className="status__badge" aria-hidden="true">!</span>
        <h1 className="status__title">Error: {error}</h1>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hour/:hour" element={<PageWrapper data={data} />} />
        </Routes>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <main className="page">
      <div className="home">
        <h2 className="home__title">Choose an hour from the dropdown.</h2>
        <p className="home__lead">
          This project was built as a part of applications to <a href="https://windbornesystems.com/">WindBorne Systems'</a> intern roles for Summer 2025.
          It <a href="https://a.windbornesystems.com/treasure/00.json">queries</a> the positions of WindBorne's global sounding balloons at 0 hours ago, 1 hour ago, 2 hours, ago, etc. all the way until 23 hours ago.
          It then calls Open-Meteo's <a href="https://open-meteo.com/">open-source weather API</a> for
          wind speed and direction data at the positions of the balloons. <br /> <br />
          The balloon positions are then plotted on the world map as arrows that represent wind speed and direction.
          You can click on the arrows for exact data on that particular balloon. Pages that say that "Balloon data is missing or corrupted"
          are due to errors within WindBorne's API and dealing with this robustly is part of the assessment.
        </p>
        <p className="home__note">
          Note: WindBorne reports 1000 balloons in its balloon constellation, but only the first 40 returned by their API are displayed due to
          Open-Meteo's free API call limit of 10,000 calls per day. For this reason, the maps are also only updated every hour, even though
          WindBorne's constellation API is updated more frequently than that. If more API calls were available, displaying more balloons
          and updating the maps more often would be easy. <a href="https://github.com/joshuali3110/windborne_application" target="_blank" rel="noopener noreferrer"> See the code on Github.</a>
        </p>
      </div>
    </main>
  );
}

function NavBar() {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get the current hour from the URL
  const selectedHour = location.pathname.startsWith("/hour/") ? location.pathname.split("/hour/")[1] : null;

  // Set the label dynamically
  const dropdownLabel = selectedHour !== null ? `${selectedHour} Hours Ago` : "Select Hour";

  // Close the menu on an outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return;

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        <WiDaySunny className="navbar__brand-icon" aria-hidden="true" />
        Home
      </Link>

      <div className="dropdown" ref={dropdownRef}>
        <button
          type="button"
          className="dropdown__button"
          onClick={() => setDropdownOpen((open) => !open)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          {dropdownLabel}
          <FiChevronDown
            className={`dropdown__chevron${dropdownOpen ? " dropdown__chevron--open" : ""}`}
            aria-hidden="true"
          />
        </button>
        {dropdownOpen && (
          <ul className="dropdown__menu">
            {[...Array(24).keys()].map((hour) => (
              <li key={hour}>
                <Link
                  to={`/hour/${hour}`}
                  className={`dropdown__item${String(hour) === selectedHour ? " dropdown__item--active" : ""}`}
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

export default App;
