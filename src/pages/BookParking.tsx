import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Car, Zap, Accessibility, Minimize2 } from "lucide-react";

type Slot = { id: string; slot_number: string; floor_level: number; slot_type: string; status: string };

const typeIcons: Record<string, any> = {
  standard: Car,
  compact: Minimize2,
  handicap: Accessibility,
  ev: Zap,
};

const statusColors: Record<string, string> = {
  available: "bg-slot-available",
  booked: "bg-slot-booked",
  occupied: "bg-slot-occupied",
  maintenance: "bg-slot-maintenance",
};

export default function BookParking() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [booking, setBooking] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(1);

  const fetchSlots = async () => {
    const { data, error } = await supabase.from("parking_slots").select("*").order("slot_number");
    if (error) {
      console.error("Error fetching slots:", error);
      toast.error("Failed to load parking slots");
      return;
    }
    if (data) {
      setSlots(data);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleBook = async (slotId: string) => {
    if (!user) return;
    setBooking(true);

    // Check for active booking
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["booked", "checked_in"])
      .limit(1);

    if (existing && existing.length > 0) {
      toast.error("You already have an active booking. Cancel it first.");
      setBooking(false);
      return;
    }

    const { error: bookingError } = await supabase
      .from("bookings")
      .insert({ user_id: user.id, slot_id: slotId });

    if (bookingError) {
      toast.error("Failed to book: " + bookingError.message);
      setBooking(false);
      return;
    }

    const { error: slotError } = await supabase
      .from("parking_slots")
      .update({ status: "booked" })
      .eq("id", slotId);

    if (slotError) {
      toast.error("Booking created but failed to update slot status.");
    } else {
      toast.success("Slot booked successfully!");
    }

    await fetchSlots();
    setBooking(false);
  };

  const floors = [...new Set(slots.map(s => s.floor_level))].sort();
  const floorSlots = slots.filter(s => s.floor_level === selectedFloor);

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-2">Book a Parking Slot</h1>
      <p className="text-muted-foreground mb-6">Select an available slot to book</p>

      {/* Legend */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="capitalize text-muted-foreground">{status}</span>
          </div>
        ))}
      </div>

      {/* Floor selector */}
      <div className="flex gap-2 mb-6">
        {floors.length === 0 ? (
          <p className="text-muted-foreground">No parking slots available</p>
        ) : (
          floors.map((floor) => (
            <Button key={floor} variant={selectedFloor === floor ? "default" : "outline"} size="sm"
              onClick={() => setSelectedFloor(floor)}>
              Floor {floor}
            </Button>
          ))
        )}
      </div>

      {/* Slot grid */}
      {floorSlots.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No slots on this floor</p>
        </div>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {floorSlots.map((slot) => {
          const Icon = typeIcons[slot.slot_type] ?? Car;
          const isAvailable = slot.status === "available";
          return (
            <Card key={slot.id} className={`glass-card transition-all ${isAvailable ? "hover:shadow-md hover:border-primary/30 cursor-pointer" : "opacity-60"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-heading font-semibold text-lg">{slot.slot_number}</span>
                  <div className={`w-3 h-3 rounded-full ${statusColors[slot.status]}`} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground capitalize">{slot.slot_type}</span>
                </div>
                {isAvailable ? (
                  <Button size="sm" className="w-full" onClick={() => handleBook(slot.id)} disabled={booking}>
                    Book Now
                  </Button>
                ) : (
                  <Badge variant="secondary" className="w-full justify-center capitalize">{slot.status}</Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>      )}    </div>
  );
}