import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Activity, TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Posts"
          value="128"
          description="Posts generated this month"
          icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
        <StatsCard
          title="Engagement Rate"
          value="4.2%"
          description="Average across platforms"
          icon={<Activity className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
        <StatsCard
          title="Audience Growth"
          value="+12%"
          description="Increase in followers"
          icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
        <StatsCard
          title="Active Sources"
          value="15"
          description="Content sources monitored"
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
        <div className="opacity-75">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
      </CardContent>
    </Card>
  );
}