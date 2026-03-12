import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  MessageSquare,
  MessagesSquare,
  Zap,
  Clock,
  TrendingUp,
  Award,
  Flame,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

export function AnalyticsPanel() {
  const { summary, productivityScore, isLoading } = useAnalytics();
  const [isOpen, setIsOpen] = useState(false);

  const stats = [
    { label: "Messages", value: summary?.totalMessages || 0, icon: MessageSquare, color: "text-blue-500" },
    { label: "Conversations", value: summary?.totalConversations || 0, icon: MessagesSquare, color: "text-green-500" },
    { label: "Avg/Day", value: summary?.avgMessagesPerDay || 0, icon: TrendingUp, color: "text-purple-500" },
    { label: "Streak", value: productivityScore?.streakDays || 0, icon: Flame, color: "text-orange-500" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Analytics</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Your Analytics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={cn("h-4 w-4", stat.color)} />
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Productivity Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                Productivity Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary">
                  {productivityScore?.overallScore || 75}
                </div>
                <div className="flex-1">
                  <Progress value={productivityScore?.overallScore || 75} className="h-3" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{productivityScore?.efficiencyScore || 80}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Zap className="h-3 w-3" /> Efficiency
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{productivityScore?.engagementScore || 70}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <MessageSquare className="h-3 w-3" /> Engagement
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{productivityScore?.goalCompletionScore || 65}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Goals
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model Usage */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Most Used Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{summary?.mostUsedModel || "Gemini 3 Flash"}</div>
                  <div className="text-xs text-muted-foreground">Your preferred AI model</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
