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
  checked_out_at: string | null;
  total_amount: number | null;
  slot_id: string;
  parking_slots: { slot_number: string; slot_type: string } | null;
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  booked: "default",
  checked_in: "secondary",
  checked_out: "outline",
  cancelled: "destructive",
};

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bookings")
      .select("*, parking_slots(slot_number, slot_type)")
      .eq("user_id", user.id)
      .order("booked_at", { ascending: false });
    if (data) setBookings(data as any);
  };

  useEffect(() => { fetchBookings(); }, [user]);

  const handleCancel = async (booking: Booking) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", booking.id);
    if (error) {
      toast.error("Failed to cancel booking");
      return;
    }

    const { error: slotError } = await supabase
      .from("parking_slots")
      .update({ status: "available" })
      .eq("id", booking.slot_id);

    if (slotError) {
      toast.error("Booking cancelled but failed to free slot");
    } else {
      toast.success("Booking cancelled");
    }

    fetchBookings();
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-muted-foreground">No bookings yet.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="glass-card">
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold">{b.parking_slots?.slot_number ?? "—"}</span>
                    <Badge variant={statusVariant[b.status]} className="capitalize">{b.status.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Booked: {format(new Date(b.booked_at), "MMM d, yyyy h:mm a")}
                    {b.total_amount != null && ` • $${b.total_amount.toFixed(2)}`}
                  </p>
                </div>
                {b.status === "booked" && (
                  <Button variant="destructive" size="sm" onClick={() => handleCancel(b)}>Cancel</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}