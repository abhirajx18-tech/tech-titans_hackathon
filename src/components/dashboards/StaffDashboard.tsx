import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

type ActiveBooking = {
  id: string;
  status: string;
  booked_at: string;
  checked_in_at: string | null;
  parking_slots: { slot_number: string } | null;
};

export default function StaffDashboard() {
  const [bookings, setBookings] = useState<ActiveBooking[]>([]);

  useEffect(() => {
    const fetchActive = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, status, booked_at, checked_in_at, parking_slots(slot_number)")
        .in("status", ["booked", "checked_in"])
        .order("booked_at", { ascending: true });

      if (data) setBookings(data as any);
    };

    fetchActive();
  }, []);

  const queued = bookings.filter((b) => b.status === "booked").length;
  const checkedIn = bookings.filter((b) => b.status === "checked_in").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold mb-1">Staff Operations</h1>
        <p className="text-muted-foreground">
          Monitor bookings and handle check-in / check-out from the dedicated workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Waiting to Check In</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">{queued}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bookings with status <span className="font-semibold">booked</span>.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Currently Parked</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">{checkedIn}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vehicles checked in and occupying slots.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Active</CardTitle>
            <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All active bookings staff can process.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-semibold text-lg mb-1">Go to Check In / Out</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Use the operational screen to perform check-in and check-out with automated billing.
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/checkinout">Open Check In / Out</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

