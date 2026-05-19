import { useState } from 'react';
import { Store, Search, MapPin, IndianRupee, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import FeatureCard from '@/components/FeatureCard';
import FormInput from '@/components/FormInput';
import CropSelect from '@/components/CropSelect';
import ResultCard from '@/components/ResultCard';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

const BestMarket = () => {
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
      const response = await fetch(`${BACKEND_URL}/best_market`, {
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
        toast.success('Market analysis complete!');
      } else {
        toast.error(data.detail || 'Analysis failed');
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
        title={t('market_header')}
        subtitle={t('market_sub')}
        icon={<Store className="w-6 h-6" />}
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
          <Search className="w-4 h-4 mr-2" />
          {t('btn_best_market')}
        </Button>
      </FeatureCard>

      {result?.best_market && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border-2 border-primary/30 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('best_market')}</p>
                <h3 className="text-2xl font-bold text-foreground">{result.best_market.market}</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-card rounded-lg shadow-sm">
                <IndianRupee className="w-5 h-5 mx-auto mb-2 text-secondary" />
                <p className="text-2xl font-bold text-foreground">₹{result.best_market.price_per_quintal}</p>
                <p className="text-xs text-muted-foreground">{t('price_quintal')}</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg shadow-sm">
                <Truck className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold text-foreground">{result.best_market.distance_km}</p>
                <p className="text-xs text-muted-foreground">{t('distance')}</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg shadow-sm">
                <IndianRupee className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">₹{result.best_market.net_profit}</p>
                <p className="text-xs text-muted-foreground">{t('net_profit')}</p>
              </div>
            </div>
          </div>

          {result.all_market_comparisons?.length > 0 && (
            <div className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">All Markets Comparison</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Market</TableHead>
                      <TableHead className="text-right">Price (₹/quintal)</TableHead>
                      <TableHead className="text-right">Distance (km)</TableHead>
                      <TableHead className="text-right">Transport Cost (₹)</TableHead>
                      <TableHead className="text-right">Net Profit (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.all_market_comparisons.map((market: any, idx: number) => (
                      <TableRow 
                        key={idx}
                        className={market.market === result.best_market.market ? 'bg-primary/5' : ''}
                      >
                        <TableCell className="font-medium">
                          <span className="flex items-center gap-2">
                            {market.market === result.best_market.market && (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            )}
                            {market.market}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">₹{market.price_per_quintal}</TableCell>
                        <TableCell className="text-right">{market.distance_km}</TableCell>
                        <TableCell className="text-right">₹{market.transport_cost}</TableCell>
                        <TableCell className="text-right font-semibold">₹{market.net_profit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BestMarket;
