import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  target?: string | number;
  icon: React.ReactNode;
  change?: number;
  isPositive?: boolean;
  variant?: "default" | "success" | "danger" | "warning" | "info";
  reachedTarget?: boolean;
  isLowerBetter?: boolean;
  isAbsoluteNumber?: boolean;
}

export function MetricCard({
  title,
  value,
  target,
  icon,
  change,
  isPositive,
  variant = "default",
  reachedTarget,
  isLowerBetter = false,
  isAbsoluteNumber = false,
}: MetricCardProps) {
  // تحديد لون البطاقة بناء على ما إذا كانت القيمة تحقق الهدف
  let cardVariant = variant;

  if (reachedTarget !== undefined) {
    cardVariant = reachedTarget ? "success" : "danger";
  }

  // تحديد ما إذا كانت القيمة رقم مطلق أم نسبة مئوية
  const shouldShowAsAbsolute =
    isAbsoluteNumber ||
    title.includes("عدد المرشحين") ||
    title.includes("عدد الثواني") ||
    title.includes("سرعة إغلاق") ||
    title.includes("المرشحين") ||
    title.includes("الثواني") ||
    title.includes("الصيانة") ||
    title.includes("سرعة اغلاق طلبات الصيانة") ||
    title.includes("عدد الثواني للرد") ||
    title.includes("عدد العملاء المرشحين") ||
    title === "سرعة إغلاق طلبات الصيانة" ||
    title === "عدد الثواني للرد" ||
    title === "عدد العملاء المرشحين";

  return (
    <Card
      className={cn("metric-card", {
        "metric-card-success": cardVariant === "success",
        "metric-card-danger": cardVariant === "danger",
        "metric-card-warning": cardVariant === "warning",
        "metric-card-info": cardVariant === "info",
      })}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
          {title}
        </CardTitle>
        <div className="text-muted-foreground flex-shrink-0">{icon}</div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-lg sm:text-xl md:text-2xl font-bold">
          {shouldShowAsAbsolute ? value.toString().replace("%", "") : value}
        </div>
        {target && (
          <p className="text-xs text-muted-foreground mt-1">
            الهدف:{" "}
            {shouldShowAsAbsolute ? target.toString().replace("%", "") : target}
          </p>
        )}
      </CardContent>
      {change !== undefined && !shouldShowAsAbsolute && (
        <CardFooter className="p-2 pt-0">
          <div className="flex items-center text-xs">
            {isPositive ? (
              <ArrowUp
                className={cn(
                  "h-3 w-3 ml-1",
                  isLowerBetter ? "text-danger" : "text-success",
                )}
              />
            ) : (
              <ArrowDown
                className={cn(
                  "h-3 w-3 ml-1",
                  isLowerBetter ? "text-success" : "text-danger",
                )}
              />
            )}
            <span
              className={cn(
                isPositive
                  ? isLowerBetter
                    ? "text-danger"
                    : "text-success"
                  : isLowerBetter
                    ? "text-success"
                    : "text-danger",
              )}
            >
              {Math.abs(change)}%
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
