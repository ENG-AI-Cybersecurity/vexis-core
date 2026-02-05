 import { useState, useRef } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Camera, Upload, Check, X, ChevronLeft, ChevronRight, Sparkles, User } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 // Preset avatar options with cyberpunk theme
 const presetAvatars = [
   { id: 'cyber-1', gradient: 'from-green-500 via-emerald-500 to-teal-500', icon: '🤖' },
   { id: 'cyber-2', gradient: 'from-purple-500 via-violet-500 to-fuchsia-500', icon: '👾' },
   { id: 'cyber-3', gradient: 'from-cyan-500 via-blue-500 to-indigo-500', icon: '🎭' },
   { id: 'cyber-4', gradient: 'from-orange-500 via-red-500 to-pink-500', icon: '🔥' },
   { id: 'cyber-5', gradient: 'from-yellow-500 via-amber-500 to-orange-500', icon: '⚡' },
   { id: 'cyber-6', gradient: 'from-rose-500 via-pink-500 to-purple-500', icon: '💎' },
 ];
 
 interface Avatar3DPickerProps {
   isOpen: boolean;
   onClose: () => void;
   currentAvatar: string | null;
   onAvatarChange: (avatar: string) => void;
 }
 
 export function Avatar3DPicker({ isOpen, onClose, currentAvatar, onAvatarChange }: Avatar3DPickerProps) {
   const [selectedPreset, setSelectedPreset] = useState<string | null>(currentAvatar);
   const [customImage, setCustomImage] = useState<string | null>(null);
   const [activeIndex, setActiveIndex] = useState(0);
   const [isUploading, setIsUploading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
 
   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       setIsUploading(true);
       const reader = new FileReader();
       reader.onload = (event) => {
         const result = event.target?.result as string;
         setCustomImage(result);
         setSelectedPreset(null);
         setIsUploading(false);
       };
       reader.readAsDataURL(file);
     }
   };
 
   const handleConfirm = () => {
     if (customImage) {
       onAvatarChange(customImage);
     } else if (selectedPreset) {
       onAvatarChange(selectedPreset);
     }
     onClose();
   };
 
   const nextAvatar = () => {
     setActiveIndex((prev) => (prev + 1) % presetAvatars.length);
     setSelectedPreset(presetAvatars[(activeIndex + 1) % presetAvatars.length].id);
     setCustomImage(null);
   };
 
   const prevAvatar = () => {
     setActiveIndex((prev) => (prev - 1 + presetAvatars.length) % presetAvatars.length);
     setSelectedPreset(presetAvatars[(activeIndex - 1 + presetAvatars.length) % presetAvatars.length].id);
     setCustomImage(null);
   };
 
   return (
     <AnimatePresence>
       {isOpen && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
           onClick={onClose}
         >
           <motion.div
             initial={{ scale: 0.8, rotateY: -30, opacity: 0 }}
             animate={{ scale: 1, rotateY: 0, opacity: 1 }}
             exit={{ scale: 0.8, rotateY: 30, opacity: 0 }}
             transition={{ type: 'spring', stiffness: 200, damping: 20 }}
             className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-6 w-[400px] shadow-2xl"
             onClick={(e) => e.stopPropagation()}
             style={{ perspective: '1000px' }}
           >
             {/* Header */}
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-primary" />
                 <h2 className="text-lg font-bold font-[Orbitron] text-foreground">اختر صورتك</h2>
               </div>
               <button
                 onClick={onClose}
                 className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>
 
             {/* 3D Avatar Preview */}
             <div className="relative h-48 flex items-center justify-center mb-6">
               {/* Navigation Arrows */}
               <button
                 onClick={prevAvatar}
                 className="absolute left-0 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-all hover:scale-110"
               >
                 <ChevronLeft className="w-5 h-5" />
               </button>
 
               {/* 3D Carousel */}
               <div className="relative w-32 h-32" style={{ perspective: '600px' }}>
                 {presetAvatars.map((avatar, index) => {
                   const offset = index - activeIndex;
                   const isActive = index === activeIndex;
 
                   return (
                     <motion.div
                       key={avatar.id}
                       animate={{
                         rotateY: offset * 45,
                         z: isActive ? 50 : -50,
                         scale: isActive ? 1.1 : 0.8,
                         opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.3,
                         x: offset * 60,
                       }}
                       transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                       className={cn(
                         "absolute inset-0 rounded-2xl flex items-center justify-center text-4xl cursor-pointer transition-all",
                         `bg-gradient-to-br ${avatar.gradient}`,
                         isActive && "ring-4 ring-primary/50 shadow-lg shadow-primary/30"
                       )}
                       style={{ transformStyle: 'preserve-3d' }}
                       onClick={() => {
                         setActiveIndex(index);
                         setSelectedPreset(avatar.id);
                         setCustomImage(null);
                       }}
                     >
                       <motion.span
                         animate={{ rotateY: isActive ? [0, 360] : 0 }}
                         transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                         style={{ transformStyle: 'preserve-3d' }}
                       >
                         {avatar.icon}
                       </motion.span>
 
                       {/* Glow effect */}
                       {isActive && (
                         <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                       )}
                     </motion.div>
                   );
                 })}
 
                 {/* Custom Image Preview */}
                 {customImage && (
                   <motion.div
                     initial={{ scale: 0, rotateY: -90 }}
                     animate={{ scale: 1.1, rotateY: 0 }}
                     className="absolute inset-0 rounded-2xl overflow-hidden ring-4 ring-primary/50 shadow-lg shadow-primary/30"
                   >
                     <img src={customImage} alt="Custom" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                   </motion.div>
                 )}
               </div>
 
               <button
                 onClick={nextAvatar}
                 className="absolute right-0 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-all hover:scale-110"
               >
                 <ChevronRight className="w-5 h-5" />
               </button>
             </div>
 
             {/* Preset Thumbnails */}
             <div className="flex gap-2 justify-center mb-6">
               {presetAvatars.map((avatar, index) => (
                 <motion.button
                   key={avatar.id}
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => {
                     setActiveIndex(index);
                     setSelectedPreset(avatar.id);
                     setCustomImage(null);
                   }}
                   className={cn(
                     "w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all",
                     `bg-gradient-to-br ${avatar.gradient}`,
                     activeIndex === index && !customImage && "ring-2 ring-primary"
                   )}
                 >
                   {avatar.icon}
                 </motion.button>
               ))}
             </div>
 
             {/* Upload Section */}
             <div className="border-t border-border/40 pt-4 mb-4">
               <input
                 ref={fileInputRef}
                 type="file"
                 accept="image/*"
                 onChange={handleFileUpload}
                 className="hidden"
               />
               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => fileInputRef.current?.click()}
                 disabled={isUploading}
                 className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border/60 hover:border-primary/50 bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
               >
                 {isUploading ? (
                   <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                 ) : (
                   <>
                     <Upload className="w-5 h-5" />
                     <span className="text-sm font-medium">رفع صورتك الشخصية</span>
                   </>
                 )}
               </motion.button>
             </div>
 
             {/* Action Buttons */}
             <div className="flex gap-3">
               <button
                 onClick={onClose}
                 className="flex-1 py-2.5 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-sm font-medium"
               >
                 إلغاء
               </button>
               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={handleConfirm}
                 className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
               >
                 <Check className="w-4 h-4" />
                 تأكيد
               </motion.button>
             </div>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   );
 }
 
 // Mini avatar button for sidebar
 interface AvatarButtonProps {
   avatar: string | null;
   onClick: () => void;
   collapsed?: boolean;
 }
 
 export function AvatarButton({ avatar, onClick, collapsed }: AvatarButtonProps) {
   const preset = presetAvatars.find(p => p.id === avatar);
 
   return (
     <motion.button
       whileHover={{ scale: 1.05, rotateY: 10 }}
       whileTap={{ scale: 0.95 }}
       onClick={onClick}
       className={cn(
         "relative rounded-xl overflow-hidden transition-all",
         collapsed ? "w-10 h-10" : "w-12 h-12",
         preset ? `bg-gradient-to-br ${preset.gradient}` : "bg-gradient-to-br from-muted to-muted/50"
       )}
       style={{ perspective: '200px', transformStyle: 'preserve-3d' }}
     >
       {/* Content */}
       {avatar?.startsWith('data:') ? (
         <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
       ) : preset ? (
         <motion.div
           className="w-full h-full flex items-center justify-center text-xl"
           animate={{ rotateY: [0, 10, -10, 0] }}
           transition={{ duration: 4, repeat: Infinity }}
         >
           {preset.icon}
         </motion.div>
       ) : (
         <div className="w-full h-full flex items-center justify-center">
           <User className="w-5 h-5 text-muted-foreground" />
         </div>
       )}
 
       {/* Shine effect */}
       <motion.div
         className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0"
         animate={{ x: ['-100%', '100%'] }}
         transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
       />
 
       {/* Ring glow */}
       <div className="absolute inset-0 rounded-xl ring-2 ring-primary/30" />
     </motion.button>
   );
 }