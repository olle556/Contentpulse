import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Activity, TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome back</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Posts"
          value="128"
          description="Posts generated this month"
          icon={<FileText className="h-6 w-6" />}
        />
        <StatsCard
          title="Engagement Rate"
          value="4.2%"
          description="Average across platforms"
          icon={<Activity className="h-6 w-6" />}
        />
        <StatsCard
          title="Audience Growth"
          value="+12%"
          description="Increase in followers"
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatsCard
          title="Active Sources"
          value="15"
          description="Content sources monitored"
          icon={<Users className="h-6 w-6" />}
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}