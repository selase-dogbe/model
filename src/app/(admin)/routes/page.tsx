import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { createRoute } from "./actions";

export default async function RoutesPage() {
  const [routes, drivers, unroutedOrders] = await Promise.all([
    prisma.route.findMany({
      orderBy: { date: "desc" },
      include: { driver: { include: { user: true } }, stops: true },
    }),
    prisma.driver.findMany({ include: { user: true } }),
    prisma.order.findMany({
      where: { status: "PENDING" },
      include: { customer: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Routes</h1>
        <p className="text-sm text-slate-400 mt-1">Assign drivers and build delivery stop sequences.</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-sm font-medium text-white mb-4">New route</h2>
        <form action={async (fd) => {
          "use server";
          const id = await createRoute(fd);
          const { redirect } = await import("next/navigation");
          redirect(`/routes/${id}`);
        }} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              name="driverId"
              required
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="">Select driver…</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.user.name} {d.vehicle ? `(${d.vehicle})` : ""}
                </option>
              ))}
            </select>
            <input
              name="date"
              type="date"
              required
              defaultValue={today}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          {unroutedOrders.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2">Include unrouted orders now (optional):</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-40 overflow-y-auto">
                {unroutedOrders.map((o) => (
                  <label key={o.id} className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" name="orderIds" value={o.id} className="accent-blue-600" />
                    {o.customer.name} — {o.description}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
            Create route
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Driver</th>
              <th className="px-4 py-3 text-left font-medium">Stops</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {routes.map((r) => (
              <tr key={r.id} className="text-slate-200">
                <td className="px-4 py-3">{r.date.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-3 font-medium">{r.driver.user.name}</td>
                <td className="px-4 py-3 text-slate-400">
                  {r.stops.filter((s) => s.status === "COMPLETED").length}/{r.stops.length} complete
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/routes/${r.id}`} className="text-xs text-blue-400 hover:text-blue-300">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {routes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No routes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
