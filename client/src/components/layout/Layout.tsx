
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export default function Layout({ children, requireAuth = true }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!requireAuth) {
    return <div className="min-h-screen bg-background" dir="rtl">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className={`flex ${isMobile ? 'flex-col' : ''}`}>
        {!isMobile && <Sidebar />}
        <main className={`flex-1 ${isMobile ? 'pt-16' : ''} p-3 sm:p-4 lg:p-6 overflow-x-hidden`}>
          {isMobile && <Sidebar />}
          {children}
        </main>
      </div>
    </div>
  );
}
