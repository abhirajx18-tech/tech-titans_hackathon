import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, DollarSign, PieChart } from "lucide-react";
import { Link } from "react-router-dom";

type AdminMetrics = {
  totalRevenue: number;
  activeBookings: number;
  totalSlots: number;
  availableSlots: number;
};

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalRevenue: 0,
    activeBookings: 0,
    totalSlots: 0,
    availableSlots: 0,
  });

  useEffect(() => {
    const loadMetrics = async () => {
      const [{ data: bookings }, { data: slots }] = await Promise.all([
        supabase.from("bookings").select("status, total_amount"),
        supabase.from("parking_slots").select("status"),
      ]);

      const totalRevenue =
        bookings?.reduce((sum, b: any) => sum + (b.total_amount ?? 0), 0) ?? 0;
      const activeStatuses = ["booked", "checked_in"];
      const activeBookings =
        bookings?.filter((b: any) => activeStatuses.includes(b.status)).length ?? 0;

      const totalSlots = slots?.length ?? 0;
      const availableSlots =
        slots?.filter((s: any) => s.status === "available").length ?? 0;

      setMetrics({
        totalRevenue,
        activeBookings,
        totalSlots,
        availableSlots,
      });
    };

    loadMetrics();
  }, []);

  const occupancy =
    metrics.totalSlots === 0
      ? 0
      : Math.round(
          ((metrics.totalSlots - metrics.availableSlots) / metrics.totalSlots) * 100,
        );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold mb-1">Admin Overview</h1>
        <p className="text-muted-foreground">
          Monitor slots, revenue, and booking activity across the campus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">
              ${metrics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sum of completed bookings.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <PieChart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">
              {metrics.activeBookings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Users currently holding a slot.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
            <Car className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">
              {metrics.totalSlots}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall capacity of the campus.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            <Badge variant="outline" className="text-xs">
              {occupancy}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">
              {metrics.totalSlots - metrics.availableSlots}/{metrics.totalSlots}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Occupied vs total slots.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-heading">
              Slot &amp; Layout Management
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground max-w-xs">
              Configure parking slots, floors, and slot types to match your campus layout.
            </p>
            <Button size="sm" asChild>
              <Link to="/dashboard/slots">Manage Slots</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-heading">Pricing &amp; Revenue</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground max-w-xs">
              Adjust rates and minimum charges for each slot type to tune utilization and
              income.
            </p>
            <Button size="sm" asChild>
              <Link to="/dashboard/pricing">Manage Pricing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

