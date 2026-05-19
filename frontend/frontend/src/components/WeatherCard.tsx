import { Cloud, Droplets, Thermometer, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WeatherData {
  avg_temp_c?: number;
  humidity_pct?: number;
  rainfall_mm?: number;
  city?: string;
  country?: string;
}

interface WeatherCardProps {
  weather: WeatherData;
}

const WeatherCard = ({ weather }: WeatherCardProps) => {
  const { t } = useLanguage();

  if (!weather) return null;

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/30 rounded-xl p-5 border border-primary/20 animate-scale-in">
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">{t('weather')}</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Thermometer className="w-4 h-4 text-secondary" />
          <span className="text-sm text-muted-foreground">{t('temperature')}:</span>
          <span className="font-medium text-foreground">{weather.avg_temp_c ?? '-'} °C</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Droplets className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">{t('humidity')}:</span>
          <span className="font-medium text-foreground">{weather.humidity_pct ?? '-'}%</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Cloud className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t('rainfall')}:</span>
          <span className="font-medium text-foreground">{weather.rainfall_mm ?? '-'} mm</span>
        </div>
        
        {(weather.city || weather.country) && (
          <div className="flex items-center gap-3 pt-2 border-t border-border/50">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">
              {weather.city}{weather.country ? `, ${weather.country}` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherCard;
