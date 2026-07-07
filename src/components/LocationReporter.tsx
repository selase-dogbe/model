"use client";

import { useEffect, useState } from "react";
import { reportLocation } from "@/app/driver/actions";

export function LocationReporter() {
  const supported = typeof navigator !== "undefined" && "geolocation" in navigator;
  const [status, setStatus] = useState<"idle" | "sharing" | "error" | "unsupported">(
    supported ? "idle" : "unsupported",
  );

  useEffect(() => {
    if (!supported) return;

    let cancelled = false;

    const send = (pos: GeolocationPosition) => {
      if (cancelled) return;
      setStatus("sharing");
      reportLocation(pos.coords.latitude, pos.coords.longitude).catch(() => setStatus("error"));
    };

    const fail = () => {
      if (!cancelled) setStatus("error");
    };

    navigator.geolocation.getCurrentPosition(send, fail);
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(send, fail);
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [supported]);

  const label = {
    idle: "Requesting location…",
    sharing: "Sharing live location",
    error: "Location unavailable",
    unsupported: "Location not supported on this device",
  }[status];

  const dotColor = {
    idle: "bg-slate-500",
    sharing: "bg-emerald-500",
    error: "bg-red-500",
    unsupported: "bg-slate-500",
  }[status];

  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <span className={`h-2 w-2 rounded-full ${dotColor} animate-pulse`} />
      {label}
    </div>
  );
}
