import { useState } from "react";
import { Calendar, Target, TrendingUp, Loader2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWeeklyGoals } from "@/hooks/useSupabase";
import { useStudySessions } from "@/hooks/useSupabase";
import { format, startOfWeek, endOfWeek, parseISO } from "date-fns";

export default function Plan() {
  const { goals, loading: goalsLoading } = useWeeklyGoals();
  const { sessions, loading: sessionsLoading } = useStudySessions();
  const [showAddForm, setShowAddForm] = useState(false);

  const loading = goalsLoading || sessionsLoading;

  // Obtener semana actual
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Lunes
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Domingo

  // Filtrar metas de esta semana
  const thisWeekGoals = goals.filter(goal => {
    const goalStart = parseISO(goal.week_start);
    const goalEnd = parseISO(goal.week_end);
    return goalStart <= weekEnd && goalEnd >= weekStart;
  });

  // Calcular tiempo de estudio de esta semana
  const thisWeekSessions = sessions.filter(session => {
    const sessionDate = parseISO(session.start_time);
    return sessionDate >= weekStart && sessionDate <= weekEnd;
  });

  const plannedTime = thisWeekSessions.reduce((acc, session) => {
    if (session.duration) return acc + session.duration;
    return acc;
  }, 0);

  const completedTime = thisWeekSessions
    .filter(session => session.completed)
    .reduce((acc, session) => {
      if (session.duration) return acc + session.duration;
      return acc;
    }, 0);

  // Calcular racha de estudio (días consecutivos)
  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasSession = sessions.some(session => {
        const sessionDate = parseISO(session.start_time);
        return sessionDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasSession) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const studyStreak = calculateStreak();

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="text-center pt-8 pb-6">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your study plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="text-center pt-8 pb-6">
        <h1 className="text-2xl font-light text-foreground/90 mb-2">Study Plan</h1>
        <p className="text-muted-foreground text-sm">Your learning roadmap</p>
      </div>

      {/* Weekly Overview */}
      <div className="px-6">
        <Card className="gradient-card border-border/30 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-primary" size={20} />
            <h2 className="text-lg font-medium text-foreground/80">This Week</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(plannedTime / 60)}m
              </div>
              <div className="text-sm text-muted-foreground">Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {Math.round(completedTime / 60)}m
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Goals */}
      <div className="px-6 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="text-primary" size={20} />
            <h2 className="text-lg font-medium text-foreground/80">Weekly Goals</h2>
          </div>
          <Button size="sm" variant="outline" className="rounded-full">
            <Plus size={16} className="mr-1" />
            Add Goal
          </Button>
        </div>
        
        {thisWeekGoals.length === 0 ? (
          <Card className="gradient-card border-border/30 p-6 rounded-2xl text-center">
            <p className="text-muted-foreground">No goals set for this week</p>
            <p className="text-sm text-muted-foreground mt-2">
              Set your first goal to track your progress
            </p>
          </Card>
        ) : (
          thisWeekGoals.map((goal) => (
            <Card 
              key={goal.id} 
              className="gradient-card border-border/30 p-4 rounded-2xl"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-foreground">
                    {goal.subjects?.name || 'Unknown Subject'}
                  </h3>
                  <span className="text-sm text-primary font-medium">
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{goal.target}</p>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Study Streak */}
      <div className="px-6">
        <Card className="gradient-card border-border/30 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-accent" size={20} />
            <h2 className="text-lg font-medium text-foreground/80">Study Streak</h2>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              {studyStreak} {studyStreak === 1 ? 'day' : 'days'}
            </div>
            <p className="text-sm text-muted-foreground">
              {studyStreak > 0 ? 'Keep it up! 🌟' : 'Start your streak today! 🚀'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}