// Page Planning — vue semaine
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sun, Moon, Star, AlertTriangle } from 'lucide-react';
import { dayRepository } from '@/repositories/dayRepository';
import { userRepository } from '@/repositories/userRepository';
import type { DayRecord } from '@/types';
import { cn } from '@/lib/cn';

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const JOURS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function PlanningPage() {
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMondayOfWeek(new Date()));

  const weekDays = dayRepository.getWeek(toDateStr(currentMonday));
  const allUsers = userRepository.getAll();

  const getUserName = (id: string): string => {
    const u = allUsers.find((u) => u.id === id);
    return u ? (u.prenom || u.nom) : id;
  };

  const goToPrevWeek = () => setCurrentMonday((d) => addDays(d, -7));
  const goToNextWeek = () => setCurrentMonday((d) => addDays(d, 7));
  const goToThisWeek = () => setCurrentMonday(getMondayOfWeek(new Date()));

  const todayStr = toDateStr(new Date());

  const mondayLabel = currentMonday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const sundayLabel = addDays(currentMonday, 6).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Planning</h1>
          <p className="text-sm text-gray-500">{mondayLabel} — {sundayLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevWeek}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToThisWeek}
            className="px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-all"
          >
            Aujourd'hui
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vue semaine — grille responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {weekDays.map((day, i) => {
          const dayDate = addDays(currentMonday, i);
          const dateStr = toDateStr(dayDate);
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;
          const hasData = day.personnel.equipeMatin.length > 0 || day.personnel.equipeSoir.length > 0;

          return (
            <DayCard
              key={dateStr}
              day={day}
              label={JOURS_FR[i]}
              dateStr={dateStr}
              isToday={isToday}
              isPast={isPast}
              hasData={hasData}
              getUserName={getUserName}
            />
          );
        })}
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-yellow-400" />Équipe matin</div>
        <div className="flex items-center gap-1.5"><Moon className="w-3.5 h-3.5 text-blue-400" />Équipe soir</div>
        <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-300" />Chef d'équipe</div>
      </div>
    </div>
  );
}

// ─── Carte journée ──────────────────────────────────────────────────────────────

function DayCard({
  day, label, dateStr, isToday, isPast, hasData, getUserName
}: {
  day: DayRecord;
  label: string;
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
  hasData: boolean;
  getUserName: (id: string) => string;
}) {
  return (
    <div className={cn(
      'bg-gray-900 border rounded-xl p-3 flex flex-col gap-2.5',
      isToday ? 'border-blue-700 ring-1 ring-blue-700/50' : 'border-gray-800',
      isPast && !isToday && 'opacity-60',
    )}>
      {/* Date */}
      <div className="flex items-center justify-between">
        <div>
          <span className={cn(
            'text-xs font-semibold uppercase tracking-wider',
            isToday ? 'text-blue-400' : 'text-gray-500'
          )}>
            {label}
          </span>
          <p className={cn(
            'text-sm font-bold',
            isToday ? 'text-blue-300' : 'text-gray-300'
          )}>
            {new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </p>
        </div>
        {isToday && (
          <span className="text-xs px-1.5 py-0.5 bg-blue-800 text-blue-300 rounded font-medium">
            Auj.
          </span>
        )}
      </div>

      {!hasData ? (
        <p className="text-xs text-gray-700 italic">—</p>
      ) : (
        <>
          {/* Stats */}
          {(day.departs !== undefined || day.retours !== undefined) && (
            <div className="flex gap-2 text-xs">
              {day.departs !== undefined && (
                <span className="text-green-400 font-medium">↑ {day.departs}</span>
              )}
              {day.retours !== undefined && (
                <span className="text-orange-400 font-medium">↓ {day.retours}</span>
              )}
              {day.stats.nombreVehiculesPrepares > 0 && (
                <span className="text-gray-500">{day.stats.nombreVehiculesPrepares} prép.</span>
              )}
            </div>
          )}

          {/* Chefs */}
          {(day.personnel.chefs?.length ?? 0) > 0 && (
            <div>
              <div className="flex flex-wrap gap-1">
                {day.personnel.chefs!.map((id) => (
                  <span key={id} className="text-xs px-1.5 py-0.5 bg-yellow-900/30 text-yellow-400 border border-yellow-800/50 rounded flex items-center gap-1">
                    <Star className="w-2.5 h-2.5" />
                    {getUserName(id)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Équipe matin */}
          {day.personnel.equipeMatin.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <Sun className="w-3 h-3 text-yellow-500" /> Matin
              </p>
              <div className="flex flex-wrap gap-1">
                {day.personnel.equipeMatin.map((id) => (
                  <span key={id} className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded">
                    {getUserName(id)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Équipe soir */}
          {day.personnel.equipeSoir.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <Moon className="w-3 h-3 text-blue-400" /> Soir
              </p>
              <div className="flex flex-wrap gap-1">
                {day.personnel.equipeSoir.map((id) => (
                  <span key={id} className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded">
                    {getUserName(id)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CDD / intérimaires */}
          {(day.personnel.cdd?.length ?? 0) + (day.personnel.interimaires?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {[...(day.personnel.cdd || []), ...(day.personnel.interimaires || [])].map((name, i) => (
                <span key={i} className="text-xs px-1.5 py-0.5 bg-gray-800/60 text-gray-500 border border-gray-700 rounded">
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* Absences */}
          {day.absencesRetards && (
            <div className="bg-red-900/20 border border-red-900/40 rounded p-1.5">
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                {day.absencesRetards}
              </p>
            </div>
          )}

          {/* Notes */}
          {day.notes && (
            <div className="bg-gray-800/60 rounded p-1.5">
              <p className="text-xs text-gray-400">{day.notes}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
