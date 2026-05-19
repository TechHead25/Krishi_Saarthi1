import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, User, Lock, Phone, MapPin, UserPlus, LogIn, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

const Login = () => {
  const { t, lang, setLang } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    name: '', phone: '', location: '', username: '', password: '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        login({ name: data.name, location: data.location });
        toast.success('Login successful!');
        navigate('/predict');
      } else {
        toast.error(data.detail || 'Invalid credentials');
      }
    } catch (error) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.name || !signupData.phone || !signupData.location || 
        !signupData.username || !signupData.password) {
      toast.error('All fields are required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Account created! Please login.');
        setSignupData({ name: '', phone: '', location: '', username: '', password: '' });
      } else {
        toast.error(data.detail || 'Signup failed');
      }
    } catch (error) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-primary-foreground">
          <div className="p-4 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm mb-8">
            <Leaf className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">{t('title')}</h1>
          <p className="text-xl opacity-90 text-center max-w-md">{t('subtitle')}</p>
          
          <div className="mt-12 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-4 py-3">
              <span className="text-2xl">🌾</span>
              <span>{t('nav_predict')}</span>
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-4 py-3">
              <span className="text-2xl">🌱</span>
              <span>{t('nav_recommend')}</span>
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-4 py-3">
              <span className="text-2xl">🤖</span>
              <span>{t('nav_chat')}</span>
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-4 py-3">
              <span className="text-2xl">🏪</span>
              <span>{t('nav_market')}</span>
            </div>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col">
        {/* Language Selector */}
        <div className="flex justify-end p-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={lang} onValueChange={(value: any) => setLang(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-fade-in">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                <Leaf className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-foreground">{t('login_title')}</h2>
              <p className="text-muted-foreground mt-2">{t('welcome_back')}</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="login" className="text-sm font-medium">
                  {t('farmer_login_tab')}
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-medium">
                  {t('farmer_signup_tab')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('username')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        className="pl-10"
                        placeholder={t('username')}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10"
                        placeholder={t('password')}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12" disabled={isLoading}>
                    <LogIn className="w-4 h-4 mr-2" />
                    {t('login')}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('full_name')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        className="pl-10"
                        placeholder={t('full_name')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('phone')}</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          value={signupData.phone}
                          onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('village_city')}</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          value={signupData.location}
                          onChange={(e) => setSignupData({ ...signupData, location: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('username')}</Label>
                    <Input
                      type="text"
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('password')}</Label>
                    <Input
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full h-12" disabled={isLoading}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('create_account')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="pt-4 border-t border-border">
              <Button 
                variant="ghost" 
                onClick={handleAdminLogin}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                <Shield className="w-4 h-4 mr-2" />
                {t('btn_admin_login')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
