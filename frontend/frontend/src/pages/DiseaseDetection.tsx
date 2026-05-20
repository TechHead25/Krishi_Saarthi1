import { useState, useRef } from 'react';
import { Bug, Upload, CheckCircle2, AlertTriangle, ShieldAlert, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import FeatureCard from '@/components/FeatureCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

const DiseaseDetection = () => {
  const { t } = useLanguage();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderStatus = (result: any) => {
    if (!result) return { label: '', icon: null, status: 'unknown' };
    const status = result.health_status ?? (result.infected === true ? 'infected' : result.infected === false ? 'healthy' : 'unknown');
    const label = status === 'unknown' ? 'Unknown' : t(status);
    return { label, status };
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${BACKEND_URL}/disease_detect`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if ('infected' in data) {
        setResult(data);
        toast.success('Analysis complete!');
      } else {
        toast.error('Unexpected response');
      }
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <FeatureCard
        title={t('disease_header')}
        subtitle={t('disease_sub')}
        icon={<Bug className="w-6 h-6" />}
      >
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
            "hover:border-primary hover:bg-primary/5",
            selectedImage ? "border-primary bg-primary/5" : "border-border"
          )}
        >
          {selectedImage ? (
            <div className="space-y-4">
              <img
                src={selectedImage}
                alt="Selected crop"
                className="max-h-64 mx-auto rounded-lg shadow-md"
              />
              <p className="text-sm text-muted-foreground">Click to change image</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t('upload_image')}</p>
                <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <Button
          onClick={handleAnalyze}
          disabled={!selectedFile || isLoading}
          className="w-full"
        >
          <Bug className="w-4 h-4 mr-2" />
          {t('btn_analyze_disease')}
        </Button>
      </FeatureCard>

      {result && (
        <div className="space-y-4 animate-scale-in">
          {/* Status Card */}
          {(() => {
            const statusMeta = renderStatus(result);
            const isInfected = statusMeta.status === 'infected';
            const isHealthy = statusMeta.status === 'healthy';
            const isUnknown = statusMeta.status === 'unknown';
            return (
              <div
                className={cn(
                  "rounded-xl p-6 border-2",
                  isInfected
                    ? "bg-destructive/10 border-destructive/30"
                    : isUnknown
                    ? "bg-muted/10 border-border"
                    : "bg-primary/10 border-primary/30"
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "p-3 rounded-full",
                      isInfected
                        ? "bg-destructive/20"
                        : isUnknown
                        ? "bg-muted/20"
                        : "bg-primary/20"
                    )}
                  >
                    {isInfected ? (
                      <AlertTriangle className="w-8 h-8 text-destructive" />
                    ) : isUnknown ? (
                      <Lightbulb className="w-8 h-8 text-secondary" />
                    ) : (
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {statusMeta.label}
                    </h3>
                    {result.severity && (
                      <p className="text-sm text-muted-foreground">
                        Severity: <span className="font-medium">{result.severity}</span>
                      </p>
                    )}
                    {result.confidence && (
                      <p className="text-sm text-muted-foreground">
                        Confidence: <span className="font-medium">{result.confidence}%</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Details */}
          <div className="grid md:grid-cols-2 gap-4">
            {(result.disease_name || result.species_name || (result.species && (Array.isArray(result.species.commonNames) ? result.species.commonNames[0] : result.species.scientificName))) && (
              <div className="bg-card rounded-xl p-5 border border-border card-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                  <h4 className="font-semibold text-foreground">{result.disease_name ? t('disease_name') : 'Species'}</h4>
                </div>
                <p className="text-foreground">{result.disease_name || result.species_name || (result.species && (Array.isArray(result.species.commonNames) ? result.species.commonNames[0] : result.species.scientificName))}</p>
              </div>
            )}

            {result.advice && (
              <div className="bg-card rounded-xl p-5 border border-border card-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-secondary" />
                  <h4 className="font-semibold text-foreground">{t('advice')}</h4>
                </div>
                <p className="text-foreground">{result.advice}</p>
              </div>
            )}
          </div>

          {/* PlantNet suggestions (if available) */}
          {result.raw?.results && result.raw.results.length > 0 && (
            <div className="bg-card rounded-xl p-5 border border-border card-shadow">
              <h4 className="font-semibold mb-3">Top species suggestions</h4>
              <ul className="list-disc list-inside space-y-2">
                {result.raw.results.slice(0, 6).map((s: any, idx: number) => {
                  const sp = s.species || {};
                  const common = Array.isArray(sp.commonNames) && sp.commonNames.length ? sp.commonNames[0] : null;
                  const sci = sp.scientificNameWithoutAuthor || sp.scientificName || (sp.scientificName && sp.scientificName.split(' ').slice(0,2).join(' ')) || 'Unknown';
                  const name = common || sci;
                  const score = Math.round((s.score || s.probability || 0) * 100 * 100) / 100; // 2 decimals
                  return (
                    <li key={idx} className="flex justify-between">
                      <span>{name}</span>
                      <span className="text-sm text-muted-foreground">{score}%</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {result.prevention && (
            <div className="bg-card rounded-xl p-5 border border-border card-shadow">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">{t('prevention')}</h4>
              </div>
              <p className="text-foreground">{result.prevention}</p>
            </div>
          )}

          <div className="bg-card rounded-xl p-5 border border-border card-shadow">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-secondary" />
              <h4 className="font-semibold text-foreground">Plant Biology Insight</h4>
            </div>
            <p className="text-foreground">
              This tool combines disease detection with plant biology concepts: leaf anatomy, pathogen stress, and nutrient balance.
            </p>
            <ul className="mt-3 list-disc list-inside text-foreground gap-2">
              <li>Nitrogen helps leaf growth and chlorophyll production.</li>
              <li>Phosphorus supports root development and energy transfer.</li>
              <li>Potassium improves water regulation and disease resistance.</li>
            </ul>
          </div>

          {result.mode && (
            <p className="text-xs text-muted-foreground text-center">
              Detection mode: {result.mode}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;
