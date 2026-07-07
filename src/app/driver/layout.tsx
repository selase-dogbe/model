import { auth } from "@/auth";
import { signOutAction } from "@/app/(admin)/actions";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/60 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              ER
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Envoy Route</p>
              <p className="text-xs text-slate-400 leading-tight">{session?.user?.name}</p>
            </div>
          </div>
          <form action={signOutAction}>
            <button className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-6">{children}</main>
    </div>
  );
}
