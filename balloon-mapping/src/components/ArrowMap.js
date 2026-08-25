import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import * as d3 from "d3-scale-chromatic";

const ArrowMap = ({ data }) => {
  return (
    <div className="arrow-map">
      <MapContainer center={[0, 0]} zoom={2} className="arrow-map__container">
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
        <div class="popup">
          <div class="popup__row"><span class="popup__label">Latitude</span><span class="popup__value">${lat.toFixed(2)}°</span></div>
          <div class="popup__row"><span class="popup__label">Longitude</span><span class="popup__value">${lon.toFixed(2)}°</span></div>
          <div class="popup__row"><span class="popup__label">Wind Speed</span><span class="popup__value">${wind_speed.toFixed(2)} km/h</span></div>
          <div class="popup__row"><span class="popup__label">Altitude</span><span class="popup__value">${altitude.toFixed(2)} km</span></div>
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
          html: `<div class="arrowhead__glyph" style="--arrowhead-color:${color};--arrowhead-angle:${wind_direction}deg"></div>`,
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
    <div className="legend">
      <div className="legend__title">Altitude Scale (km)</div>
      <div className="legend__scale">
        {gradientColors.map((color, index) => (
          <div key={index} className="legend__swatch" style={{ background: color }} />
        ))}
      </div>
      <div className="legend__labels">
        <span>0 km</span>
        <span>40 km</span>
      </div>
    </div>
  );
};

export default ArrowMap;
