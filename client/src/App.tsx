
<old_str>import { Toaster } from "@/components/ui/toaster";
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

function AppRoutes() {
  return (
    <HashRouter>
      <AuthProvider>
        <NotificationProvider>
          <MetricsProvider>
            <AppRoutesInner />
          </MetricsProvider>
        </NotificationProvider>
      </AuthProvider>
    </HashRouter>
  );
}

function AppRoutesInner() {
  const { user } = useAuth();
  const location = useLocation();

  // إذا كان المستخدم غير مسجل دخول وليس في صفحة تسجيل الدخول، توجيهه لصفحة تسجيل الدخول
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // إذا كان المستخدم مسجل دخول وفي صفحة تسجيل الدخول، توجيهه للوحة التحكم
  if (user && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/reception" element={<Reception />} />
        <Route path="/visitor-reception" element={<VisitorReception />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/delivery-analytics" element={<DeliveryAnalytics />} />
        <Route path="/quality-calls" element={<QualityCalls />} />
        <Route path="/data-entry" element={<DataEntry />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;</old_str>
<new_str>import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
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

function AppRoutesInner() {
  const { user } = useAuth();
  const location = useLocation();

  // إذا كان المستخدم غير مسجل دخول وليس في صفحة تسجيل الدخول، توجيهه لصفحة تسجيل الدخول
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // إذا كان المستخدم مسجل دخول وفي صفحة تسجيل الدخول، توجيهه للوحة التحكم
  if (user && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
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
          path="/complaints" 
          element={
            <ProtectedRoute>
              <Complaints />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reception" 
          element={
            <ProtectedRoute>
              <Reception />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/visitor-reception" 
          element={
            <ProtectedRoute>
              <VisitorReception />
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
          path="/quality-calls" 
          element={
            <ProtectedRoute>
              <QualityCalls />
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
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <NotificationProvider>
            <MetricsProvider>
              <AppRoutesInner />
            </MetricsProvider>
          </NotificationProvider>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;</new_str>
