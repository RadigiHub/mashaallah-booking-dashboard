"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AgentDashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!session) {
        router.replace("/agent/login");
        return;
      }

      // Optional: also verify agent table access
      const email = session.user.email;
      const { data: agentRow } = await supabase
        .from("agents")
        .select("id, role, status")
        .eq("email", email)
        .single();

      if (!agentRow || (agentRow?.status && agentRow.status !== "active")) {
        await supabase.auth.signOut();
        router.replace("/agent/login");
        return;
      }

      setChecking(false);
    };

    run();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/agent/login");
  };

  if (checking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center text-white/70">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white">
      {/* ✅ yahan tum apna existing dashboard UI paste/keep kar sakte ho */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Agent Dashboard</h1>
          <button
            onClick={signOut}
            className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15"
          >
            Sign out
          </button>
        </div>

        <p className="text-white/60 mt-2">
          Welcome to the internal Umrah booking system.
        </p>
      </div>
    </div>
  );
}
