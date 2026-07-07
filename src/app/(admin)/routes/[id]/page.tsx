import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { addStopToRoute, removeStop, moveStop, updateRouteStatus, deleteRoute } from "../actions";

export default async function RouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const route = await prisma.route.findUnique({
    where: { id },
    include: {
      driver: { include: { user: true } },
      stops: { include: { order: { include: { customer: true } } }, orderBy: { sequence: "asc" } },
    },
  });

  if (!route) notFound();

  const unroutedOrders = await prisma.order.findMany({
    where: { status: "PENDING" },
    include: { customer: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/routes" className="text-xs text-slate-400 hover:text-white">
            ← All routes
          </Link>
          <h1 className="text-2xl font-semibold text-white mt-1">
            {route.driver.user.name} — {route.date.toISOString().slice(0, 10)}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={route.status} />
            <span className="text-sm text-slate-400">
              {route.stops.filter((s) => s.status === "COMPLETED").length}/{route.stops.length} stops complete
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(["PLANNED", "IN_PROGRESS", "COMPLETED"] as const).map((s) => (
            <form
              key={s}
              action={async () => {
                "use server";
                await updateRouteStatus(route.id, s);
              }}
            >
              <button
                disabled={route.status === s}
                className={`rounded-md px-3 py-1.5 text-xs font-medium border ${
                  route.status === s
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            </form>
          ))}
          <form
            action={async () => {
              "use server";
              await deleteRoute(route.id);
              const { redirect } = await import("next/navigation");
              redirect("/routes");
            }}
          >
            <button className="rounded-md border border-red-900 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950">
              Delete route
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-medium w-16">#</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Address</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {route.stops.map((stop, i) => (
              <tr key={stop.id} className="text-slate-200">
                <td className="px-4 py-3 text-slate-400">{stop.sequence}</td>
                <td className="px-4 py-3 font-medium">{stop.order.customer.name}</td>
                <td className="px-4 py-3 text-slate-400">{stop.order.address}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={stop.status} />
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <form
                    action={async () => {
                      "use server";
                      await moveStop(stop.id, "up");
                    }}
                    className="inline"
                  >
                    <button disabled={i === 0} className="text-xs text-slate-400 hover:text-white disabled:opacity-30">
                      ↑
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await moveStop(stop.id, "down");
                    }}
                    className="inline"
                  >
                    <button
                      disabled={i === route.stops.length - 1}
                      className="text-xs text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await removeStop(stop.id);
                    }}
                    className="inline"
                  >
                    <button className="text-xs text-red-400 hover:text-red-300">Remove</button>
                  </form>
                </td>
              </tr>
            ))}
            {route.stops.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No stops on this route yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {unroutedOrders.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-sm font-medium text-white mb-4">Add a stop</h2>
          <div className="space-y-2">
            {unroutedOrders.map((o) => (
              <form
                key={o.id}
                action={async () => {
                  "use server";
                  await addStopToRoute(route.id, o.id);
                }}
                className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2"
              >
                <span className="text-sm text-slate-300">
                  {o.customer.name} — {o.description}
                </span>
                <button className="text-xs text-blue-400 hover:text-blue-300">Add to route</button>
              </form>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
