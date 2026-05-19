import { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import FeatureCard from '@/components/FeatureCard';
import FormInput from '@/components/FormInput';
import CropSelect from '@/components/CropSelect';
import WeatherCard from '@/components/WeatherCard';
import ResultCard from '@/components/ResultCard';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

const PredictYield = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    crop: 'wheat',
    location: user?.location || 'Bangalore',
    fertilizer: '100',
    irrigation: '200',
  });
  
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: formData.crop,
          location: formData.location,
          fertilizer_kg_per_ha: parseFloat(formData.fertilizer),
          irrigation_mm: parseFloat(formData.irrigation),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        toast.success('Prediction complete!');
      } else {
        toast.error(data.detail || 'Prediction failed');
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
        title={t('predict_header')}
        subtitle={t('predict_sub')}
        icon={<BarChart3 className="w-6 h-6" />}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <CropSelect
            value={formData.crop}
            onChange={(value) => setFormData({ ...formData, crop: value })}
          />
          
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
          <TrendingUp className="w-4 h-4 mr-2" />
          {t('btn_predict')}
        </Button>
      </FeatureCard>

      {result && (
        <div className="grid md:grid-cols-2 gap-6">
          <ResultCard
            title={t('predicted_yield')}
            value={`${result.predicted_yield_t_per_ha} t/ha`}
            subtitle={`Crop: ${formData.crop}`}
            icon={<BarChart3 className="w-5 h-5" />}
          />
          
          {result.weather_used && (
            <WeatherCard weather={result.weather_used} />
          )}
        </div>
      )}
    </div>
  );
};

export default PredictYield;
