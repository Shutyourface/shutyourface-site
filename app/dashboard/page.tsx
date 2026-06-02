import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const cookieName = "syf_dashboard_auth";

async function unlockDashboard(formData: FormData) {
  "use server";

  const password = String(formData.get("password") || "");
  const expectedPassword = process.env.DASHBOARD_PASSWORD;

  if (!expectedPassword || password !== expectedPassword) {
    redirect("/dashboard?error=1");
  }

  cookies().set(cookieName, "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/dashboard",
    maxAge: 60 * 60 * 8,
  });

  redirect("/dashboard");
}

export default function DashboardPage({ searchParams }: { searchParams?: { error?: string } }) {
  const isUnlocked = cookies().get(cookieName)?.value === "ok";

  if (isUnlocked) {
    return (
      <main style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }}>
        <iframe title="SYF Curation Dashboard" src="/dashboard/content" style={{ display: "block", width: "100%", height: "100%", border: 0 }} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <form action={unlockDashboard} className="w-full max-w-sm border-4 border-red-700 bg-zinc-950 p-6 shadow-2xl">
        <h1 className="font-tabloid text-5xl uppercase leading-none">SYF Dashboard</h1>
        <p className="mt-2 text-sm uppercase tracking-[0.25em] text-zinc-400">Private access only</p>
        {searchParams?.error ? <p className="mt-4 bg-red-700 px-3 py-2 text-sm font-black uppercase">Wrong password</p> : null}
        <label className="mt-6 block text-xs font-black uppercase tracking-[0.25em] text-zinc-400" htmlFor="password">
          Password
        </label>
        <input id="password" name="password" type="password" autoFocus className="mt-2 min-h-12 w-full border-2 border-white bg-white px-3 text-black" />
        <button type="submit" className="mt-4 min-h-12 w-full bg-red-700 font-tabloid text-3xl uppercase text-white hover:bg-white hover:text-black">
          Enter
        </button>
      </form>
    </main>
  );
}
