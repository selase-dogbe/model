import { prisma } from "@/lib/prisma";
import { createCustomer, deleteCustomer } from "./actions";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Customers</h1>
        <p className="text-sm text-slate-400 mt-1">Manage delivery recipients and their addresses.</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-sm font-medium text-white mb-4">New customer</h2>
        <form action={createCustomer} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            name="name"
            placeholder="Customer / business name"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          />
          <input
            name="address"
            placeholder="Delivery address"
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          />
          <input
            name="phone"
            placeholder="Phone (optional)"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          />
          <input
            name="email"
            placeholder="Email (optional)"
            type="email"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          />
          <button className="sm:col-span-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500">
            Add customer
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Address</th>
              <th className="px-4 py-3 text-left font-medium">Contact</th>
              <th className="px-4 py-3 text-left font-medium">Orders</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {customers.map((c) => (
              <tr key={c.id} className="text-slate-200">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-slate-400">{c.address}</td>
                <td className="px-4 py-3 text-slate-400">
                  {c.phone ?? "—"} {c.email ? `· ${c.email}` : ""}
                </td>
                <td className="px-4 py-3">{c._count.orders}</td>
                <td className="px-4 py-3 text-right">
                  <form
                    action={async () => {
                      "use server";
                      await deleteCustomer(c.id);
                    }}
                  >
                    <button className="text-xs text-red-400 hover:text-red-300">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
