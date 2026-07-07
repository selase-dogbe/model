"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type DriverLocation = {
  id: string;
  name: string;
  vehicle: string | null;
  status: "OFFLINE" | "ACTIVE" | "ON_BREAK";
  lat: number | null;
  lng: number | null;
  lastLocatedAt: string | null;
  stopsTotal: number;
  stopsDone: number;
};

const DOT_COLOR: Record<DriverLocation["status"], string> = {
  ACTIVE: "#10b981",
  ON_BREAK: "#f59e0b",
  OFFLINE: "#64748b",
};

function icon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 2px rgba(0,0,0,0.3)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export function DriverMap({ initialDrivers }: { initialDrivers: DriverLocation[] }) {
  const [drivers, setDrivers] = useState(initialDrivers);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/drivers/locations", { cache: "no-store" });
        if (res.ok) setDrivers(await res.json());
      } catch {
        // ignore transient network errors while polling
      }
    };
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  const located = drivers.filter((d) => d.lat != null && d.lng != null);
  const center: [number, number] = located.length
    ? [located[0].lat as number, located[0].lng as number]
    : [40.7128, -74.006];

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {located.map((d) => (
        <Marker key={d.id} position={[d.lat as number, d.lng as number]} icon={icon(DOT_COLOR[d.status])}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{d.name}</p>
              <p>{d.vehicle}</p>
              <p>
                {d.stopsDone}/{d.stopsTotal} stops complete
              </p>
              <p className="text-xs text-slate-500">Status: {d.status}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
