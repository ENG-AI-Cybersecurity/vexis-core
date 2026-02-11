import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
 import {
   Terminal,
   Shield,
   Eye,
   Settings,
   Activity,
   Cpu,
   HardDrive,
   Wifi,
   ChevronRight,
   ChevronDown,
   MessageSquare,
   Bitcoin,
   BarChart3,
   Globe,
   Target,
   Bomb,
   Store,
   Wallet,
   Code,
   Crown,
   Star,
   User,
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import logo from '@/assets/logo.png';
 import { Avatar3DPicker, AvatarButton } from '@/components/avatar/Avatar3DPicker';
 import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
 
 const AVATAR_STORAGE_KEY = 'vexis-user-avatar';
 
 interface NavItem {
   id: string;
   label: string;
   labelAr?: string;
   icon: React.ReactNode;
   shortcut?: string;
 }
 
 interface NavGroup {
   title: string;
   titleAr: string;
   items: NavItem[];
   defaultOpen?: boolean;
 }
 
 const navGroups: NavGroup[] = [
   {
     title: 'Dashboards',
     titleAr: 'لوحات التحكم',
     defaultOpen: true,
     items: [
       { id: 'user-dashboard', label: 'User Panel', labelAr: 'لوحة المستخدم', icon: <User className="w-4 h-4" />, shortcut: '⌃1' },
       { id: 'member-dashboard', label: 'Member Panel', labelAr: 'لوحة العضو', icon: <Star className="w-4 h-4" />, shortcut: '⌃2' },
       { id: 'admin-dashboard', label: 'Admin Panel', labelAr: 'لوحة المدير', icon: <Crown className="w-4 h-4" />, shortcut: '⌃3' },
     ]
   },
   {
     title: 'Operations',
     titleAr: 'العمليات',
     defaultOpen: true,
     items: [
       { id: 'dashboard', label: 'Terminal Matrix', labelAr: 'مصفوفة الطرفية', icon: <Terminal className="w-4 h-4" />, shortcut: '⌃4' },
       { id: 'labs', label: 'Lab Manager', labelAr: 'مدير المختبرات', icon: <Cpu className="w-4 h-4" />, shortcut: '⌃5' },
     ]
   },
   {
     title: 'Security',
     titleAr: 'الأمان',
     defaultOpen: false,
     items: [
       { id: 'robin', label: 'Dark Web Monitor', labelAr: 'مراقب الويب المظلم', icon: <Eye className="w-4 h-4" />, shortcut: '⌃6' },
       { id: 'tunneling', label: 'Stealth Tunneling', labelAr: 'الأنفاق المخفية', icon: <Globe className="w-4 h-4" /> },
       { id: 'payload', label: 'Payload Factory', labelAr: 'مصنع الحمولات', icon: <Bomb className="w-4 h-4" /> },
       { id: 'security', label: 'System Security', labelAr: 'أمان النظام', icon: <Shield className="w-4 h-4" />, shortcut: '⌃7' },
     ]
   },
   {
     title: 'Marketplace',
     titleAr: 'السوق',
     defaultOpen: false,
     items: [
       { id: 'script-market', label: 'Script Market', labelAr: 'سوق السكربتات', icon: <Store className="w-4 h-4" /> },
       { id: 'vendor-forge', label: 'Vendor Forge', labelAr: 'مطرقة البائع', icon: <Code className="w-4 h-4" /> },
       { id: 'wallet', label: 'Vexis Wallet', labelAr: 'محفظة فيكسيس', icon: <Wallet className="w-4 h-4" /> },
       { id: 'crypto', label: 'Crypto Store', labelAr: 'متجر الكريبتو', icon: <Bitcoin className="w-4 h-4" /> },
     ]
   },
   {
     title: 'Community',
     titleAr: 'المجتمع',
     defaultOpen: false,
     items: [
       { id: 'missions', label: 'Missions', labelAr: 'المهمات', icon: <Target className="w-4 h-4" /> },
       { id: 'forum', label: 'Secret Forum', labelAr: 'المنتدى السري', icon: <MessageSquare className="w-4 h-4" /> },
       { id: 'analytics', label: 'Analytics', labelAr: 'التحليلات', icon: <BarChart3 className="w-4 h-4" /> },
     ]
   }
 ];
 
 interface SidebarProps {
   activeView: string;
   onViewChange: (view: string) => void;
   onOpenNotifications?: () => void;
 }
 
  export function Sidebar({ activeView, onViewChange }: SidebarProps) {
    const { profile, role } = useAuth();
   const [collapsed, setCollapsed] = useState(false);
   const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
   const [userAvatar, setUserAvatar] = useState<string | null>(null);
   const [hoveredItem, setHoveredItem] = useState<string | null>(null);
   const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
     navGroups.reduce((acc, group) => ({ ...acc, [group.title]: group.defaultOpen ?? false }), {})
   );
 
   useEffect(() => {
     const saved = localStorage.getItem(AVATAR_STORAGE_KEY);
     if (saved) setUserAvatar(saved);
   }, []);
 
   const handleAvatarChange = (avatar: string) => {
     setUserAvatar(avatar);
     localStorage.setItem(AVATAR_STORAGE_KEY, avatar);
   };
 
   const toggleGroup = (title: string) => {
     if (collapsed) return;
     setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
   };
 
   const getActiveGroup = () => {
     for (const group of navGroups) {
       if (group.items.some(item => item.id === activeView)) return group.title;
     }
     return null;
   };
 
   const activeGroup = getActiveGroup();
 
   return (
     <>
       <motion.aside
         initial={{ x: -20, opacity: 0 }}
         animate={{ x: 0, opacity: 1 }}
         className={cn(
           "relative flex flex-col h-screen bg-gradient-to-b from-card via-card/98 to-card/95 backdrop-blur-xl border-r border-border/30 transition-all duration-300 shadow-2xl",
           collapsed ? "w-[72px]" : "w-72"
         )}
       >
         {/* Top accent line */}
         <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
 
         {/* Logo */}
         <div className="flex items-center gap-3 p-4 border-b border-border/20">
           <div className="relative flex-shrink-0">
             <motion.div 
               whileHover={{ scale: 1.05, rotate: 5 }}
               className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center overflow-hidden ring-2 ring-primary/30 shadow-lg shadow-primary/10"
             >
               <img src={logo} alt="Vexis" className="w-8 h-8 object-contain" />
             </motion.div>
             <motion.div 
               animate={{ scale: [1, 1.2, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-card shadow-lg shadow-green-500/50" 
             />
           </div>
           <AnimatePresence>
             {!collapsed && (
               <motion.div
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -10 }}
                 className="flex flex-col overflow-hidden flex-1"
               >
                 <span className="font-bold text-lg font-[Orbitron] bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent tracking-wider">VEXIS</span>
                 <span className="text-[10px] text-muted-foreground font-medium tracking-wide">Cyber Operations v2.4.1</span>
               </motion.div>
             )}
           </AnimatePresence>
         </div>
 
         {/* User Avatar Section */}
         <div className={cn(
           "p-3 border-b border-border/20",
           collapsed ? "flex justify-center" : "flex items-center gap-3"
         )}>
           <AvatarButton 
             avatar={userAvatar} 
             onClick={() => setAvatarPickerOpen(true)}
             collapsed={collapsed}
           />
           <AnimatePresence>
             {!collapsed && (
               <motion.div
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -10 }}
                 className="flex-1 min-w-0"
               >
                  <p className="text-sm font-semibold text-foreground truncate">{profile?.display_name || 'Operator'}</p>
                  <p className="text-[11px] text-primary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {role === 'admin' ? 'مدير' : role === 'member' ? 'عضو' : 'متصل'}
                  </p>
               </motion.div>
             )}
           </AnimatePresence>
         </div>
 
         {/* Navigation */}
         <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-1.5 scrollbar-thin">
           {navGroups.map((group) => (
             <div key={group.title} className="mb-1">
               {!collapsed && (
                 <button
                   onClick={() => toggleGroup(group.title)}
                   className={cn(
                     "w-full flex items-center justify-between px-3 py-2.5 text-[11px] uppercase tracking-wider font-semibold transition-all rounded-lg",
                     activeGroup === group.title 
                       ? "text-primary bg-primary/5" 
                       : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                   )}
                 >
                   <span className="flex items-center gap-2">
                     {activeGroup === group.title && (
                       <motion.div 
                         layoutId="activeGroupIndicator"
                         className="w-1 h-4 rounded-full bg-primary"
                       />
                     )}
                     {group.titleAr}
                   </span>
                   <motion.div
                     animate={{ rotate: openGroups[group.title] ? 180 : 0 }}
                     transition={{ duration: 0.2 }}
                   >
                     <ChevronDown className="w-3.5 h-3.5" />
                   </motion.div>
                 </button>
               )}
               <AnimatePresence initial={false}>
                 {(collapsed || openGroups[group.title]) && (
                   <motion.div
                     initial={collapsed ? false : { height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.2 }}
                     className="overflow-hidden space-y-0.5"
                   >
                     {group.items.map((item) => (
                       <Tooltip key={item.id} delayDuration={0}>
                         <TooltipTrigger asChild>
                           <motion.button
                             whileHover={{ x: collapsed ? 0 : 6 }}
                             whileTap={{ scale: 0.98 }}
                             onClick={() => onViewChange(item.id)}
                             onMouseEnter={() => setHoveredItem(item.id)}
                             onMouseLeave={() => setHoveredItem(null)}
                             className={cn(
                               "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                               activeView === item.id
                                 ? "bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/15 text-primary shadow-lg shadow-primary/5"
                                 : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                             )}
                           >
                             {activeView === item.id && (
                               <motion.div
                                 layoutId="activeNavItem"
                                 className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-primary to-accent"
                               />
                             )}
                             <span className={cn(
                               "transition-all flex-shrink-0 relative",
                               activeView === item.id ? "text-primary" : "group-hover:text-primary"
                             )}>
                               {item.icon}
                               {activeView === item.id && (
                                 <motion.div
                                   className="absolute inset-0 blur-md bg-primary/50"
                                   animate={{ opacity: [0.5, 1, 0.5] }}
                                   transition={{ duration: 2, repeat: Infinity }}
                                 />
                               )}
                             </span>
                             <AnimatePresence>
                               {!collapsed && (
                                 <motion.div
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   exit={{ opacity: 0 }}
                                   className="flex-1 flex items-center justify-between min-w-0"
                                 >
                                   <span className="text-sm font-medium truncate">{item.labelAr || item.label}</span>
                                   {item.shortcut && hoveredItem === item.id && (
                                     <motion.span
                                       initial={{ opacity: 0, x: 10 }}
                                       animate={{ opacity: 1, x: 0 }}
                                       className="text-[10px] px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground font-mono"
                                     >
                                       {item.shortcut}
                                     </motion.span>
                                   )}
                                 </motion.div>
                               )}
                             </AnimatePresence>
                           </motion.button>
                         </TooltipTrigger>
                         {collapsed && (
                           <TooltipContent side="right" className="font-medium">
                             {item.labelAr || item.label}
                             {item.shortcut && (
                               <span className="ml-2 text-muted-foreground">{item.shortcut}</span>
                             )}
                           </TooltipContent>
                         )}
                       </Tooltip>
                     ))}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
           ))}
         </nav>
 
         {/* System Stats */}
         <AnimatePresence>
           {!collapsed && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               className="px-3 py-3 border-t border-border/20 space-y-2 bg-muted/20"
             >
               <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                 حالة النظام
               </div>
               <SystemStat icon={<Cpu className="w-3.5 h-3.5" />} label="CPU" value="23%" color="green" />
               <SystemStat icon={<HardDrive className="w-3.5 h-3.5" />} label="RAM" value="1.2GB" color="orange" />
               <SystemStat icon={<Activity className="w-3.5 h-3.5" />} label="WSL2" value="Active" color="blue" />
               <SystemStat icon={<Wifi className="w-3.5 h-3.5" />} label="Network" value="Secured" color="green" />
             </motion.div>
           )}
         </AnimatePresence>
 
         {/* Collapse Toggle */}
         <button
           onClick={() => setCollapsed(!collapsed)}
           className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-card border border-border/50 shadow-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all hover:scale-110 hover:shadow-primary/20"
         >
           <motion.div animate={{ rotate: collapsed ? 0 : 180 }}>
             <ChevronRight className="w-4 h-4" />
           </motion.div>
         </button>
 
         {/* Settings */}
         <div className="p-3 border-t border-border/20">
           <Tooltip delayDuration={0}>
             <TooltipTrigger asChild>
               <motion.button
                 whileHover={{ x: collapsed ? 0 : 4 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => onViewChange('settings')}
                 className={cn(
                   "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                   activeView === 'settings'
                     ? "bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/15 text-primary shadow-lg shadow-primary/5"
                     : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                 )}
               >
                 <motion.div
                   animate={activeView === 'settings' ? { rotate: 90 } : { rotate: 0 }}
                   transition={{ duration: 0.3 }}
                 >
                   <Settings className="w-4 h-4 flex-shrink-0" />
                 </motion.div>
                 <AnimatePresence>
                   {!collapsed && (
                     <motion.span
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="text-sm font-medium flex-1 text-right"
                     >
                       الإعدادات
                     </motion.span>
                   )}
                 </AnimatePresence>
               </motion.button>
             </TooltipTrigger>
             {collapsed && (
               <TooltipContent side="right" className="font-medium">
                 الإعدادات
               </TooltipContent>
             )}
           </Tooltip>
         </div>
       </motion.aside>
 
       {/* Avatar Picker Modal */}
       <Avatar3DPicker
         isOpen={avatarPickerOpen}
         onClose={() => setAvatarPickerOpen(false)}
         currentAvatar={userAvatar}
         onAvatarChange={handleAvatarChange}
       />
     </>
   );
 }
 
 function SystemStat({ 
   icon, 
   label, 
   value, 
   color 
 }: { 
   icon: React.ReactNode; 
   label: string; 
   value: string; 
   color: 'green' | 'orange' | 'blue';
 }) {
   const colorClasses = {
     green: 'text-green-500',
     orange: 'text-orange-500',
     blue: 'text-blue-500',
   };
 
   return (
     <motion.div 
       whileHover={{ x: 2 }}
       className="flex items-center gap-2 text-xs group cursor-default"
     >
       <span className={cn(colorClasses[color], "transition-all group-hover:scale-110")}>{icon}</span>
       <span className="text-muted-foreground flex-1">{label}</span>
       <span className={cn("font-medium font-mono", colorClasses[color])}>{value}</span>
     </motion.div>
   );
 }
