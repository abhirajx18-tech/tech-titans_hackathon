import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type Slot = { id: string; slot_number: string; floor_level: number; slot_type: string; status: string };

export default function ManageSlots() {
  const { role } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [newSlot, setNewSlot] = useState({ slot_number: "", floor_level: 1, slot_type: "standard" });

  const fetchSlots = async () => {
    const { data } = await supabase.from("parking_slots").select("*").order("slot_number");
    if (data) setSlots(data);
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleAdd = async () => {
    if (!newSlot.slot_number.trim()) { toast.error("Slot number required"); return; }
    const { error } = await supabase.from("parking_slots").insert(newSlot);
    if (error) toast.error(error.message);
    else { toast.success("Slot added"); setNewSlot({ slot_number: "", floor_level: 1, slot_type: "standard" }); fetchSlots(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("parking_slots").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Slot removed"); fetchSlots(); }
  };

  const statusColors: Record<string, string> = {
    available: "bg-slot-available text-accent-foreground",
    booked: "bg-slot-booked text-accent-foreground",
    occupied: "bg-slot-occupied text-accent-foreground",
    maintenance: "bg-slot-maintenance text-accent-foreground",
  };

  if (role !== "admin") {
    return (
      <div>
        <h1 className="text-2xl font-heading font-bold mb-2">Access Restricted</h1>
        <p className="text-muted-foreground">Only administrators can manage parking slots.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">Manage Parking Slots</h1>

      <Card className="glass-card mb-6">
        <CardHeader><CardTitle className="text-lg font-heading">Add New Slot</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Input placeholder="Slot Number (e.g. C-01)" value={newSlot.slot_number}
              onChange={(e) => setNewSlot({ ...newSlot, slot_number: e.target.value })} className="w-48" />
            <Input type="number" placeholder="Floor" value={newSlot.floor_level} min={1}
              onChange={(e) => setNewSlot({ ...newSlot, floor_level: parseInt(e.target.value) || 1 })} className="w-24" />
            <Select value={newSlot.slot_type} onValueChange={(v) => setNewSlot({ ...newSlot, slot_type: v })}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="handicap">Handicap</SelectItem>
                <SelectItem value="ev">EV</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {slots.map((slot) => (
          <Card key={slot.id} className="glass-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="font-heading font-semibold">{slot.slot_number}</span>
                <span className="text-sm text-muted-foreground ml-2">Floor {slot.floor_level} • {slot.slot_type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[slot.status]}>{slot.status}</Badge>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(slot.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}