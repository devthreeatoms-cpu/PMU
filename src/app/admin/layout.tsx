"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  Ticket, 
  Settings,
  LogOut,
  LayoutTemplate,
  Menu,
  X,
  Image as ImageIcon,
  Grid3X3
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const navItems = [
    { href: "/admin/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard", active: pathname === "/admin/dashboard" },
    { href: "/admin/products", icon: <Package size={20} />, label: "Products", active: pathname.startsWith("/admin/products") },
    { href: "/admin/banners", icon: <ImageIcon size={20} />, label: "Banners", active: pathname.startsWith("/admin/banners") },
    { href: "/admin/orders", icon: <ShoppingCart size={20} />, label: "Orders", active: pathname.startsWith("/admin/orders") },
    { href: "/admin/coupons", icon: <Ticket size={20} />, label: "Coupons", active: pathname === "/admin/coupons" },
    { href: "/admin/users", icon: <Users size={20} />, label: "Users", active: pathname === "/admin/users" },
    { href: "/admin/results", icon: <Grid3X3 size={20} />, label: "Results", active: pathname.startsWith("/admin/results") },
    { href: "/admin/design", icon: <LayoutTemplate size={20} />, label: "Design", active: pathname === "/admin/design" },
  ];

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-zinc-50 font-sans">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 border-r bg-white border-zinc-200 flex-col shrink-0">
          <div className="h-16 flex items-center px-6 border-b border-zinc-200">
            <Link href="/admin" className="font-bold text-xl tracking-tight uppercase">
              PMU
              <span className="text-brand-gold font-normal"> ADMIN</span>
            </Link>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
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

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/50 lg:hidden backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <aside 
              className="w-72 h-full bg-white flex flex-col animate-in slide-in-from-left duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200">
                <span className="font-bold text-xl tracking-tight uppercase">
                  PMU<span className="text-brand-gold font-normal"> ADMIN</span>
                </span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-500">
                  <X size={24} />
                </button>
              </div>
              
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
                {navItems.map((item) => (
                  <NavItem key={item.href} {...item} onClick={() => setIsMobileMenuOpen(false)} />
                ))}
              </nav>
              
              <div className="p-6 border-t border-zinc-200">
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-4 text-sm font-bold uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  <LogOut size={20} />
                  Sign out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50">
          <header className="h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-zinc-200 bg-white">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-md transition-colors"
              >
                <Menu size={24} />
              </button>
              <span className="hidden sm:inline-block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                {pathname.replace("/admin/", "").replace(/\//g, " › ").replace(/^dashboard$/, "Overview") || "Overview"}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-zinc-900 leading-none">{adminName}</span>
                <span className="text-[8px] font-bold text-brand-gold uppercase tracking-widest mt-1">Administrator</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-xs font-bold text-brand-gold border border-zinc-800 shadow-sm">
                {initials}
              </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto pb-12">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}

function NavItem({ href, icon, label, active, onClick }: { href: string; icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
        active 
          ? "bg-brand-rose text-white shadow-lg shadow-brand-rose/20 translate-x-1" 
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      <span className={`${active ? "scale-110" : ""} transition-transform`}>{icon}</span>
      <span className="tracking-widest uppercase text-[11px]">{label}</span>
    </Link>
  );
}
