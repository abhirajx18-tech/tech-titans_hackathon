import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, ClipboardCheck, Clock } from "lucide-react";
import { Link } from "react-router-dom";

type UserBookingSummary = {
  activeCount: number;
  totalCount: number;
  lastBookingSlot: string | null;
  lastBookingStatus: string | null;
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<UserBookingSummary>({
    activeCount: 0,
    totalCount: 0,
    lastBookingSlot: null,
    lastBookingStatus: null,
  });

  useEffect(() => {
    if (!user) return;

    const fetchSummary = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("status, booked_at, parking_slots(slot_number)")
        .eq("user_id", user.id)
        .order("booked_at", { ascending: false });

      if (!data) return;

      const activeStatuses = ["booked", "checked_in"];
      const activeCount = data.filter((b) => activeStatuses.includes(b.status)).length;

      const last = data[0] as any | undefined;

      setSummary({
        activeCount,
        totalCount: data.length,
        lastBookingSlot: last?.parking_slots?.slot_number ?? null,
        lastBookingStatus: last?.status ?? null,
      });
    };

    fetchSummary();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold mb-1">Welcome to CampusPark</h1>
        <p className="text-muted-foreground">
          View your parking activity and quickly book a new slot.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Booking</CardTitle>
            <Car className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">{summary.activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              You can have only one active booking at a time.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">{summary.totalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall bookings you&apos;ve made on this campus.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Booking</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-lg font-heading font-semibold">
              {summary.lastBookingSlot ?? "No bookings yet"}
            </div>
            {summary.lastBookingStatus && (
              <Badge className="capitalize" variant="outline">
                {summary.lastBookingStatus.replace("_", " ")}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-semibold text-lg mb-1">Need a spot?</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Browse available slots, book in advance, and manage your reservations from one place.
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/book">Book Parking</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

