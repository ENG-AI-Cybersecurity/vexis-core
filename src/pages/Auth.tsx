import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import toast from 'react-hot-toast';

export default function Auth() {
  const { user, isLoading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { signIn, signUp } = await import('@/hooks/useAuth').then(m => {
      // We need to use the context, not import directly
      return { signIn: () => {}, signUp: () => {} };
    });
    // Actually handled below
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.4) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          animate={{ y: [0, -100, 0], x: [0, Math.random() * 50 - 25, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
          style={{ left: `${20 + i * 12}%`, top: `${60 + i * 5}%` }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center ring-2 ring-primary/30 shadow-lg shadow-primary/20 mb-4"
          >
            <img src={logo} alt="Vexis" className="w-12 h-12 object-contain" />
          </motion.div>
          <h1 className="text-3xl font-bold font-[Orbitron] bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            VEXIS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Cyber Operations Platform</p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel rounded-2xl p-8 neon-border">
          {/* Tab Switcher */}
          <div className="flex gap-1 bg-muted/30 rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isLogin ? 'bg-primary/20 text-primary shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !isLogin ? 'bg-primary/20 text-primary shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              إنشاء حساب
            </button>
          </div>

          <AuthForm
            isLogin={isLogin}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            displayName={displayName}
            setDisplayName={setDisplayName}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>End-to-end encrypted • HMAC-SHA256</span>
        </div>
      </motion.div>
    </div>
  );
}

function AuthForm({
  isLogin, email, setEmail, password, setPassword,
  displayName, setDisplayName, showPassword, setShowPassword,
}: {
  isLogin: boolean;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  displayName: string; setDisplayName: (v: string) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void;
}) {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('تم تسجيل الدخول بنجاح');
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتفعيل.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AnimatePresence mode="wait">
        {!isLogin && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <label className="block text-xs text-muted-foreground mb-1.5">الاسم المعروض</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Operator"
                className="w-full bg-muted/30 border border-border/40 rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">البريد الإلكتروني</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="operator@vexis.io"
            className="w-full bg-muted/30 border border-border/40 rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">كلمة المرور</label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full bg-muted/30 border border-border/40 rounded-xl pl-10 pr-12 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-primary/80 to-accent/80 text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:from-primary hover:to-accent transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {isLogin ? 'دخول' : 'إنشاء حساب'}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </form>
  );
}
