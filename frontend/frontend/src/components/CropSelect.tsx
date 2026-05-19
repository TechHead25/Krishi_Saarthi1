import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

const CROPS = ['wheat', 'rice', 'maize', 'cotton', 'sugarcane', 'soybean', 'groundnut'];

const cropEmojis: Record<string, string> = {
  wheat: '🌾',
  rice: '🍚',
  maize: '🌽',
  cotton: '🧶',
  sugarcane: '🎋',
  soybean: '🫘',
  groundnut: '🥜',
};

interface CropSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const CropSelect = ({ value, onChange }: CropSelectProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{t('crop_label')}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-background border-input">
          <SelectValue placeholder={t('crop_label')} />
        </SelectTrigger>
        <SelectContent>
          {CROPS.map((crop) => (
            <SelectItem key={crop} value={crop}>
              <span className="flex items-center gap-2">
                <span>{cropEmojis[crop]}</span>
                <span className="capitalize">{crop}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CropSelect;
