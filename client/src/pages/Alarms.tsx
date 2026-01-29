import { useState, useEffect, useRef } from "react";
import { useAlarms, useCreateAlarm, useUpdateAlarm, useDeleteAlarm } from "@/hooks/use-alarms";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Bell, BellOff, Trash2, Clock, Volume2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Alarm } from "@shared/schema";

const DAYS_OF_WEEK_KEYS = ["days.sun", "days.mon", "days.tue", "days.wed", "days.thu", "days.fri", "days.sat"];
const DAYS_OF_WEEK_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Alarms() {
  const { data: alarms, isLoading } = useAlarms();
  const createAlarm = useCreateAlarm();
  const updateAlarm = useUpdateAlarm();
  const deleteAlarm = useDeleteAlarm();
  const { t } = useLanguage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  const [formName, setFormName] = useState("");
  const [formTime, setFormTime] = useState("08:00");
  const [formMessage, setFormMessage] = useState("");
  const [formRepeatDays, setFormRepeatDays] = useState<string[]>([]);

  const [activeAlarmId, setActiveAlarmId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkAlarms = () => {
      if (!alarms) return;
      
      const now = new Date();
      const currentTime = format(now, "HH:mm");
      const currentDay = DAYS_OF_WEEK_EN[now.getDay()];

      alarms.forEach((alarm) => {
        if (!alarm.isEnabled) return;
        if (alarm.time !== currentTime) return;
        
        const repeatDays = alarm.repeatDays || [];
        if (repeatDays.length > 0 && !repeatDays.includes(currentDay)) return;

        triggerAlarm(alarm);
      });
    };

    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [alarms]);

  const triggerAlarm = (alarm: Alarm) => {
    if (activeAlarmId === alarm.id) return;
    
    setActiveAlarmId(alarm.id);

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(t("app.title"), {
        body: alarm.message || alarm.name,
        icon: "/favicon.png",
      });
    }

    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    setTimeout(() => {
      setActiveAlarmId(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, 60000);
  };

  const dismissAlarm = () => {
    setActiveAlarmId(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormTime("08:00");
    setFormMessage("");
    setFormRepeatDays([]);
    setEditingAlarm(null);
  };

  const openEdit = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setFormName(alarm.name);
    setFormTime(alarm.time);
    setFormMessage(alarm.message || "");
    setFormRepeatDays(alarm.repeatDays || []);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const data = {
      name: formName || "Alarm",
      time: formTime,
      message: formMessage || null,
      repeatDays: formRepeatDays.length > 0 ? formRepeatDays : null,
      isEnabled: true,
      sound: "default",
    };

    if (editingAlarm) {
      await updateAlarm.mutateAsync({ id: editingAlarm.id, ...data });
    } else {
      await createAlarm.mutateAsync(data);
    }
    setDialogOpen(false);
    resetForm();
  };

  const toggleDay = (day: string) => {
    setFormRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[80vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const activeAlarm = alarms?.find((a) => a.id === activeAlarmId);

  return (
    <div className="space-y-8 animate-in-fade">
      <audio ref={audioRef} loop>
        <source src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" type="audio/ogg" />
      </audio>

      {activeAlarm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 text-center space-y-6 animate-pulse">
            <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
              <Bell className="w-10 h-10 text-primary animate-bounce" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{activeAlarm.name}</h2>
              <p className="text-lg text-muted-foreground mt-2">{activeAlarm.message || t("alarms.reminderTime")}</p>
              <p className="text-4xl font-mono font-bold mt-4">{activeAlarm.time}</p>
            </div>
            <Button size="lg" onClick={dismissAlarm} className="w-full">
              <Volume2 className="w-5 h-5 mr-2" />
              {t("alarms.dismiss")}
            </Button>
          </Card>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">{t("alarms.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("alarms.subtitle")}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-alarm">
              <Plus className="w-4 h-4 mr-2" />
              {t("alarms.addAlarm")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAlarm ? t("alarms.editAlarm") : t("alarms.newAlarm")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("alarms.name")}</label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t("alarms.namePlaceholder")}
                  data-testid="input-alarm-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("alarms.time")}</label>
                <Input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="text-2xl h-14 font-mono"
                  data-testid="input-alarm-time"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("alarms.message")}</label>
                <Input
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder={t("alarms.messagePlaceholder")}
                  data-testid="input-alarm-message"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">{t("alarms.repeat")}</label>
                <div className="flex gap-1 flex-wrap">
                  {DAYS_OF_WEEK_EN.map((day, index) => (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      variant={formRepeatDays.includes(day) ? "default" : "outline"}
                      onClick={() => toggleDay(day)}
                      className="w-10"
                      data-testid={`button-day-${day}`}
                    >
                      {t(DAYS_OF_WEEK_KEYS[index]).charAt(0)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formRepeatDays.length === 0 ? t("alarms.repeatEveryDay") : `${t("alarms.repeatOn")} ${formRepeatDays.map((d, i) => t(DAYS_OF_WEEK_KEYS[DAYS_OF_WEEK_EN.indexOf(d)])).join(", ")}`}
                </p>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={createAlarm.isPending || updateAlarm.isPending}
                className="w-full"
                data-testid="button-save-alarm"
              >
                {(createAlarm.isPending || updateAlarm.isPending) ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingAlarm ? t("alarms.updateAlarm") : t("alarms.createAlarm")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!alarms || alarms.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">{t("alarms.noAlarms")}</h3>
          <p className="text-muted-foreground">{t("alarms.createFirst")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alarms.map((alarm) => (
            <Card
              key={alarm.id}
              className={cn(
                "p-6 hover-elevate cursor-pointer transition-all",
                !alarm.isEnabled && "opacity-50"
              )}
              onClick={() => openEdit(alarm)}
              data-testid={`card-alarm-${alarm.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {alarm.isEnabled ? (
                      <Bell className="w-4 h-4 text-primary" />
                    ) : (
                      <BellOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{alarm.name}</span>
                  </div>
                  <p className="text-3xl font-mono font-bold">{alarm.time}</p>
                  {alarm.message && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{alarm.message}</p>
                  )}
                  {alarm.repeatDays && alarm.repeatDays.length > 0 && (
                    <div className="flex gap-1 mt-3">
                      {DAYS_OF_WEEK_EN.map((day, index) => (
                        <span
                          key={day}
                          className={cn(
                            "w-6 h-6 rounded-full text-xs flex items-center justify-center",
                            alarm.repeatDays?.includes(day)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {t(DAYS_OF_WEEK_KEYS[index]).charAt(0)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Switch
                    checked={alarm.isEnabled || false}
                    onCheckedChange={(checked) => {
                      updateAlarm.mutate({ id: alarm.id, isEnabled: checked });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`switch-alarm-${alarm.id}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAlarm.mutate(alarm.id);
                    }}
                    className="text-destructive hover:text-destructive"
                    data-testid={`button-delete-alarm-${alarm.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
