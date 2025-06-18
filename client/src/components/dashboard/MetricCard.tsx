
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
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {target && (
          <p className="text-xs text-muted-foreground mt-1">
            الهدف: {target}
          </p>
        )}
      </CardContent>
      {change !== undefined && (
        <CardFooter className="p-2">
          <div className="flex items-center text-xs">
            {isPositive ? (
              <ArrowUp className={cn("h-3 w-3 ml-1", isLowerBetter ? "text-danger" : "text-success")} />
            ) : (
              <ArrowDown className={cn("h-3 w-3 ml-1", isLowerBetter ? "text-success" : "text-danger")} />
            )}
            <span className={cn(
              isPositive 
                ? isLowerBetter ? "text-danger" : "text-success" 
                : isLowerBetter ? "text-success" : "text-danger"
            )}>
              {Math.abs(change)}%
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
