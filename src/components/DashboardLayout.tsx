import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link, useLocation } from "react-router-dom";
import { ParkingCircle, LayoutDashboard, Car, Users, Settings, LogOut, ClipboardCheck, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = {
  user: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Book Parking", icon: Car, path: "/dashboard/book" },
    { label: "My Bookings", icon: ClipboardCheck, path: "/dashboard/bookings" },
  ],
  staff: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Check In/Out", icon: ClipboardCheck, path: "/dashboard/checkinout" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Manage Slots", icon: Car, path: "/dashboard/slots" },
    { label: "Pricing", icon: DollarSign, path: "/dashboard/pricing" },
    { label: "Users", icon: Users, path: "/dashboard/users" },
  ],
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, role, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const items = navItems[role ?? "user"];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <ParkingCircle className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-sm">CampusPark</h2>
            <span className="text-xs text-sidebar-foreground/60 capitalize">{role} Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}