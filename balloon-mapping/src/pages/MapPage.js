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
    <div style={{ textAlign: "center" }}>
      <h1>{hour} hours ago</h1>
      <ArrowMap data={hourData} />
    </div>
  );
}

export default MapPage;
