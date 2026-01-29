import { useState } from "react";
import { format } from "date-fns";
import { Check, Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCreateTask, useDeleteTask, useUpdateTask } from "@/hooks/use-tasks";
import { useUpdateDay } from "@/hooks/use-cycles";
import { type Day, type Task } from "@shared/schema";
import { cn } from "@/lib/utils";

interface DayCardProps {
  day: Day & { tasks: Task[] };
  reminderMessage?: string;
}

export function DayCard({ day, reminderMessage }: DayCardProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(day.goal || "");
  const [newTaskInput, setNewTaskInput] = useState("");
  
  const updateDayMutation = useUpdateDay();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const handleGoalSave = () => {
    updateDayMutation.mutate({
      id: day.id,
      goal: goalInput
    });
    setIsEditingGoal(false);
  };

  const handleDayCompletionToggle = (checked: boolean) => {
    updateDayMutation.mutate({
      id: day.id,
      isCompleted: checked
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    createTaskMutation.mutate({
      dayId: day.id,
      content: newTaskInput,
      isCompleted: false
    });
    setNewTaskInput("");
  };

  const toggleTask = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      isCompleted: !task.isCompleted
    });
  };

  const isToday = new Date().toDateString() === new Date(day.date).toDateString();

  return (
    <div className={cn(
      "flex flex-col rounded-xl border p-5 transition-all duration-300",
      day.isCompleted 
        ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800" 
        : isToday 
          ? "bg-white dark:bg-card border-primary shadow-lg shadow-primary/5 ring-1 ring-primary/20" 
          : "bg-card border-border"
    )}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Day {day.dayNumber}
          </span>
          <h4 className={cn(
            "text-lg font-display font-bold",
            isToday ? "text-primary" : "text-foreground"
          )}>
            {format(new Date(day.date), "EEEE, MMM d")}
          </h4>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={day.isCompleted || false}
                onCheckedChange={(checked) => handleDayCompletionToggle(checked as boolean)}
                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 w-5 h-5 rounded-md"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mark day as complete</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Reminder Banner */}
      {reminderMessage && (
        <div className="mb-4 bg-secondary/10 border border-secondary/20 rounded-lg p-3 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-secondary-foreground/80 leading-tight">
            {reminderMessage}
          </p>
        </div>
      )}

      {/* Goal Section */}
      <div className="mb-4 group">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Daily Goal</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsEditingGoal(true)}
          >
            <Edit2 className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>
        
        {isEditingGoal ? (
          <div className="flex space-x-2">
            <Input 
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="h-8 text-sm"
              placeholder="Set a goal..."
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleGoalSave()}
            />
            <Button size="sm" className="h-8 w-8 p-0" onClick={handleGoalSave}>
              <Check className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <p 
            className={cn(
              "text-sm font-medium min-h-[1.5rem] cursor-pointer hover:text-primary transition-colors",
              !day.goal && "text-muted-foreground italic font-normal"
            )}
            onClick={() => setIsEditingGoal(true)}
          >
            {day.goal || "Click to set a goal for today..."}
          </p>
        )}
      </div>

      {/* Tasks List */}
      <div className="flex-1 space-y-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase">Tasks</span>
        
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
          {day.tasks?.map((task) => (
            <div 
              key={task.id} 
              className="group flex items-start gap-2 text-sm p-1.5 rounded-md hover:bg-muted/50 transition-colors"
            >
              <Checkbox 
                checked={task.isCompleted || false}
                onCheckedChange={() => toggleTask(task)}
                className="mt-0.5"
              />
              <span className={cn(
                "flex-1 leading-tight break-words",
                task.isCompleted && "line-through text-muted-foreground decoration-muted-foreground/50"
              )}>
                {task.content}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => deleteTaskMutation.mutate(task.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {day.tasks?.length === 0 && (
            <div className="text-xs text-muted-foreground/50 text-center py-2">
              No tasks added yet
            </div>
          )}
        </div>
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleAddTask} className="mt-4 flex items-center gap-2">
        <Input 
          value={newTaskInput}
          onChange={(e) => setNewTaskInput(e.target.value)}
          placeholder="Add task..."
          className="h-8 text-sm bg-background"
        />
        <Button 
          type="submit" 
          size="sm" 
          className="h-8 w-8 p-0 shrink-0"
          disabled={!newTaskInput.trim() || createTaskMutation.isPending}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
