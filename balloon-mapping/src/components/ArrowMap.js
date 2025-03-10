import React from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import * as d3 from "d3-scale-chromatic";

const ArrowMap = ({ data }) => {
  return (
    <div style={{ position: "relative" }}>
      <MapContainer center={[0, 0]} zoom={2} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ArrowLayer data={data} />
      </MapContainer>
      <Legend />
    </div>
  );
};

const ArrowLayer = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    const arrows = L.layerGroup().addTo(map);
    const colorScale = d3.interpolateViridis;
    
    data.forEach(({ lat, lon, wind_speed, wind_direction, altitude }) => {
      wind_direction = wind_direction + 180;
      const length = wind_speed * 25000; // Scale factor for visualization
      const normalizedAltitude = altitude / 40; // Normalize to 0-40 km scale
      const color = colorScale(normalizedAltitude);
      const rad = (wind_direction * Math.PI) / 180; // Convert degrees to radians
      const endLat = lat + (length / 111320) * Math.cos(rad);
      const endLon = lon + (length / (111320 * Math.cos((lat * Math.PI) / 180))) * Math.sin(rad);
      
      const popupContent = `
        <div>
          <b>Latitude:</b> ${lat.toFixed(4)}°<br>
          <b>Longitude:</b> ${lon.toFixed(4)}°<br>
          <b>Wind Speed:</b> ${wind_speed.toFixed(2)} km/h<br>
          <b>Altitude:</b> ${altitude} km
        </div>`;
      
      const arrow = L.polyline([[lat, lon], [endLat, endLon]], {
        color,
        weight: 5,
        opacity: 1,
      }).addTo(arrows);
      
      arrow.bindPopup(popupContent);
      
      arrow.on("click", () => {
        arrow.openPopup();
      });
      
      // Add arrowhead as a separate marker
      const arrowHead = L.marker([endLat, endLon], {
        icon: L.divIcon({
          className: "arrowhead",
          html: `
            <div style="
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-bottom: 16px solid ${color};
              transform: rotate(${wind_direction}deg);
            "></div>
          `,
          iconSize: [16, 16],
        })
      }).addTo(arrows);
      
      arrowHead.bindPopup(popupContent);
      
      arrowHead.on("click", () => {
        arrowHead.openPopup();
      });
    });

    return () => {
      map.removeLayer(arrows);
    };
  }, [data, map]);

  return null;
};

const Legend = () => {
  const gradientColors = Array.from({ length: 10 }, (_, i) => d3.interpolateViridis(i / 9));
  return (
    <div style={{
      position: "absolute",
      bottom: "10px",
      right: "10px",
      background: "white",
      padding: "10px",
      borderRadius: "5px",
      boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
      pointerEvents: "auto",
      zIndex: 1000,
    }}>
      <div style={{ marginBottom: "5px", fontWeight: "bold" }}>Altitude Scale (km)</div>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {gradientColors.map((color, index) => (
          <div
            key={index}
            style={{
              background: color,
              width: "20px",
              height: "10px",
            }}
          ></div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
        <span>0 km</span>
        <span>40 km</span>
      </div>
    </div>
  );
};

export default ArrowMap;