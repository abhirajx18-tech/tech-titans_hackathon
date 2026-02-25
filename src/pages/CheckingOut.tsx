import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

type Booking = {
  id: string;
  status: string;
  booked_at: string;
  checked_in_at: string | null;
  user_id: string;
  slot_id: string;
  parking_slots: { slot_number: string; slot_type: string } | null;
  profiles: { full_name: string; email: string } | null;
};

export default function CheckInOut() {
  const { role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, parking_slots(slot_number, slot_type), profiles!bookings_user_id_fkey(full_name, email)")
      .in("status", ["booked", "checked_in"])
      .order("booked_at", { ascending: true });
    // profiles join may fail due to no FK - fallback
    if (data) setBookings(data as any);
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCheckIn = async (booking: Booking) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "checked_in", checked_in_at: new Date().toISOString() })
      .eq("id", booking.id);

    if (error) {
      toast.error("Failed: " + error.message);
      return;
    }

    const { error: slotError } = await supabase
      .from("parking_slots")
      .update({ status: "occupied" })
      .eq("id", booking.slot_id);

    if (slotError) {
      toast.error("Checked in but failed to update slot status");
    } else {
      toast.success("Checked in!");
    }
    fetchBookings();
  };

  const handleCheckOut = async (booking: Booking) => {
    // Calculate billing: min 1 hour, then per hour
    const checkInTime = booking.checked_in_at ? new Date(booking.checked_in_at) : new Date();
    const now = new Date();
    const hours = Math.max(1, Math.ceil((now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)));

    // Get rate
    const slotType = booking.parking_slots?.slot_type ?? "standard";
    const { data: pricing } = await supabase.from("pricing").select("rate_per_hour").eq("slot_type", slotType).single();
    const rate = pricing?.rate_per_hour ?? 2;
    const total = hours * rate;

    const { error } = await supabase
      .from("bookings")
      .update({ status: "checked_out", checked_out_at: now.toISOString(), total_amount: total })
      .eq("id", booking.id);

    if (error) {
      toast.error("Failed: " + error.message);
      return;
    }

    const { error: slotError } = await supabase
      .from("parking_slots")
      .update({ status: "available" })
      .eq("id", booking.slot_id);

    if (slotError) {
      toast.error("Checked out but failed to free slot");
    } else {
      toast.success(`Checked out! Bill: $${total.toFixed(2)} (${hours}h × $${rate}/h)`);
    }

    fetchBookings();
  };

  if (role !== "staff" && role !== "admin") {
    return (
      <div>
        <h1 className="text-2xl font-heading font-bold mb-2">Access Restricted</h1>
        <p className="text-muted-foreground">
          Only parking staff and administrators can manage check-in and check-out.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-2">Check In / Check Out</h1>
      <p className="text-muted-foreground mb-6">Manage active bookings</p>

      {bookings.length === 0 ? (
        <p className="text-muted-foreground">No active bookings.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="glass-card">
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-lg">{b.parking_slots?.slot_number ?? "—"}</span>
                    <Badge variant={b.status === "booked" ? "default" : "secondary"} className="capitalize">
                      {b.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Booked: {format(new Date(b.booked_at), "MMM d, h:mm a")}
                    {b.checked_in_at && ` • In: ${format(new Date(b.checked_in_at), "h:mm a")}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {b.status === "booked" && (
                    <Button onClick={() => handleCheckIn(b)}>Check In</Button>
                  )}
                  {b.status === "checked_in" && (
                    <Button variant="secondary" onClick={() => handleCheckOut(b)}>Check Out</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}