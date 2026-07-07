import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { createOrder, deleteOrder, cancelOrder } from "./actions";

export default async function OrdersPage() {
  const [orders, customers] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true, stop: { include: { route: true } } },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Orders</h1>
        <p className="text-sm text-slate-400 mt-1">Packages waiting to be routed and delivered.</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-sm font-medium text-white mb-4">New order</h2>
        <form action={createOrder} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            name="customerId"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="">Select customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            name="weightKg"
            type="number"
            step="0.1"
            placeholder="Weight (kg, optional)"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          />
          <input
            name="description"
            placeholder="Package description"
            required
            className="sm:col-span-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          />
          <input
            name="address"
            placeholder="Delivery address override (optional)"
            className="sm:col-span-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          />
          <button className="sm:col-span-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500">
            Create order
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-left font-medium">Address</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Route</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {orders.map((o) => (
              <tr key={o.id} className="text-slate-200">
                <td className="px-4 py-3 font-medium">{o.customer.name}</td>
                <td className="px-4 py-3 text-slate-400">
                  {o.description}
                  {o.weightKg ? ` · ${o.weightKg}kg` : ""}
                </td>
                <td className="px-4 py-3 text-slate-400">{o.address}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {o.stop ? `Stop #${o.stop.sequence}` : "Unrouted"}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  {o.status !== "CANCELLED" && o.status !== "DELIVERED" && (
                    <form
                      action={async () => {
                        "use server";
                        await cancelOrder(o.id);
                      }}
                      className="inline"
                    >
                      <button className="text-xs text-amber-400 hover:text-amber-300">Cancel</button>
                    </form>
                  )}
                  <form
                    action={async () => {
                      "use server";
                      await deleteOrder(o.id);
                    }}
                    className="inline"
                  >
                    <button className="text-xs text-red-400 hover:text-red-300">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
