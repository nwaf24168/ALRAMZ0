import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 md:h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <img
            src="/images/logo.png"
            alt="شركة الرمز العقارية"
            className="h-6 md:h-8 w-auto flex-shrink-0"
          />
          <div className="text-sm md:text-lg font-semibold truncate">
            <span className="hidden md:inline">
              منصة قسم إدارة راحة العملاء | التقرير الدوري
            </span>
            <span className="md:hidden">منصة راحة العملاء</span>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-sm md:text-base flex-shrink-0"
        >
          <span className="hidden sm:inline">تسجيل الخروج</span>
          <span className="sm:hidden">خروج</span>
        </Button>
      </div>
    </header>
  );
}
