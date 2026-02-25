import { useAuth } from "@/hooks/useAuth";
import UserDashboard from "@/components/dashboards/UserDashboard";
import StaffDashboard from "@/components/dashboards/StaffDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

const Dashboard = () => {
  const { role } = useAuth();

  if (role === "admin") return <AdminDashboard />;
  if (role === "staff") return <StaffDashboard />;
  return <UserDashboard />;
};

export default Dashboard;