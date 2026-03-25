import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OverviewCardsProps {
  totalAdmins: number;
}

export function OverviewCards({ totalAdmins }: OverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Admins
          </CardTitle>
          <ShieldCheck className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAdmins}</div>
        </CardContent>
      </Card>
    </div>
  );
}
