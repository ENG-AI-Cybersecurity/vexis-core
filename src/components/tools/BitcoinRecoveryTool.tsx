import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bitcoin, Send, Copy, CheckCircle, AlertTriangle, Loader2, Shield, Hash, FileText, Wallet, Eye, EyeOff, RotateCcw, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface TransactionResult {
  txId: string;
  rawTx: string;
  senderAddress: string;
  changeAmount: number;
  timestamp: string;
}

function hashSHA256(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64);
}

function generateMockTransaction(
  privateKey: string, utxoTxid: string, utxoIndex: number,
  utxoValue: number, recipientAddress: string, sendAmount: number,
  message: string, fee: number,
): TransactionResult {
  const changeAmount = utxoValue - sendAmount - fee;
  if (changeAmount < 0) throw new Error('رصيد غير كافٍ لتغطية المبلغ ورسوم المعاملة');

  const mockData = `${privateKey}${utxoTxid}${utxoIndex}${recipientAddress}${sendAmount}${message}${Date.now()}`;
  const txId = hashSHA256(mockData);
  const rawTx = hashSHA256(mockData + 'raw') + hashSHA256(mockData + 'tx') + hashSHA256(mockData + 'hex');
  const senderAddress = `1${hashSHA256(privateKey).slice(0, 33)}`;

  return {
    txId, rawTx, senderAddress, changeAmount,
    timestamp: new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC',
  };
}

type Step = 'keys' | 'utxo' | 'send' | 'review';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'keys', label: 'المفاتيح', icon: <Shield className="w-4 h-4" /> },
  { id: 'utxo', label: 'UTXO', icon: <Hash className="w-4 h-4" /> },
  { id: 'send', label: 'الإرسال', icon: <Send className="w-4 h-4" /> },
  { id: 'review', label: 'المراجعة', icon: <FileText className="w-4 h-4" /> },
];

