import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
}: MetricCardProps) {
  // تحديد لون البطاقة بناء على ما إذا كانت القيمة تحقق الهدف
  let cardVariant = variant;

  if (reachedTarget !== undefined) {
    cardVariant = reachedTarget ? "success" : "danger";
  }

  return (
    <Card className={cn("metric-card", {
      "metric-card-success": cardVariant === "success",
      "metric-card-danger": cardVariant === "danger",
      "metric-card-warning": cardVariant === "warning",
      "metric-card-info": cardVariant === "info",
    })}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium leading-tight">{title}</CardTitle>
        <div className="text-muted-foreground shrink-0">{icon}</div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        {target && (
          <div className="text-xs text-muted-foreground">
            الهدف: {target}
          </div>
        )}
        {typeof change === 'number' && (
          <p className={`text-xs flex items-center ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <ArrowUp className="h-3 w-3 mr-1 shrink-0" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1 shrink-0" />
            )}
            <span className="truncate">{Math.abs(change)}%</span>
          </p>
        )}
        {reachedTarget && (
          <div className="flex items-center">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1 shrink-0" />
            <span className="text-xs text-green-600 truncate">تم تحقيق الهدف</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}