import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { DriverMapClient as DriverMap } from "@/components/DriverMapClient";

export default async function DashboardPage() {
  const [drivers, orderCounts, activeRoutes] = await Promise.all([
    prisma.driver.findMany({
      include: {
        user: true,
        routes: {
          where: { status: { in: ["PLANNED", "IN_PROGRESS"] } },
          include: { stops: true },
          orderBy: { date: "asc" },
          take: 1,
        },
      },
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.route.findMany({
      where: { status: { in: ["PLANNED", "IN_PROGRESS"] } },
      include: { driver: { include: { user: true } }, stops: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const countFor = (status: string) => orderCounts.find((o) => o.status === status)?._count ?? 0;

  const driverLocations = drivers.map((d) => {
    const route = d.routes[0];
    return {
      id: d.id,
      name: d.user.name,
      vehicle: d.vehicle,
      status: d.status,
      lat: d.lastLat,
      lng: d.lastLng,
      lastLocatedAt: d.lastLocatedAt ? d.lastLocatedAt.toISOString() : null,
      stopsTotal: route?.stops.length ?? 0,
      stopsDone: route?.stops.filter((s) => s.status === "COMPLETED").length ?? 0,
    };
  });

  const tiles = [
    { label: "Active routes", value: activeRoutes.length },
    { label: "Pending orders", value: countFor("PENDING") },
    { label: "In transit", value: countFor("IN_TRANSIT") },
    { label: "Delivered", value: countFor("DELIVERED") },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dispatch dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Live overview of drivers, routes, and deliveries.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-2xl font-semibold text-white">{t.value}</p>
            <p className="text-xs text-slate-400 mt-1">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden h-[420px]">
          <DriverMap initialDrivers={driverLocations} />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3 max-h-[420px] overflow-y-auto">
          <h2 className="text-sm font-medium text-white">Drivers</h2>
          {drivers.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2">
              <div>
                <p className="text-sm text-white">{d.user.name}</p>
                <p className="text-xs text-slate-500">{d.vehicle}</p>
              </div>
              <StatusBadge status={d.status} />
            </div>
          ))}
          {drivers.length === 0 && <p className="text-sm text-slate-500">No drivers yet.</p>}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="text-sm font-medium text-white">Active routes today</h2>
          <Link href="/routes" className="text-xs text-blue-400 hover:text-blue-300">
            Manage routes →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Driver</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Progress</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {activeRoutes.map((r) => (
              <tr key={r.id} className="text-slate-200">
                <td className="px-4 py-3 font-medium">{r.driver.user.name}</td>
                <td className="px-4 py-3 text-slate-400">{r.date.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-3 text-slate-400">
                  {r.stops.filter((s) => s.status === "COMPLETED").length}/{r.stops.length}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
            {activeRoutes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No active routes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