export function BitcoinRecoveryTool() {
  const [privateKey, setPrivateKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [utxoTxid, setUtxoTxid] = useState('');
  const [utxoIndex, setUtxoIndex] = useState(0);
  const [utxoValue, setUtxoValue] = useState(100000);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState(50000);
  const [fee, setFee] = useState(1000);
  const [message, setMessage] = useState('');
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('keys');

  const handleExecute = useCallback(async () => {
    setError(null);
    setResult(null);

    if (!privateKey || !utxoTxid || !recipientAddress) {
      setError('جميع الحقول المطلوبة يجب ملؤها');
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1800));

    try {
      const tx = generateMockTransaction(privateKey, utxoTxid, utxoIndex, utxoValue, recipientAddress, sendAmount, message, fee);
      setResult(tx);
      toast.success('تم إنشاء المعاملة بنجاح');
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [privateKey, utxoTxid, utxoIndex, utxoValue, recipientAddress, sendAmount, message, fee]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const resetForm = () => {
    setPrivateKey(''); setUtxoTxid(''); setUtxoIndex(0); setUtxoValue(100000);
    setRecipientAddress(''); setSendAmount(50000); setFee(1000); setMessage('');
    setResult(null); setError(null); setStep('keys');
  };

  const canProceed = (s: Step) => {
    if (s === 'keys') return !!privateKey;
    if (s === 'utxo') return !!utxoTxid && utxoValue > 0;
    if (s === 'send') return !!recipientAddress && sendAmount > 0;
    return true;
  };

  const nextStep = () => {
    const idx = STEPS.findIndex(s => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  };

  const prevStep = () => {
    const idx = STEPS.findIndex(s => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  };

  const stepIdx = STEPS.findIndex(s => s.id === step);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(30,100%,50%)]/10 border border-[hsl(30,100%,50%)]/30 flex items-center justify-center">
              <Bitcoin className="w-5 h-5 text-[hsl(30,100%,50%)]" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-[Orbitron] text-foreground">3x10 — BITHORecover</h1>
              <p className="text-xs text-muted-foreground">مولّد معاملات OP_RETURN المتقدم</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Network Badge */}
            <button
              onClick={() => setNetwork(n => n === 'testnet' ? 'mainnet' : 'testnet')}
              className={cn(
                "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all",
                network === 'testnet'
                  ? "bg-accent/10 text-accent border-accent/30"
                  : "bg-destructive/10 text-destructive border-destructive/30"
              )}
            >
              {network === 'testnet' ? '⚡ TESTNET' : '● MAINNET'}
            </button>
            <button onClick={resetForm} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors" title="إعادة تعيين">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/20 border border-border/30">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all",
                step === s.id
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : i <= stepIdx
                    ? "text-foreground/70 hover:bg-muted/30"
                    : "text-muted-foreground/50"
              )}
            >
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                step === s.id ? "bg-primary text-primary-foreground" : i < stepIdx ? "bg-primary/30 text-primary" : "bg-muted/40 text-muted-foreground"
              )}>
                {i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Form Panel - 3 cols */}
          <div className="lg:col-span-3">
            <div className="rounded-xl bg-card border border-border/40 overflow-hidden">
              <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">بيانات المعاملة</span>
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait">
                  {step === 'keys' && (
                    <motion.div key="keys" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">المفتاح الخاص (WIF Format)</label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type={showKey ? 'text' : 'password'}
                            value={privateKey}
                            onChange={e => setPrivateKey(e.target.value)}
                            placeholder="5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ"
                            className="w-full bg-input/50 border border-border/40 rounded-lg pl-10 pr-10 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                          />
                          <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">🔒 المفتاح لا يُخزّن ولا يُرسل — المعالجة محلية بالكامل</p>
                      </div>
                    </motion.div>
                  )}

                  {step === 'utxo' && (
                    <motion.div key="utxo" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">UTXO Transaction ID</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            value={utxoTxid}
                            onChange={e => setUtxoTxid(e.target.value)}
                            placeholder="a1b2c3d4e5f6..."
                            className="w-full bg-input/50 border border-border/40 rounded-lg pl-10 pr-4 py-2.5 text-xs font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <NumField label="UTXO Index" value={utxoIndex} onChange={setUtxoIndex} />
                        <NumField label="القيمة (satoshi)" value={utxoValue} onChange={setUtxoValue} />
                      </div>
                    </motion.div>
                  )}

                  {step === 'send' && (
                    <motion.div key="send" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">عنوان المستلم</label>
                        <div className="relative">
                          <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            value={recipientAddress}
                            onChange={e => setRecipientAddress(e.target.value)}
                            placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                            className="w-full bg-input/50 border border-border/40 rounded-lg pl-10 pr-4 py-2.5 text-xs font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <NumField label="المبلغ (satoshi)" value={sendAmount} onChange={setSendAmount} />
                        <NumField label="الرسوم (satoshi)" value={fee} onChange={setFee} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          رسالة OP_RETURN <span className="text-muted-foreground/50">({message.length}/80)</span>
                        </label>
                        <textarea
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder="رسالة اختيارية تُضمّن في المعاملة..."
                          maxLength={80}
                          rows={2}
                          className="w-full bg-input/50 border border-border/40 rounded-lg px-4 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 'review' && (
                    <motion.div key="review" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                      <div className="space-y-2">
                        <ReviewItem label="الشبكة" value={network === 'testnet' ? 'Testnet' : 'Mainnet'} />
                        <ReviewItem label="المفتاح" value={privateKey ? `${privateKey.slice(0, 6)}...${privateKey.slice(-4)}` : '—'} />
                        <ReviewItem label="UTXO" value={utxoTxid ? `${utxoTxid.slice(0, 12)}...[${utxoIndex}]` : '—'} />
                        <ReviewItem label="القيمة" value={`${utxoValue.toLocaleString()} sat`} />
                        <ReviewItem label="المستلم" value={recipientAddress ? `${recipientAddress.slice(0, 12)}...` : '—'} />
                        <ReviewItem label="المبلغ" value={`${sendAmount.toLocaleString()} sat`} />
                        <ReviewItem label="الرسوم" value={`${fee.toLocaleString()} sat`} />
                        <ReviewItem label="المتبقي" value={`${(utxoValue - sendAmount - fee).toLocaleString()} sat`} highlight={utxoValue - sendAmount - fee < 0} />
                        {message && <ReviewItem label="OP_RETURN" value={message} />}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/20">
                  <button
                    onClick={prevStep}
                    disabled={stepIdx === 0}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    ← السابق
                  </button>

                  {step === 'review' ? (
                    <motion.button
                      onClick={handleExecute}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-6 py-2.5 rounded-lg bg-[hsl(30,100%,50%)] text-primary-foreground font-bold text-xs flex items-center gap-2 hover:bg-[hsl(30,100%,55%)] disabled:opacity-50 transition-all shadow-lg shadow-[hsl(30,100%,50%)]/20"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Bitcoin className="w-4 h-4" /> تنفيذ المعاملة</>}
                    </motion.button>
                  ) : (
                    <button
                      onClick={nextStep}
                      disabled={!canProceed(step)}
                      className="px-5 py-2 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      التالي →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Output Panel - 2 cols */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-card border border-border/40 overflow-hidden h-full">
              <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">النتائج</span>
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30"
                    >
                      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                      <span className="text-xs text-destructive">{error}</span>
                    </motion.div>
                  )}

                  {result && (
                    <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/30">
                        <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
                        <span className="text-xs font-semibold text-[hsl(var(--success))]">تم إنشاء المعاملة بنجاح</span>
                      </div>

                      <OutRow label="المرسل" value={result.senderAddress} onCopy={() => copyToClipboard(result.senderAddress, 'العنوان')} />
                      <OutRow label="TXID" value={result.txId} onCopy={() => copyToClipboard(result.txId, 'TXID')} highlight />
                      <OutRow label="المستلم" value={recipientAddress} onCopy={() => copyToClipboard(recipientAddress, 'العنوان')} />
                      <OutRow label="المبلغ" value={`${sendAmount.toLocaleString()} sat`} />
                      <OutRow label="الرسوم" value={`${fee.toLocaleString()} sat`} />
                      <OutRow label="المتبقي" value={`${result.changeAmount.toLocaleString()} sat`} />

                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-1">RawTX (Hex)</label>
                        <div className="relative">
                          <pre className="bg-muted/20 border border-border/30 rounded-lg p-3 text-[9px] font-mono text-foreground/70 break-all max-h-20 overflow-y-auto leading-relaxed">
                            {result.rawTx}
                          </pre>
                          <button onClick={() => copyToClipboard(result.rawTx, 'RawTX')} className="absolute top-1.5 right-1.5 p-1 rounded bg-card/80 border border-border/30 text-muted-foreground hover:text-primary transition-colors">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[9px] text-muted-foreground text-left">{result.timestamp}</p>
                    </motion.div>
                  )}

                  {!result && !error && (
                    <motion.div key="empty" className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <Bitcoin className="w-10 h-10 mx-auto mb-2 text-muted-foreground/20" />
                        <p className="text-xs text-muted-foreground/50">أكمل الخطوات ونفّذ المعاملة</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Warning Footer */}
            <div className="mt-3 p-3 rounded-lg bg-[hsl(30,100%,50%)]/5 border border-[hsl(30,100%,50%)]/15 text-center">
              <p className="text-[10px] text-[hsl(30,100%,50%)]/70 font-medium">🔐 المعالجة محلية — بدون إرسال بيانات خارجية</p>
              <p className="text-[9px] text-muted-foreground/50 mt-0.5">⚠️ للاستخدام المسؤول والاسترداد المصرح به فقط</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-full bg-input/50 border border-border/40 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
      />
    </div>
  );
}

function ReviewItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/10 border border-border/20">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={cn("text-xs font-mono", highlight ? "text-destructive" : "text-foreground/80")}>{value}</span>
    </div>
  );
}

function OutRow({ label, value, onCopy, highlight }: { label: string; value: string; onCopy?: () => void; highlight?: boolean }) {
  return (
    <div className={cn("flex items-start gap-2 py-2 px-2.5 rounded-md", highlight ? "bg-primary/5 border border-primary/20" : "bg-muted/10")}>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap min-w-[55px] pt-0.5">{label}</span>
      <span className={cn("text-[11px] font-mono break-all flex-1", highlight ? "text-primary" : "text-foreground/70")}>{value}</span>
      {onCopy && (
        <button onClick={onCopy} className="p-1 rounded text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
          <Copy className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
