// Badges de statut véhicule — max 3 états métier : pneu neige, maintenance, buy/back
import { Wrench, ShoppingCart, Snowflake } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Vehicle } from '@/types';

interface VehicleStatusBadgesProps {
  vehicle: Vehicle;
  size?: 'sm' | 'md';
}

export function VehicleStatusBadges({ vehicle, size = 'sm' }: VehicleStatusBadgesProps) {
  const hasBadge = vehicle.maintenance || vehicle.buyBack || vehicle.pneuNeige;
  if (!hasBadge) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {vehicle.maintenance && (
        <Badge variant="maintenance" size={size}>
          <Wrench className="w-3 h-3" />
          Maintenance
        </Badge>
      )}
      {vehicle.buyBack && (
        <Badge variant="buyback" size={size}>
          <ShoppingCart className="w-3 h-3" />
          Buy/Back
        </Badge>
      )}
      {vehicle.pneuNeige && (
        <Badge variant="neige" size={size}>
          <Snowflake className="w-3 h-3" />
          Pneus neige
        </Badge>
      )}
    </div>
  );
}
