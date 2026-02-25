import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type UserWithRole = {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
};

export default function ManageUsers() {
  const { role } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);

  useEffect(() => {
    // Admin can see all roles via has_role policy; we use an RPC or direct query
    // For now, we show profiles that the admin has access to
    const fetchUsers = async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, email");

      if (roles && profiles) {
        const merged = roles.map(r => {
          const p = profiles.find(p => p.user_id === r.user_id);
          return { user_id: r.user_id, full_name: p?.full_name ?? "Unknown", email: p?.email ?? "", role: r.role };
        });
        setUsers(merged);
      }
    };
    fetchUsers();
  }, []);

  const roleColors: Record<string, string> = {
    admin: "bg-primary text-primary-foreground",
    staff: "bg-accent text-accent-foreground",
    user: "bg-secondary text-secondary-foreground",
  };

  if (role !== "admin") {
    return (
      <div>
        <h1 className="text-2xl font-heading font-bold mb-2">Access Restricted</h1>
        <p className="text-muted-foreground">Only administrators can view user roles.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">User Management</h1>
      <p className="text-muted-foreground mb-4">Note: To assign admin/staff roles, update roles via the backend database.</p>
      {users.length === 0 ? (
        <p className="text-muted-foreground">No users found.</p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.user_id} className="glass-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-heading font-semibold">{u.full_name || "No Name"}</span>
                  <span className="text-sm text-muted-foreground ml-3">{u.email}</span>
                </div>
                <Badge className={roleColors[u.role]}>{u.role}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}