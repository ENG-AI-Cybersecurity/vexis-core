import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bitcoin, Send, Copy, CheckCircle, AlertTriangle, Loader2, Zap, Shield, Hash, ArrowDownUp, FileText } from 'lucide-react';
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
  // Simple mock hash for UI display
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64);
}

function generateMockTransaction(
  privateKey: string,
  utxoTxid: string,
  utxoIndex: number,
  utxoValue: number,
  recipientAddress: string,
  sendAmount: number,
  message: string,
  fee: number,
): TransactionResult {
  const changeAmount = utxoValue - sendAmount - fee;
  if (changeAmount < 0) throw new Error('رصيد غير كافٍ لتغطية المبلغ ورسوم المعاملة');

  const mockData = `${privateKey}${utxoTxid}${utxoIndex}${recipientAddress}${sendAmount}${message}${Date.now()}`;
  const txId = hashSHA256(mockData);
  const rawTx = hashSHA256(mockData + 'raw') + hashSHA256(mockData + 'tx') + hashSHA256(mockData + 'hex');
  const senderAddress = `1${hashSHA256(privateKey).slice(0, 33)}`;

  return {
    txId,
    rawTx,
    senderAddress,
    changeAmount,
    timestamp: new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC',
  };
}

export function BitcoinRecoveryTool() {
  const [privateKey, setPrivateKey] = useState('');
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

  const handleExecute = async () => {
    setError(null);
    setResult(null);

    if (!privateKey || !utxoTxid || !recipientAddress || !message) {
      setError('جميع الحقول مطلوبة!');
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));

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
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10 border border-orange-500/30 mb-4">
          <Zap className="w-6 h-6 text-orange-400" />
          <h1 className="text-2xl font-bold font-[Orbitron] bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
            3x10 — BITHORecover
          </h1>
          <Zap className="w-6 h-6 text-orange-400" />
        </div>
        <p className="text-sm text-muted-foreground">أداة استعادة البيتكوين المتقدمة — مولّد معاملات OP_RETURN</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Input Section */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-2xl bg-card/80 border border-border/40 p-6 space-y-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
              <FileText className="w-4 h-4" />
              <span>بيانات المعاملة</span>
            </div>

            {/* Network Toggle */}
            <div className="flex gap-2">
              {(['testnet', 'mainnet'] as const).map(n => (
                <button
                  key={n}
                  onClick={() => setNetwork(n)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-medium transition-all border",
                    network === n
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-muted/20 text-muted-foreground border-border/30 hover:bg-muted/40"
                  )}
                >
                  {n === 'testnet' ? '🧪 Testnet' : '🔴 Mainnet'}
                </button>
              ))}
            </div>

            <InputField icon={<Shield className="w-4 h-4" />} label="المفتاح الخاص (WIF)" placeholder="Enter Private Key (WIF format)" value={privateKey} onChange={setPrivateKey} type="password" />
            <InputField icon={<Hash className="w-4 h-4" />} label="UTXO TXID" placeholder="Enter UTXO Transaction ID (hex)" value={utxoTxid} onChange={setUtxoTxid} mono />

            <div className="grid grid-cols-2 gap-3">
              <NumberField label="UTXO Index" value={utxoIndex} onChange={setUtxoIndex} />
              <NumberField label="قيمة UTXO (sat)" value={utxoValue} onChange={setUtxoValue} />
            </div>

            <InputField icon={<Send className="w-4 h-4" />} label="عنوان المستلم" placeholder="Enter recipient BTC address" value={recipientAddress} onChange={setRecipientAddress} mono />

            <div className="grid grid-cols-2 gap-3">
              <NumberField label="المبلغ المرسل (sat)" value={sendAmount} onChange={setSendAmount} />
              <NumberField label="الرسوم (sat)" value={fee} onChange={setFee} />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">رسالة OP_RETURN (حد 80 بايت)</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter message for OP_RETURN"
                maxLength={80}
                rows={3}
                className="w-full bg-muted/20 border border-border/40 rounded-xl px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
              />
              <div className="text-right text-[10px] text-muted-foreground mt-1">{message.length}/80</div>
            </div>

            {/* Execute Button */}
            <motion.button
              onClick={handleExecute}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500/80 to-yellow-500/80 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:from-orange-500 hover:to-yellow-500 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Bitcoin className="w-5 h-5" />
                  🚀 إنشاء المعاملة
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Output Section */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-2xl bg-card/80 border border-border/40 p-6 backdrop-blur-sm min-h-[400px] flex flex-col">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-4">
              <ArrowDownUp className="w-4 h-4" />
              <span>نتائج المعاملة</span>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive"
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}

              {result && (
                <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 flex-1">
                  <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold text-sm">✓ تم إنشاء المعاملة بنجاح</span>
                  </div>

                  <ResultRow label="عنوان المرسل" value={result.senderAddress} onCopy={() => copyToClipboard(result.senderAddress, 'العنوان')} />
                  <ResultRow label="TXID الجديد" value={result.txId} onCopy={() => copyToClipboard(result.txId, 'TXID')} highlight />
                  <ResultRow label="عنوان المستلم" value={recipientAddress} onCopy={() => copyToClipboard(recipientAddress, 'العنوان')} />
                  <ResultRow label="المبلغ المرسل" value={`${sendAmount} satoshi`} />
                  <ResultRow label="الرسوم" value={`${fee} satoshi`} />
                  <ResultRow label="المتبقي" value={`${result.changeAmount} satoshi`} />
                  <ResultRow label="رسالة OP_RETURN" value={message} />

                  <div className="mt-3">
                    <label className="block text-xs text-muted-foreground mb-1.5">RawTX (Hex)</label>
                    <div className="relative">
                      <pre className="bg-muted/20 border border-border/30 rounded-xl p-3 text-[10px] font-mono text-primary/80 break-all max-h-24 overflow-y-auto">
                        {result.rawTx}
                      </pre>
                      <button onClick={() => copyToClipboard(result.rawTx, 'RawTX')} className="absolute top-2 right-2 p-1.5 rounded-lg bg-card/80 border border-border/30 text-muted-foreground hover:text-primary transition-colors">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-muted-foreground mt-2">
                    Generated: {result.timestamp}
                  </div>
                </motion.div>
              )}

              {!result && !error && (
                <motion.div key="empty" className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Bitcoin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">أدخل البيانات واضغط "إنشاء المعاملة"</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Warning */}
          <div className="mt-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 text-center">
            <p className="text-xs text-orange-400/80">
              🔐 3x10 — BITHORecover Advanced Crypto Recovery Tool
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              ⚠️ للاستخدام المسؤول فقط — لأغراض الاسترداد المصرح بها
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InputField({ icon, label, placeholder, value, onChange, type = 'text', mono }: {
  icon: React.ReactNode; label: string; placeholder: string;
  value: string; onChange: (v: string) => void; type?: string; mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-muted/20 border border-border/40 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all",
            mono && "font-mono text-xs"
          )}
        />
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-full bg-muted/20 border border-border/40 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
      />
    </div>
  );
}

function ResultRow({ label, value, onCopy, highlight }: { label: string; value: string; onCopy?: () => void; highlight?: boolean }) {
  return (
    <div className={cn("flex items-start gap-3 p-2.5 rounded-lg", highlight ? "bg-primary/5 border border-primary/20" : "bg-muted/10")}>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap min-w-[90px] pt-0.5">{label}:</span>
      <span className={cn("text-xs font-mono break-all flex-1", highlight ? "text-primary" : "text-foreground/80")}>{value}</span>
      {onCopy && (
        <button onClick={onCopy} className="p-1 rounded text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
          <Copy className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
