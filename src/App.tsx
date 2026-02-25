import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import BookParking from "./pages/BookParking";
import MyBookings from "./pages/MyBookings";
import CheckInOut from "./pages/CheckingOut";
import ManageSlots from "./pages/ManageSlots";
import ManagePricing from "./pages/ManagePricing";
import ManageUsers from "./pages/ManageUser";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DashboardPage = ({ children }: { children: React.ReactNode }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage><Dashboard /></DashboardPage></ProtectedRoute>} />
            <Route path="/dashboard/book" element={<ProtectedRoute><DashboardPage><BookParking /></DashboardPage></ProtectedRoute>} />
            <Route path="/dashboard/bookings" element={<ProtectedRoute><DashboardPage><MyBookings /></DashboardPage></ProtectedRoute>} />
            <Route path="/dashboard/checkinout" element={<ProtectedRoute><DashboardPage><CheckInOut /></DashboardPage></ProtectedRoute>} />
            <Route path="/dashboard/slots" element={<ProtectedRoute><DashboardPage><ManageSlots /></DashboardPage></ProtectedRoute>} />
            <Route path="/dashboard/pricing" element={<ProtectedRoute><DashboardPage><ManagePricing /></DashboardPage></ProtectedRoute>} />
            <Route path="/dashboard/users" element={<ProtectedRoute><DashboardPage><ManageUsers /></DashboardPage></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;