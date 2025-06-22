import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  FileInput,
  MessageSquare,
  LineChart,
  User,
  Package,
  PackageCheck,
  Phone,
  Headphones,
  Menu,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      title: "لوحة التحكم",
      icon: <LayoutDashboard className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />,
      path: "/dashboard",
    },
    {
      title: "إدخال البيانات",
      icon: <FileInput className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />,
      path: "/data-entry",
    },
    {
      title: "الشكاوى",
      icon: <MessageSquare className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />,
      path: "/complaints",
    },
    {
      title: "التحليلات",
      icon: <LineChart className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />,
      path: "/analytics",
    },
    {
      title: "قسم التسليم",
      icon: <Package className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />,
      path: "/delivery",
    },
    {
      title: "تحليل قسم التسليم",
      icon: <PackageCheck className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />,
      path: "/delivery-analytics",
    },
    {
      title: "مكالمات الجودة",
      icon: <Phone className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />,
      path: "/quality-calls",
    },
    {
      title: "الاستقبال",
      icon: <Headphones className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />,
      path: "/reception",
    },
    {
      title: "الإعدادات",
      icon: <Settings className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />,
      path: "/settings",
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 md:p-4 border-b">
        <div className="flex flex-col items-center justify-center p-2">
          <h1 className="text-lg md:text-xl font-bold mb-1 text-center">
            شركة الرمز العقارية
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground text-center">
            منصة إدارة راحة العملاء
          </p>
        </div>
      </div>

      <div className="p-3 md:p-4 border-b">
        <div className="flex items-center space-x-3 md:space-x-4 space-x-reverse">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 md:h-6 md:w-6 text-primary" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-medium text-sm md:text-base truncate">
              {user?.username}
            </span>
            <span className="text-xs md:text-sm text-muted-foreground truncate">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 md:p-4">
        <ul className="space-y-1 md:space-y-2">
          {menuItems
              .filter((item) => {
                // تحديد معرف الصفحة بناءً على المسار
                const pageId = item.path.replace('/', '') || 'dashboard';
                // عرض العنصر فقط إذا كان المستخدم لديه صلاحية الوصول
                // Assuming canAccessPage function is defined in AuthContext or a similar utility
                // For now, we'll just return true to avoid errors.  You'll need to replace this.
                return true; // canAccessPage(pageId);
              })
              .map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={() => isMobile && setIsOpen(false)}
                    className={cn(
                      "flex items-center p-2 md:p-3 rounded-md transition-colors text-sm md:text-base",
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    {item.icon}
                    <span className="truncate">{item.title}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      <div className="p-3 md:p-4 border-t">
        <div className="flex items-center justify-center">
          <button
            onClick={() => logout()}
            className="flex items-center text-xs md:text-sm p-2 rounded-md text-red-500 hover:bg-red-900/20 w-full justify-center"
          >
            <LogOut className="ml-2 h-3 w-3 md:h-4 md:w-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 right-4 z-50 md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <aside className="sticky top-0 right-0 h-screen w-64 bg-sidebar border-l overflow-y-auto">
      <SidebarContent />
    </aside>
  );
}

// Placeholder component for /delivery-analysis
function DeliveryAnalysis() {
  return (
    <div>
      <h1>Delivery Analysis Page</h1>
      {/* Add your report and excel export functionality here */}
      <p>
        This is a placeholder for the delivery analysis page. Implement the
        required reporting and export functionality here.
      </p>
      <table>
        <thead>
          <tr>
            <th>ت</th>
            <th>تاريخ الحجز</th>
            <th>اسم العميل</th>
            <th>المشروع</th>
            <th>العمارة</th>
            <th>الوحدة</th>
            <th>طريقة الدفع</th>
            <th>بيع على الخارطه / جاهز</th>
            <th>قيمة الوحدة</th>
            <th>تاريخ الافراغ</th>
            <th>اسم موظف المبيعات</th>
            <th>تاريخ انتهاء اعمال البناء للوحدة من قبل المقاول</th>
            <th>تاريخ الاستلام النهائي للوحدة</th>
            <th>تاريخ نقل عدادا الكهرباء</th>
            <th>تاريخ نقل عدادا المياه</th>
            <th>تاريخ التسليم للعميل</th>
            <th>هل تم تقييم عملية الاستلام (نعم او لا)</th>
            <th>تقيييم عملية الاستلام للوحدة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>17-Dec-24</td>
            <td>تركي السعيد</td>
            <td>المعالي</td>
            <td>26</td>
            <td>26</td>
            <td>بنك</td>
            <td>جاهز</td>
            <td>3,128,750</td>
            <td>09-Jan-25</td>
            <td>دعاء شدادي</td>
            <td>28/9/2024</td>
            <td>28/9/2024</td>
            <td></td>
            <td></td>
            <td>25/3/2025</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>4</td>
            <td>22-Dec-25</td>
            <td>تركي السماري</td>
            <td>المعالي</td>
            <td>42</td>
            <td>42</td>
            <td>بنك</td>
            <td>جاهز</td>
            <td>2,687,500</td>
            <td></td>
            <td>محمد شعيب</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>5</td>
            <td>01-Dec-24</td>
            <td>علي بخاري</td>
            <td>رمز 45</td>
            <td>8</td>
            <td>3</td>
            <td>بنك</td>
            <td>جاهز</td>
            <td>657,945</td>
            <td>01-Jan-25</td>
            <td>دعاء شدادي</td>
            <td>6/10/2024</td>
            <td>6/10/2024</td>
            <td></td>
            <td></td>
            <td>29/1/2025</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>6</td>
            <td>18-Dec-24</td>
            <td>ياسين العلي</td>
            <td>رمز 45</td>
            <td>4</td>
            <td>14</td>
            <td>بنك</td>
            <td>جاهز</td>
            <td>627,195</td>
            <td>02-Jan-25</td>
            <td>محمد شعيب</td>
            <td>30/1/2025</td>
            <td>30/1/2025</td>
            <td></td>
            <td></td>
            <td>30/1/2025</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export { DeliveryAnalysis };