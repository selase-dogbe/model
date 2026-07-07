import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;

  if (session?.user) {
    redirect(session.user.role === "DRIVER" ? "/driver" : "/dashboard");
  }

  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const dest = (formData.get("callbackUrl") as string) || "/";

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: dest,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        const url = new URL("/login", "http://localhost");
        url.searchParams.set("error", "invalid");
        redirect(`/login?error=invalid&callbackUrl=${encodeURIComponent(dest)}`);
      }
      throw err;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg">
            ER
          </div>
          <h1 className="text-xl font-semibold text-white">Envoy Route</h1>
          <p className="text-sm text-slate-400 mt-1">Dispatch &amp; delivery operations</p>
        </div>

        <form action={login} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />

          {error && (
            <div className="mb-4 rounded-lg bg-red-950 border border-red-900 px-3 py-2 text-sm text-red-300">
              Invalid email or password.
            </div>
          )}

          <label className="block text-sm text-slate-300 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            defaultValue="admin@envoyroute.com"
            className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          />

          <label className="block text-sm text-slate-300 mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            defaultValue="password123"
            className="mb-6 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Demo accounts: admin@envoyroute.com / driver1@envoyroute.com (password123)
        </p>
      </div>
    </div>
  );
}
