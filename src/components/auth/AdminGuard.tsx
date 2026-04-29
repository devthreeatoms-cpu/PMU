"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
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

      // Module-level check for Staff
      if (profile && profile.role === 'staff' && !profile.isSuperAdmin) {
        const pathParts = pathname.split('/');
        // admin/products -> module is products
        const moduleName = pathParts[2] || 'dashboard'; // Default to dashboard if root admin path

        // System modules that are always accessible
        const publicModules = ['login', 'unauthorized', 'profile'];
        
        if (moduleName && !publicModules.includes(moduleName)) {
          const hasAccess = profile.permissions?.[moduleName]?.view;
          
          if (!hasAccess) {
            // Find the first module they DO have access to
            const firstAvailableModule = Object.keys(profile.permissions || {}).find(
              mod => profile.permissions?.[mod]?.view
            );

            if (firstAvailableModule) {
              toast.error(`Redirecting: You do not have permission for ${moduleName}.`);
              router.push(`/admin/${firstAvailableModule}`);
            } else if (moduleName !== 'dashboard') {
              toast.error(`Access Denied: You do not have any module permissions.`);
              router.push("/admin/dashboard");
            }
          }
        }
      }
    }
  }, [user, isAdmin, loading, router, pathname, profile]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-medium text-zinc-500 animate-pulse tracking-widest uppercase text-xs">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
