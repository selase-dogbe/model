"use client";

import dynamic from "next/dynamic";

const DriverMap = dynamic(() => import("@/components/DriverMap").then((m) => m.DriverMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading map…</div>
  ),
});

export { DriverMap as DriverMapClient };
