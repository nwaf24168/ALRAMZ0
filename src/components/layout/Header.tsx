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
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/imag/3.svg"
            alt="شركة الرمز العقارية"
            className="h-8 w-auto"
          />
          <div className="text-lg font-semibold">
            منصة قسم إدارة راحة العملاء | التقرير الدوري
          </div>
        </div>

        <Button variant="ghost" onClick={handleLogout} className="text-base">
          تسجيل الخروج
        </Button>
      </div>
    </header>
  );
}
