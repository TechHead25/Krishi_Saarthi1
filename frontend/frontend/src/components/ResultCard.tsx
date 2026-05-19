import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ResultCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'success' | 'warning' | 'info';
  className?: string;
}

const ResultCard = ({ title, value, subtitle, icon, variant = 'success', className }: ResultCardProps) => {
  const variantStyles = {
    success: 'bg-primary/10 border-primary/30 text-primary',
    warning: 'bg-secondary/10 border-secondary/30 text-secondary',
    info: 'bg-accent border-accent-foreground/20 text-accent-foreground',
  };

  return (
    <div className={cn(
      "rounded-xl p-5 border-2 animate-scale-in",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-sm opacity-70 mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 rounded-full bg-background/50">
          {icon || (variant === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />)}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
