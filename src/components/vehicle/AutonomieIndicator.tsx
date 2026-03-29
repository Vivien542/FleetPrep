// Indicateur d'autonomie adaptatif :
// - Électrique : icône batterie + pourcentage (0-100%)
// - Thermique : jauge graphique (0-8)

import { Battery, BatteryCharging, Fuel } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AutonomieIndicatorProps {
  autonomie: number;
  carburant: string;
  className?: string;
  showLabel?: boolean;
}

function getBatteryColor(pct: number): string {
  if (pct >= 60) return 'text-green-400';
  if (pct >= 30) return 'text-yellow-400';
  return 'text-red-400';
}

function getJaugeColor(level: number): string {
  if (level >= 5) return 'bg-green-500';
  if (level >= 3) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function AutonomieIndicator({ autonomie, carburant, className, showLabel = true }: AutonomieIndicatorProps) {
  if (carburant === 'Electrique') {
    const color = getBatteryColor(autonomie);
    const Icon = autonomie > 80 ? BatteryCharging : Battery;
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <Icon className={cn('w-4 h-4', color)} />
        {showLabel && (
          <span className={cn('text-sm font-medium', color)}>{autonomie}%</span>
        )}
      </div>
    );
  }

  // Thermique : barre visuelle sur 8 segments
  const segments = Array.from({ length: 8 }, (_, i) => i < autonomie);
  const color = getJaugeColor(autonomie);

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Fuel className="w-4 h-4 text-gray-400 shrink-0" />
      <div className="flex gap-0.5 items-center">
        {segments.map((filled, i) => (
          <div
            key={i}
            className={cn(
              'w-2.5 h-3 rounded-sm transition-colors',
              filled ? color : 'bg-gray-700'
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-400">{autonomie}/8</span>
      )}
    </div>
  );
}
