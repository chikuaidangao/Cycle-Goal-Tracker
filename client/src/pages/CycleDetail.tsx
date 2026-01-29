import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useCycle, useReminders, useUpdateCycle } from "@/hooks/use-cycles";
import { DayCard } from "@/components/DayCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import NotFound from "./not-found";

export default function CycleDetail() {
  const [, params] = useRoute("/cycle/:id");
  const id = parseInt(params?.id || "0");
  
  const { data: cycle, isLoading: isCycleLoading } = useCycle(id);
  const { data: reminders } = useReminders();
  const updateCycleMutation = useUpdateCycle();
  
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  if (isCycleLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[80vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!cycle) {
    return <NotFound />;
  }

  const handleGoalUpdate = () => {
    updateCycleMutation.mutate({
      id: cycle.id,
      goal: goalInput
    });
    setIsEditingGoal(false);
  };

  const startEditing = () => {
    setGoalInput(cycle.goal || "");
    setIsEditingGoal(true);
  };

  const getReminderForDay = (dayNum: number) => {
    return reminders?.find(r => r.dayNumber === dayNum)?.message;
  };

  // Calculate completion percentage
  const completedDays = cycle.days.filter(d => d.isCompleted).length;
  const progress = (completedDays / 10) * 100;

  return (
    <div className="space-y-8 animate-in-fade pb-10">
      {/* Header Navigation */}
      <div className="flex items-center gap-2 mb-2">
        <Link href="/">
          <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Cycle Header Card */}
      <div className="relative overflow-hidden bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
        {/* Background decorative blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  Cycle #{cycle.cycleNumber}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                  cycle.status === 'active' ? "border-primary text-primary" : 
                  cycle.status === 'completed' ? "border-green-500 text-green-600" :
                  "border-muted text-muted-foreground"
                )}>
                  {cycle.status}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {format(new Date(cycle.startDate), "MMM d")} — {format(new Date(cycle.endDate), "MMM d")}
              </h1>
            </div>

            {/* Cycle Goal */}
            <div className="pt-2">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Main Objective</div>
              {isEditingGoal ? (
                <div className="flex gap-2 max-w-xl">
                  <Input 
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="What is your main focus for these 10 days?"
                    className="text-lg h-12"
                    autoFocus
                  />
                  <Button onClick={handleGoalUpdate} size="lg" disabled={updateCycleMutation.isPending}>
                    {updateCycleMutation.isPending ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save
                  </Button>
                  <Button variant="ghost" size="lg" onClick={() => setIsEditingGoal(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div 
                  className="group flex items-start gap-3 cursor-pointer p-2 -ml-2 rounded-lg hover:bg-muted/50 transition-colors"
                  onClick={startEditing}
                >
                  <p className={cn(
                    "text-xl md:text-2xl leading-tight font-medium",
                    !cycle.goal && "text-muted-foreground/50 italic"
                  )}>
                    {cycle.goal || "Click to set a main goal for this cycle..."}
                  </p>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Save className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Progress Circle */}
          <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl border border-border/50 backdrop-blur-sm min-w-[140px]">
            <div className="relative w-20 h-20 mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40" cy="40" r="36"
                  className="text-muted stroke-current"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="40" cy="40" r="36"
                  className="text-primary stroke-current transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={226.2}
                  strokeDashoffset={226.2 - (226.2 * progress) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                {Math.round(progress)}%
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{completedDays}/10 Days Done</span>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">The 10 Days</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cycle.days.map((day) => (
            <DayCard 
              key={day.id} 
              day={day} 
              reminderMessage={getReminderForDay(day.dayNumber)}
            />
          ))}
        </div>
      </div>

      {/* Complete Cycle Action */}
      <div className="flex justify-end pt-8 border-t border-border">
        {cycle.status !== 'completed' ? (
          <Button 
            size="lg" 
            className="text-lg px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
            onClick={() => updateCycleMutation.mutate({ id: cycle.id, status: 'completed' })}
            disabled={progress < 100}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Complete Cycle #{cycle.cycleNumber}
          </Button>
        ) : (
          <div className="flex items-center text-green-600 bg-green-50 px-6 py-3 rounded-full border border-green-200">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <span className="font-bold">Cycle Completed! Well done.</span>
          </div>
        )}
      </div>
    </div>
  );
}
