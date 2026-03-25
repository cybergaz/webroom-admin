import { Users, Mic, DoorOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardCardsProps {
  totalUsers: number;
  totalHosts: number;
  totalRooms: number;
}

export function DashboardCards({
  totalUsers,
  totalHosts,
  totalRooms,
}: DashboardCardsProps) {
  const stats = [
    { label: "Your Users", value: totalUsers, icon: Users },
    { label: "Your Hosts", value: totalHosts, icon: Mic },
    { label: "Rooms", value: totalRooms, icon: DoorOpen },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
