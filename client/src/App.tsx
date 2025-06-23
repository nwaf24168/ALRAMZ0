import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useRoutes,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { MetricsProvider } from "@/context/MetricsContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Delivery from "@/pages/Delivery";
import DeliveryAnalytics from './pages/DeliveryAnalytics';
import DataEntry from "./pages/DataEntry";
import Complaints from "@/pages/Complaints";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Reception from "./pages/Reception";
import VisitorReception from "@/pages/VisitorReception";
import QualityCalls from "./pages/QualityCalls";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// مكون للتحقق من المصادقة
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const AppRoutes = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MetricsProvider>
          <AppRoutesInner />
        </MetricsProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

const AppRoutesInner = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* المسارات المحمية */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-entry"
          element={
            <ProtectedRoute>
              <DataEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints"
          element={
            <ProtectedRoute>
              <Complaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery"
          element={
            <ProtectedRoute>
              <Delivery />
            </ProtectedRoute>
          }
        />
         <Route
          path="/delivery-analytics"
          element={
            <ProtectedRoute>
              <DeliveryAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
              <Route
          path="/quality-calls"
          element={
            <ProtectedRoute>
              <QualityCalls />
            </ProtectedRoute>
          }
        />
            <Route path="/reception" element={<ProtectedRoute><Reception /></ProtectedRoute>} />
          <Route path="/visitor-reception" element={<ProtectedRoute><VisitorReception /></ProtectedRoute>} />
          
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />


        {/* Add this before the catchall route */}
        {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}

        <Route path="*" element={<NotFound />} />
      </Routes>
  );
};

export default App;