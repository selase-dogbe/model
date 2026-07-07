import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { LocationReporter } from "@/components/LocationReporter";
import { completeStop } from "./actions";

export default async function DriverHomePage() {
  const session = await auth();
  const driverId = session!.user.driverId as string;

  const route = await prisma.route.findFirst({
    where: { driverId, status: { in: ["PLANNED", "IN_PROGRESS"] } },
    orderBy: { date: "asc" },
    include: {
      stops: { include: { order: { include: { customer: true } } }, orderBy: { sequence: "asc" } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Today&apos;s route</h1>
        <LocationReporter />
      </div>

      {!route && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-400">
          No active route assigned right now.
        </div>
      )}

      {route && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">{route.date.toISOString().slice(0, 10)}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {route.stops.filter((s) => s.status === "COMPLETED").length}/{route.stops.length} stops complete
              </p>
            </div>
            <StatusBadge status={route.status} />
          </div>

          {route.stops.map((stop) => (
            <div key={stop.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500">Stop {stop.sequence}</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{stop.order.customer.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{stop.order.address}</p>
                  <p className="text-xs text-slate-400 mt-1">{stop.order.description}</p>
                </div>
                <StatusBadge status={stop.status} />
              </div>

              <div className="mt-3 flex gap-2">
                <a
                  href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(stop.order.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-lg border border-slate-700 py-2 text-center text-xs text-slate-300 hover:bg-slate-800"
                >
                  Open map
                </a>
                {stop.status === "PENDING" && (
                  <form
                    action={async () => {
                      "use server";
                      await completeStop(stop.id);
                    }}
                    className="flex-1"
                  >
                    <button className="w-full rounded-lg bg-emerald-600 py-2 text-xs font-medium text-white hover:bg-emerald-500">
                      Mark delivered
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
