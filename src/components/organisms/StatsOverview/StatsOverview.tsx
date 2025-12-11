import React from 'react';
import { StatsCard } from '../../molecules';

interface Stat {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface StatsOverviewProps {
  stats: Stat[];
  className?: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
        />
      ))}
    </div>
  );
};

