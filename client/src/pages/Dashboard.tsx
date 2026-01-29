import { useState } from "react";
import { useCycles, useInitializeCycles } from "@/hooks/use-cycles";
import { Button } from "@/components/ui/button";
import { CycleCard } from "@/components/CycleCard";
import { Loader2, Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: cycles, isLoading } = useCycles();
  const initCyclesMutation = useInitializeCycles();
  const [date, setDate] = useState<Date>(new Date());
  const [initDialogOpen, setInitDialogOpen] = useState(false);

  const handleInitialize = async () => {
    try {
      await initCyclesMutation.mutateAsync({ startDate: date });
      setInitDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[80vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Show setup screen if no cycles exist
  if (!cycles || cycles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[80vh] max-w-2xl mx-auto text-center px-4 animate-in-fade">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <CalendarIcon className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-4">Welcome to CycleCal</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The year is divided into 36 cycles of 10 days each. This structure helps you focus on short-term goals while building long-term momentum. Ready to start your year?
        </p>

        <Dialog open={initDialogOpen} onOpenChange={setInitDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all">
              Initialize Your Year
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>When does your first cycle start?</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <p className="text-sm text-muted-foreground">
                We'll generate 36 cycles (360 days) starting from this date.
              </p>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button 
                onClick={handleInitialize} 
                disabled={initCyclesMutation.isPending}
                className="w-full h-12 mt-2"
              >
                {initCyclesMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Cycles...
                  </>
                ) : (
                  "Start Journey"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const activeCycle = cycles.find(c => c.status === 'active') || cycles.find(c => c.status === 'upcoming');
  const completedCount = cycles.filter(c => c.status === 'completed').length;
  const totalCycles = cycles.length;
  const progress = (completedCount / totalCycles) * 100;

  return (
    <div className="space-y-8 animate-in-fade">
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Your Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Tracking your progress across 36 cycles
          </p>
        </div>
        <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Year Progress</div>
          <div className="h-8 w-[1px] bg-border mx-2"></div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold font-display text-primary">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Active Cycle Hero */}
      {activeCycle && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Current Focus</h2>
          </div>
          <CycleCard cycle={activeCycle} isActive={true} />
        </section>
      )}

      {/* All Cycles Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">All Cycles</h2>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500"></span>
              Completed
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              Active
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-muted border border-foreground/20"></span>
              Upcoming
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cycles.map((cycle) => (
            <CycleCard key={cycle.id} cycle={cycle} />
          ))}
        </div>
      </section>
    </div>
  );
}
