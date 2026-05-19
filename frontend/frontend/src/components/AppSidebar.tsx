import { 
  BarChart3, 
  Sprout, 
  Settings2, 
  MessageSquare, 
  Store, 
  Bug, 
  LogOut,
  Leaf,
  Globe
} from 'lucide-react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const AppSidebar = () => {
  const { t, lang, setLang } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { title: t('nav_predict'), url: '/predict', icon: BarChart3 },
    { title: t('nav_recommend'), url: '/recommend', icon: Sprout },
    { title: t('nav_optimize'), url: '/optimize', icon: Settings2 },
    { title: t('nav_chat'), url: '/chat', icon: MessageSquare },
    { title: t('nav_market'), url: '/market', icon: Store },
    { title: t('nav_disease'), url: '/disease', icon: Bug },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sidebar-primary/20">
            <Leaf className="w-6 h-6 text-sidebar-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">{t('title')}</h1>
            <p className="text-xs text-sidebar-foreground/60">{t('subtitle')}</p>
          </div>
        </div>
        
        {user && (
          <div className="mt-4 p-3 rounded-lg bg-sidebar-accent/50">
            <p className="text-sm text-sidebar-foreground/60">{t('welcome_back')}</p>
            <p className="font-semibold text-sidebar-foreground">{user.name}</p>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <RouterNavLink
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                        "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                        isActive(item.url) && "bg-sidebar-accent text-sidebar-primary font-semibold"
                      )}
                    >
                      <item.icon className={cn(
                        "w-5 h-5",
                        isActive(item.url) && "text-sidebar-primary"
                      )} />
                      <span>{item.title}</span>
                    </RouterNavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sidebar-foreground/60" />
          <Select value={lang} onValueChange={(value: any) => setLang(value)}>
            <SelectTrigger className="flex-1 bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
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
        
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('nav_logout')}</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
