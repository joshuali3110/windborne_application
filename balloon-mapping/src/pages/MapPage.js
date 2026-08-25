import React from "react";
import { useParams } from "react-router-dom";
import ArrowMap from "../components/ArrowMap";
import ErrorPage from "./ErrorPage";

function MapPage({ data }) {
  const { hour } = useParams();
  const hourData = data[hour];

  if (!hourData || typeof hourData === "string") {
    return <ErrorPage />;
  }

  return (
    <main className="page page--wide">
      <div className="map-page">
        <header className="map-page__header">
          <h1 className="map-page__title">{hour} hours ago</h1>
        </header>
        <ArrowMap data={hourData} />
      </div>
    </main>
  );
}

export default MapPage;
