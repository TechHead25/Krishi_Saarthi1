import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const FeatureCard = ({ title, subtitle, icon, children, className }: FeatureCardProps) => {
  return (
    <div className={cn(
      "bg-card rounded-xl p-6 card-shadow border border-border/50 animate-fade-in",
      "hover:card-shadow-hover transition-all duration-300",
      className
    )}>
      <div className="flex items-start gap-4 mb-6">
        {icon && (
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FeatureCard;
