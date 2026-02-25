import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Pricing = { id: string; slot_type: string; rate_per_hour: number; minimum_charge: number };

export default function ManagePricing() {
  const { role } = useAuth();
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [editing, setEditing] = useState<Record<string, { rate: number; min: number }>>({});

  const fetchPricing = async () => {
    const { data } = await supabase.from("pricing").select("*").order("slot_type");
    if (data) {
      setPricing(data);
      const ed: Record<string, any> = {};
      data.forEach(p => { ed[p.id] = { rate: p.rate_per_hour, min: p.minimum_charge }; });
      setEditing(ed);
    }
  };

  useEffect(() => { fetchPricing(); }, []);

  const handleSave = async (id: string) => {
    const vals = editing[id];
    if (!vals) return;
    const { error } = await supabase.from("pricing")
      .update({ rate_per_hour: vals.rate, minimum_charge: vals.min, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Pricing updated");
  };

  if (role !== "admin") {
    return (
      <div>
        <h1 className="text-2xl font-heading font-bold mb-2">Access Restricted</h1>
        <p className="text-muted-foreground">Only administrators can manage pricing.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">Pricing Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pricing.map((p) => (
          <Card key={p.id} className="glass-card">
            <CardHeader>
              <CardTitle className="capitalize font-heading">{p.slot_type}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Rate per Hour ($)</label>
                <Input type="number" step="0.5" min="0" value={editing[p.id]?.rate ?? p.rate_per_hour}
                  onChange={(e) => setEditing({ ...editing, [p.id]: { ...editing[p.id], rate: parseFloat(e.target.value) || 0 } })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Minimum Charge ($)</label>
                <Input type="number" step="0.5" min="0" value={editing[p.id]?.min ?? p.minimum_charge}
                  onChange={(e) => setEditing({ ...editing, [p.id]: { ...editing[p.id], min: parseFloat(e.target.value) || 0 } })} />
              </div>
              <Button size="sm" onClick={() => handleSave(p.id)}>Save</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}