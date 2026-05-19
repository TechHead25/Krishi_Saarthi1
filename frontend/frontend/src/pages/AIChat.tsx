import { useState, useRef } from 'react';
import { MessageSquare, Send, Mic, Upload, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import FeatureCard from '@/components/FeatureCard';
import FormInput from '@/components/FormInput';
import CropSelect from '@/components/CropSelect';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIChat = () => {
  const { t } = useLanguage();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [formData, setFormData] = useState({
    crop: 'wheat',
    fertilizer: '100',
    irrigation: '200',
    temperature: '26',
    humidity: '70',
    rainfall: '120',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!input.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          crop: formData.crop,
          fertilizer_kg_per_ha: parseFloat(formData.fertilizer),
          irrigation_mm: parseFloat(formData.irrigation),
          avg_temp_c: parseFloat(formData.temperature),
          humidity_pct: parseFloat(formData.humidity),
          rainfall_mm: parseFloat(formData.rainfall),
        }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        toast.error('No response from AI');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch(`${BACKEND_URL}/voice_chat`, {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.question) {
        setMessages(prev => [...prev, { role: 'user', content: data.question }]);
      }
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (error) {
      toast.error('Voice processing failed');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <FeatureCard
        title={t('chat_header')}
        subtitle={t('chat_sub')}
        icon={<MessageSquare className="w-6 h-6" />}
      >
        {/* Context Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-muted/50 rounded-lg">
          <CropSelect
            value={formData.crop}
            onChange={(value) => setFormData({ ...formData, crop: value })}
          />
          <FormInput
            label={t('fert_label')}
            type="number"
            value={formData.fertilizer}
            onChange={(value) => setFormData({ ...formData, fertilizer: value })}
          />
          <FormInput
            label={t('irr_label')}
            type="number"
            value={formData.irrigation}
            onChange={(value) => setFormData({ ...formData, irrigation: value })}
          />
          <FormInput
            label={t('temperature')}
            type="number"
            value={formData.temperature}
            onChange={(value) => setFormData({ ...formData, temperature: value })}
          />
          <FormInput
            label={t('humidity')}
            type="number"
            value={formData.humidity}
            onChange={(value) => setFormData({ ...formData, humidity: value })}
          />
          <FormInput
            label={t('rainfall')}
            type="number"
            value={formData.rainfall}
            onChange={(value) => setFormData({ ...formData, rainfall: value })}
          />
        </div>

        {/* Chat Messages */}
        <div className="h-80 overflow-y-auto border border-border rounded-lg p-4 space-y-4 bg-background">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Start a conversation with the AI farming assistant</p>
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5",
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted text-foreground rounded-tl-none'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-secondary" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <Textarea
            placeholder={t('ai_question')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="min-h-[60px] resize-none"
          />
          <div className="flex flex-col gap-2">
            <Button onClick={handleSend} disabled={isLoading} size="icon">
              <Send className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleVoiceUpload}
          className="hidden"
        />

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Upload className="w-3 h-3" />
          {t('ai_voice_upload')}
        </p>
      </FeatureCard>
    </div>
  );
};

export default AIChat;
