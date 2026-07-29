"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Ensures Firebase client admin also has a server `__session` cookie so
 * server actions (notifications, orders, etc.) can call requireAdmin().
 */
async function ensureAdminSession(): Promise<boolean> {
  try {
    const { auth } = await import("@/lib/firebase");
    const current = auth.currentUser;
    if (!current) return false;
    const idToken = await current.getIdToken(/* forceRefresh */ true);
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to establish admin session cookie:", err);
    return false;
  }
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (loading) return;

      if (!user) {
        toast.error("Administrative access required");
        router.push("/admin/login");
        return;
      }

      if (!isAdmin) {
        toast.error("Unauthorized: Admin access only");
        router.push("/");
        return;
      }

      // Create/refresh httpOnly session for server actions
      const ok = await ensureAdminSession();
      if (cancelled) return;
      if (!ok) {
        toast.error("Could not start secure admin session. Please sign in again.");
        router.push("/admin/login");
        return;
      }
      setSessionReady(true);

      // Module-level check for Staff
      if (profile && profile.role === "staff" && !profile.isSuperAdmin) {
        const pathParts = pathname.split("/");
        const moduleName = pathParts[2] || "dashboard";
        const publicModules = ["login", "unauthorized", "profile"];

        if (moduleName && !publicModules.includes(moduleName)) {
          const hasAccess = profile.permissions?.[moduleName]?.view;

          if (!hasAccess) {
            const firstAvailableModule = Object.keys(profile.permissions || {}).find(
              (mod) => profile.permissions?.[mod]?.view
            );

            if (firstAvailableModule) {
              toast.error(`Redirecting: You do not have permission for ${moduleName}.`);
              router.push(`/admin/${firstAvailableModule}`);
            } else if (moduleName !== "dashboard") {
              toast.error(`Access Denied: You do not have any module permissions.`);
              router.push("/admin/dashboard");
            }
          }
        }
      }
    }

    setSessionReady(false);
    run();
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, loading, router, pathname, profile]);

  if (loading || !user || !isAdmin || !sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-medium text-zinc-500 animate-pulse tracking-widest uppercase text-xs">
            Verifying Admin Access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
