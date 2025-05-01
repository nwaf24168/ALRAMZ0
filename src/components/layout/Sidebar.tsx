import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  FileInput, 
  MessageSquare,
  LineChart,
  User,
  Package
} from "lucide-react";

export default function Sidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      title: "لوحة التحكم",
      icon: <LayoutDashboard className="ml-2 h-5 w-5" />,
      path: "/dashboard",
    },
    {
      title: "إدخال البيانات",
      icon: <FileInput className="ml-2 h-5 w-5" />,
      path: "/data-entry",
    },
    {
      title: "الشكاوى",
      icon: <MessageSquare className="ml-2 h-5 w-5" />,
      path: "/complaints",
    },
    {
      title: "التحليلات",
      icon: <LineChart className="ml-2 h-5 w-5" />,
      path: "/analytics",
    },
    {
      title: "الإعدادات",
      icon: <Settings className="ml-2 h-5 w-5" />,
      path: "/settings",
    },
    {
      title: "قسم التسليم",
      icon: <Package className="ml-2 h-5 w-5" />,
      path: "/delivery",
    },
  ];

  return (
    <aside className="sticky top-0 right-0 h-screen w-64 bg-sidebar border-l overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex flex-col items-center justify-center p-2">
            <h1 className="text-xl font-bold mb-1">شركة الرمز العقارية</h1>
            <p className="text-sm text-muted-foreground">منصة إدارة راحة العملاء</p>
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{user?.username}</span>
              <span className="text-sm text-muted-foreground">{user?.role}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center p-2 rounded-md transition-colors",
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <button
              onClick={() => logout()}
              className="flex items-center text-sm p-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="ml-2 h-4 w-4" />
              <span>تسجيل الخروج</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}