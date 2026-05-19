import { useState } from 'react';
import { Sprout, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import FeatureCard from '@/components/FeatureCard';
import FormInput from '@/components/FormInput';
import WeatherCard from '@/components/WeatherCard';
import ResultCard from '@/components/ResultCard';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

const RecommendCrop = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    location: user?.location || 'Bangalore',
    fertilizer: '100',
    irrigation: '200',
  });
  
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/recommend_crop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: formData.location,
          crop: '',
          fertilizer_kg_per_ha: parseFloat(formData.fertilizer),
          irrigation_mm: parseFloat(formData.irrigation),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        toast.success('Recommendation complete!');
      } else {
        toast.error(data.detail || 'Recommendation failed');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <FeatureCard
        title={t('recommend_header')}
        subtitle={t('recommend_sub')}
        icon={<Sprout className="w-6 h-6" />}
      >
        <div className="grid md:grid-cols-3 gap-4">
          <FormInput
            label={t('location_label')}
            value={formData.location}
            onChange={(value) => setFormData({ ...formData, location: value })}
          />
          
          <FormInput
            label={t('fert_label')}
            type="number"
            value={formData.fertilizer}
            onChange={(value) => setFormData({ ...formData, fertilizer: value })}
            min={0}
            max={1000}
          />
          
          <FormInput
            label={t('irr_label')}
            type="number"
            value={formData.irrigation}
            onChange={(value) => setFormData({ ...formData, irrigation: value })}
            min={0}
            max={2000}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {t('btn_recommend')}
        </Button>
      </FeatureCard>

      {result && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ResultCard
              title={t('recommended_crop')}
              value={result.recommended_crop}
              icon={<Sprout className="w-5 h-5" />}
            />
            
            <ResultCard
              title={t('expected_yield')}
              value={`${result.expected_yield_t_per_ha} t/ha`}
              variant="warning"
            />
            
            <ResultCard
              title={t('best_irrigation')}
              value={`${result.best_irrigation_mm} mm`}
              variant="info"
            />
          </div>

          {result.fertilizer_npk_kg_per_ha && (
            <div className="bg-card rounded-xl p-5 border border-border card-shadow">
              <h3 className="font-semibold text-foreground mb-3">{t('fertilizer_mix')} (kg/ha)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{result.fertilizer_npk_kg_per_ha.N || '-'}</p>
                  <p className="text-sm text-muted-foreground">Nitrogen (N)</p>
                </div>
                <div className="text-center p-3 bg-secondary/10 rounded-lg">
                  <p className="text-2xl font-bold text-secondary">{result.fertilizer_npk_kg_per_ha.P || '-'}</p>
                  <p className="text-sm text-muted-foreground">Phosphorus (P)</p>
                </div>
                <div className="text-center p-3 bg-accent rounded-lg">
                  <p className="text-2xl font-bold text-accent-foreground">{result.fertilizer_npk_kg_per_ha.K || '-'}</p>
                  <p className="text-sm text-muted-foreground">Potassium (K)</p>
                </div>
              </div>
            </div>
          )}

          {result.recommended_fertilizer_names?.length > 0 && (
            <div className="bg-card rounded-xl p-5 border border-border card-shadow">
              <h3 className="font-semibold text-foreground mb-3">Recommended Fertilizers</h3>
              <div className="flex flex-wrap gap-2">
                {result.recommended_fertilizer_names.map((name: string, idx: number) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.weather_used && (
            <WeatherCard weather={result.weather_used} />
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendCrop;
