"use client";

import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  Ticket, 
  Settings,
  LogOut
} from "lucide-react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminLogin = pathname === "/admin/login";
  const { logout, user, profile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully.");
      router.push("/admin/login");
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  if (isAdminLogin) return <>{children}</>;

  const adminName = profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initials = adminName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-zinc-50">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white border-zinc-200 flex flex-col shrink-0">
          <div className="h-16 flex items-center px-6 border-b border-zinc-200">
            <Link href="/admin" className="font-bold text-xl tracking-tight uppercase">
              PMU
              <span className="text-brand-gold font-normal"> ADMIN</span>
            </Link>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={pathname === "/admin/dashboard"} />
            <NavItem href="/admin/products" icon={<Package size={20} />} label="Products" active={pathname.startsWith("/admin/products")} />
            <NavItem href="/admin/orders" icon={<ShoppingCart size={20} />} label="Orders" active={pathname.startsWith("/admin/orders")} />
            <NavItem href="/admin/coupons" icon={<Ticket size={20} />} label="Coupons" active={pathname === "/admin/coupons"} />
            <NavItem href="/admin/referrals" icon={<Tag size={20} />} label="Referrals" active={pathname === "/admin/referrals"} />
            <NavItem href="/admin/users" icon={<Users size={20} />} label="Users" active={pathname === "/admin/users"} />
          </nav>
          
          <div className="p-4 border-t border-zinc-200 space-y-1">
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 mt-1 transition-colors"
            >
              <LogOut size={20} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50">
          <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 bg-white">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              {pathname.replace("/admin/", "").replace(/\//g, " › ").replace(/^dashboard$/, "Overview") || "Overview"}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full border">
                Secure Session
              </span>
              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-brand-gold border border-zinc-700">
                {initials}
              </div>
            </div>
          </header>
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active 
          ? "bg-brand-rose text-white" 
          : "text-zinc-700 hover:bg-brand-cream hover:text-zinc-900"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
