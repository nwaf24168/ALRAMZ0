import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export default function Layout({ children, requireAuth = true }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!requireAuth) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6" dir="rtl">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background" dir="rtl">
      <Sidebar />
      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden ml-0 md:ml-64">
        {children}
      </main>
    </div>
  );
}
