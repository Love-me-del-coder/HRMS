import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  style?: React.CSSProperties;
  title?: string;
  actions?: React.ReactNode;
}

export function Card({ children, className = '', glass = true, hover = false, padding = 'md', onClick, style, title, actions }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };
  
  return (
    <div
      className={`
        rounded-lg
        dark:bg-dark-surface bg-light-surface dark:border-dark-border border-light-border border
        ${hover ? 'hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer' : ''}
        ${paddings[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      style={style}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold dark:text-text-dark-primary text-text-light-primary">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning';
  icon: React.ReactNode;
  iconBg?: string;
  delay?: number;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon, iconBg = 'bg-primary-500', delay = 0 }: StatCardProps) {
  return (
    <Card hover className="animate-slide-up" style={{ animationDelay: `${delay}ms` } as React.CSSProperties}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium dark:text-text-dark-secondary text-text-light-secondary mb-1">{title}</p>
          <p className="text-3xl font-bold dark:text-text-dark-primary text-text-light-primary animate-count-up">{value}</p>
          {change && (
            <p className={`text-xs mt-2 font-medium ${
              changeType === 'positive' ? 'text-success' :
              changeType === 'negative' ? 'text-danger' :
              changeType === 'warning' ? 'text-warning' :
              'dark:text-text-dark-tertiary text-text-light-tertiary'
            }`}>
              {changeType === 'positive' && '↑ '}
              {changeType === 'negative' && '↓ '}
              {change}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-md ${iconBg} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
