import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, Bell, Loader2 } from "lucide-react";
import { useCycles } from "@/hooks/use-cycles";
import { useLanguage } from "@/contexts/LanguageContext";

export function Sidebar() {
  const [location] = useLocation();
  const { data: cycles, isLoading } = useCycles();
  const { t } = useLanguage();
  
  // Find active cycle
  const activeCycle = cycles?.find(c => c.status === 'active') || cycles?.find(c => c.status === 'upcoming');

  const navItems = [
    { label: t("nav.dashboard"), icon: LayoutDashboard, href: "/" },
    { label: t("nav.currentCycle"), icon: Calendar, href: activeCycle ? `/cycle/${activeCycle.id}` : "/" },
    { label: t("nav.alarms"), icon: Bell, href: "/alarms" },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 p-4">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
          CC
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg leading-tight">{t("app.title")}</span>
          <span className="text-xs text-muted-foreground">{t("app.subtitle")}</span>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.label} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-primary/10 text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border">
        <div className="px-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">{t("nav.cycleProgress")}</h4>
          {isLoading ? (
            <div className="flex justify-center p-2"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
          ) : activeCycle ? (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-medium text-foreground">Cycle #{activeCycle.cycleNumber}</span>
                <span className={cn(
                  "font-bold", 
                  activeCycle.status === 'active' ? "text-primary" : "text-muted-foreground"
                )}>{activeCycle.status}</span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse" style={{ width: '40%' }}></div> 
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{t("nav.noActiveCycles")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
