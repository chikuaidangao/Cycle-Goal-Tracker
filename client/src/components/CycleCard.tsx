import { Link } from "wouter";
import { format } from "date-fns";
import { type Cycle } from "@shared/schema";
import { CalendarDays, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CycleCardProps {
  cycle: Cycle;
  isActive?: boolean;
}

export function CycleCard({ cycle, isActive }: CycleCardProps) {
  const isCompleted = cycle.status === 'completed';
  const isUpcoming = cycle.status === 'upcoming';
  const isActiveStatus = cycle.status === 'active';

  return (
    <div className={cn(
      "group relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300",
      isActiveStatus 
        ? "bg-white dark:bg-card border-primary/50 shadow-lg shadow-primary/10 scale-[1.02]" 
        : "bg-card dark:bg-card/50 border-border hover:border-primary/30 hover:shadow-md"
    )}>
      {/* Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
          isActiveStatus ? "bg-primary text-primary-foreground" :
          isCompleted ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
          "bg-muted text-muted-foreground"
        )}>
          {cycle.status}
        </div>
        <div className="text-2xl font-display font-bold text-muted-foreground/30 group-hover:text-primary/20 transition-colors">
          #{String(cycle.cycleNumber).padStart(2, '0')}
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {cycle.goal || "No goal set"}
        </h3>
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4 mr-2 opacity-70" />
          <span>{format(new Date(cycle.startDate), "MMM d")} - {format(new Date(cycle.endDate), "MMM d")}</span>
        </div>
      </div>

      <Link 
        href={`/cycle/${cycle.id}`}
        className={cn(
          "mt-auto flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
          isActiveStatus
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
            : "bg-secondary/10 text-secondary hover:bg-secondary/20"
        )}
      >
        View Details
        <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </div>
  );
}
